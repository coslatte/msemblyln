use std::io::BufRead;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::mpsc;

use crate::types::{ProbeResponse, RenderRequest, RenderResponse};

#[derive(Clone, Debug)]
pub enum ProgressEvent {
  Progress(ProgressInfo),
  Done(RenderResponse),
  Error(String),
}

fn ffmpeg_bin() -> String {
  std::env::var("MSEMBLYLN_FFMPEG").unwrap_or_else(|_| "ffmpeg".into())
}

fn ffprobe_bin() -> String {
  std::env::var("MSEMBLYLN_FFPROBE").unwrap_or_else(|_| "ffprobe".into())
}

fn resolve_output_path(request: &RenderRequest) -> Result<PathBuf, String> {
  if let Some(output) = &request.output_path {
    let path = PathBuf::from(output);
    if let Some(parent) = path.parent() {
      std::fs::create_dir_all(parent)
        .map_err(|err| format!("failed to create output directory: {err}"))?;
    }
    return Ok(path);
  }

  let audio_path = Path::new(&request.audio_path);
  let stem = audio_path
    .file_stem()
    .and_then(|s| s.to_str())
    .unwrap_or("output");
  let ext = if request.format.trim().is_empty() {
    "mp4"
  } else {
    request.format.trim()
  };
  let file_name = format!("{stem}.{ext}");

  let output_dir = audio_path.parent().unwrap_or(Path::new("."));
  Ok(output_dir.join(file_name))
}

pub fn build_ffmpeg_args(request: &RenderRequest, output_path: &Path) -> Vec<String> {
  let crf = request.crf.unwrap_or(18).to_string();
  let size = format!("{}:{}", request.width, request.height);
  let vf = format!(
    "scale={size}:force_original_aspect_ratio=decrease,pad={size}:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
  );

  vec![
    "-y".into(),
    "-loop".into(),
    "1".into(),
    "-i".into(),
    request.image_path.clone(),
    "-i".into(),
    request.audio_path.clone(),
    "-c:v".into(),
    "libx264".into(),
    "-preset".into(),
    "medium".into(),
    "-crf".into(),
    crf,
    "-tune".into(),
    "stillimage".into(),
    "-c:a".into(),
    "aac".into(),
    "-b:a".into(),
    "192k".into(),
    "-shortest".into(),
    "-pix_fmt".into(),
    "yuv420p".into(),
    "-r".into(),
    request.fps.to_string(),
    "-vf".into(),
    vf,
    "-movflags".into(),
    "+faststart".into(),
    output_path.to_string_lossy().to_string(),
  ]
}

#[derive(Clone, Debug)]
pub struct ProgressInfo {
  pub frame: u32,
  pub fps: f64,
  pub time_sec: f64,
  pub speed: f64,
  pub percent: Option<f64>,
}

pub fn render(request: RenderRequest) -> Result<RenderResponse, String> {
  let output_path = resolve_output_path(&request)?;
  let args = build_ffmpeg_args(&request, &output_path);
  let ffmpeg = ffmpeg_bin();
  let command = format!("{} {}", ffmpeg, args.join(" "));

  let status = Command::new(&ffmpeg)
    .args(&args)
    .status()
    .map_err(|err| format!("failed to run ffmpeg: {err}"))?;

  if !status.success() {
    return Err("ffmpeg failed to render the video".to_string());
  }

  Ok(RenderResponse {
    output_path: output_path.to_string_lossy().to_string(),
    command,
  })
}

pub fn render_with_progress(
  request: RenderRequest,
  duration_sec: Option<f64>,
) -> Result<mpsc::Receiver<ProgressEvent>, String> {
  let output_path = resolve_output_path(&request)?;
  let args = build_ffmpeg_args(&request, &output_path);
  let ffmpeg = ffmpeg_bin();
  let command = format!("{} {}", ffmpeg, args.join(" "));

  let mut child = Command::new(&ffmpeg)
    .args(&args)
    .stderr(Stdio::piped())
    .stdout(Stdio::null())
    .stdin(Stdio::null())
    .spawn()
    .map_err(|err| format!("failed to run ffmpeg: {err}"))?;

  let stderr = child.stderr.take().expect("stderr piped");
  let (tx, rx) = mpsc::channel();

  std::thread::spawn(move || {
    let reader = std::io::BufReader::new(stderr);
    for line in reader.lines() {
      let line = match line {
        Ok(l) => l,
        Err(_) => break,
      };

      let frame = line
        .find("frame=")
        .and_then(|i| line[i + 6..].split_whitespace().next())
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(0);

      let fps = line
        .find("fps=")
        .and_then(|i| line[i + 4..].split_whitespace().next())
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);

      let time_sec = line
        .find("time=")
        .and_then(|i| {
          let t = &line[i + 5..];
          let end = t.find(char::is_whitespace).unwrap_or(t.len());
          let parts: Vec<&str> = t[..end].split(':').collect();
          if parts.len() == 3 {
            let h = parts[0].parse::<f64>().ok()?;
            let m = parts[1].parse::<f64>().ok()?;
            let s = parts[2].parse::<f64>().ok()?;
            Some(h * 3600.0 + m * 60.0 + s)
          } else {
            None
          }
        })
        .unwrap_or(0.0);

      let speed = line
        .find("speed=")
        .and_then(|i| {
          let s = &line[i + 6..];
          let end = s.find('x').unwrap_or(s.len());
          s[..end].parse::<f64>().ok()
        })
        .unwrap_or(0.0);

      if time_sec > 0.0 {
        let percent = duration_sec.filter(|d| *d > 0.0).map(|d| {
          (time_sec / d * 100.0).clamp(0.0, 100.0)
        });
        let _ = tx.send(ProgressEvent::Progress(ProgressInfo {
          frame,
          fps,
          time_sec,
          speed,
          percent,
        }));
      }
    }

    // ffmpeg stderr finished, wait for process exit
    let status = child.wait();
    match status {
      Ok(s) if s.success() => {
        let _ = tx.send(ProgressEvent::Done(RenderResponse {
          output_path: output_path.to_string_lossy().to_string(),
          command,
        }));
      }
      Ok(_) => {
        let _ = tx.send(ProgressEvent::Error(
          "ffmpeg failed to render the video".to_string(),
        ));
      }
      Err(err) => {
        let _ = tx.send(ProgressEvent::Error(format!(
          "ffmpeg wait failed: {err}"
        )));
      }
    }
  });

  Ok(rx)
}

pub fn probe(path: &str) -> Result<ProbeResponse, String> {
  let ffprobe = ffprobe_bin();
  let output = Command::new(&ffprobe)
    .args([
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      path,
    ])
    .output()
    .map_err(|err| format!("failed to run ffprobe: {err}"))?;

  if !output.status.success() {
    return Err("ffprobe failed to read the media".to_string());
  }

  #[derive(serde::Deserialize)]
  struct ProbeResult {
    format: Option<ProbeFormat>,
  }

  #[derive(serde::Deserialize)]
  struct ProbeFormat {
    duration: Option<String>,
    format_name: Option<String>,
  }

  let parsed: ProbeResult = serde_json::from_slice(&output.stdout)
    .map_err(|err| format!("failed to parse ffprobe output: {err}"))?;

  let duration_seconds = parsed
    .format
    .as_ref()
    .and_then(|fmt| fmt.duration.as_ref())
    .and_then(|value| value.parse::<f64>().ok());

  let format_name = parsed
    .format
    .as_ref()
    .and_then(|fmt| fmt.format_name.clone());

  Ok(ProbeResponse {
    duration_seconds,
    format_name,
  })
}

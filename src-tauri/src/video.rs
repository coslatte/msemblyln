use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Clone, Deserialize)]
pub struct RenderRequest {
  pub image_path: String,
  pub audio_path: String,
  pub output_path: Option<String>,
  pub width: u32,
  pub height: u32,
  pub fps: u32,
  pub format: String,
  pub crf: Option<u8>
}

#[derive(Serialize)]
pub struct RenderResponse {
  pub output_path: String,
  pub command: String
}

#[derive(Serialize)]
pub struct ProbeResponse {
  pub duration_seconds: Option<f64>,
  pub format_name: Option<String>
}

#[derive(Deserialize)]
struct ProbeResult {
  format: Option<ProbeFormat>
}

#[derive(Deserialize)]
struct ProbeFormat {
  duration: Option<String>,
  format_name: Option<String>
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
    command
  })
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
      path
    ])
    .output()
    .map_err(|err| format!("failed to run ffprobe: {err}"))?;

  if !output.status.success() {
    return Err("ffprobe failed to read the media".to_string());
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
    format_name
  })
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

fn build_ffmpeg_args(request: &RenderRequest, output_path: &Path) -> Vec<String> {
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
    output_path.to_string_lossy().to_string()
  ]
}

fn ffmpeg_bin() -> String {
  std::env::var("MSEMBLYLN_FFMPEG").unwrap_or_else(|_| "ffmpeg".into())
}

fn ffprobe_bin() -> String {
  std::env::var("MSEMBLYLN_FFPROBE").unwrap_or_else(|_| "ffprobe".into())
}

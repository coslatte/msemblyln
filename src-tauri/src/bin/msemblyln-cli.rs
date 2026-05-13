use std::env;

use video::{render, RenderRequest};

fn main() {
  let args: Vec<String> = env::args().collect();
  if args.len() < 5 {
    print_usage();
    return;
  }

  let mut image_path = None;
  let mut audio_path = None;
  let mut output_path = None;
  let mut width = 1920;
  let mut height = 1080;
  let mut fps = 30;

  let mut index = 1;
  while index < args.len() {
    match args[index].as_str() {
      "--image" => {
        image_path = args.get(index + 1).cloned();
        index += 2;
      }
      "--audio" => {
        audio_path = args.get(index + 1).cloned();
        index += 2;
      }
      "--output" => {
        output_path = args.get(index + 1).cloned();
        index += 2;
      }
      "--width" => {
        width = args
          .get(index + 1)
          .and_then(|v| v.parse().ok())
          .unwrap_or(width);
        index += 2;
      }
      "--height" => {
        height = args
          .get(index + 1)
          .and_then(|v| v.parse().ok())
          .unwrap_or(height);
        index += 2;
      }
      "--fps" => {
        fps = args
          .get(index + 1)
          .and_then(|v| v.parse().ok())
          .unwrap_or(fps);
        index += 2;
      }
      "--help" => {
        print_usage();
        return;
      }
      _ => index += 1
    }
  }

  let image_path = image_path.unwrap_or_else(|| {
    eprintln!("Missing --image");
    print_usage();
    std::process::exit(1);
  });

  let audio_path = audio_path.unwrap_or_else(|| {
    eprintln!("Missing --audio");
    print_usage();
    std::process::exit(1);
  });

  let request = RenderRequest {
    image_path,
    audio_path,
    output_path,
    width,
    height,
    fps,
    format: "mp4".into(),
    crf: Some(18)
  };

  match render(request) {
    Ok(resp) => {
      println!("Rendered: {}", resp.output_path);
      println!("Command: {}", resp.command);
    }
    Err(err) => {
      eprintln!("Error: {err}");
      std::process::exit(1);
    }
  }
}

fn print_usage() {
  println!(
    "msemblyln-cli --image <path> --audio <path> [--output <path>] [--width 1920] [--height 1080] [--fps 30]"
  );
}
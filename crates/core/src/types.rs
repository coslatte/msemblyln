use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize)]
pub struct RenderRequest {
  pub image_path: String,
  pub audio_path: String,
  pub output_path: Option<String>,
  pub width: u32,
  pub height: u32,
  pub fps: u32,
  pub format: String,
  pub crf: Option<u8>,
}

#[derive(Clone, Debug, Serialize)]
pub struct RenderResponse {
  pub output_path: String,
  pub command: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct ProbeResponse {
  pub duration_seconds: Option<f64>,
  pub format_name: Option<String>,
}

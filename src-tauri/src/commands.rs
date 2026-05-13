use crate::video::{probe, render, ProbeResponse, RenderRequest, RenderResponse};

#[tauri::command]
pub fn create_video(request: RenderRequest) -> Result<RenderResponse, String> {
  render(request)
}

#[tauri::command]
pub fn probe_media(path: String) -> Result<ProbeResponse, String> {
  probe(&path)
}

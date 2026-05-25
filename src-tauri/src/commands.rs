use msemblyln_core::types::{RenderRequest, RenderResponse};
use msemblyln_core::video;

pub type ProbeResponse = msemblyln_core::types::ProbeResponse;

#[tauri::command]
pub fn create_video(request: RenderRequest) -> Result<RenderResponse, String> {
  video::render(request)
}

#[tauri::command]
pub fn probe_media(path: String) -> Result<ProbeResponse, String> {
  video::probe(&path)
}

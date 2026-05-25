mod commands;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      commands::create_video,
      commands::probe_media
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

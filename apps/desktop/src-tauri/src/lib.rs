pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::files::create_markdown_note,
            commands::files::list_recent_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running The Roost Command Deck");
}

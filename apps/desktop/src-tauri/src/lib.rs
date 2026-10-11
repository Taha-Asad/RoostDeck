pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::files::create_markdown_note,
            commands::files::list_recent_notes,
            commands::focus::start_focus_session,
            commands::focus::tick_focus_session,
            commands::focus::pause_focus_session,
            commands::focus::resume_focus_session,
            commands::focus::complete_focus_session,
            commands::focus::abandon_focus_session,
            commands::focus::get_active_focus_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running The Roost Command Deck");
}

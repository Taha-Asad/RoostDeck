use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use tauri::command;
use crate::commands::security::validate_and_resolve_path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileInfo {
    #[serde(rename = "absolutePath")]
    pub absolute_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    pub title: String,
    pub realm: String,
    pub r#type: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "modifiedAt")]
    pub modified_at: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: u64,
    pub tags: Vec<String>,
}

fn get_workspace_root() -> PathBuf {
    if let Ok(env_path) = std::env::var("ROOST_WORKSPACE_ROOT") {
        let p = PathBuf::from(env_path);
        let _ = fs::create_dir_all(&p);
        return p;
    }
    
    let current = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let target = if current.ends_with("src-tauri") {
        current.parent().and_then(|p| p.parent()).map(|p| p.join("workspace")).unwrap_or_else(|| current.join("workspace"))
    } else if current.ends_with("desktop") {
        current.parent().and_then(|p| p.parent()).map(|p| p.join("workspace")).unwrap_or_else(|| current.join("workspace"))
    } else {
        current.join("workspace")
    };

    let _ = fs::create_dir_all(&target);
    target
}

fn sanitize_slug(title: &str) -> String {
    let slug = title
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>();
    
    // Trim extra dashes
    let trimmed = slug.trim_matches('-');
    if trimmed.is_empty() {
        "note".to_string()
    } else {
        trimmed.to_string()
    }
}

#[command]
pub async fn create_markdown_note(
    realm: String,
    title: String,
    note_type: String,
    tags: Vec<String>,
    content: String,
) -> Result<FileInfo, String> {
    let root = get_workspace_root();
    
    let subfolder = match realm.as_str() {
        "uni" => "Academic",
        "work" => "Commercial",
        _ => "Sanctum",
    };

    let slug = sanitize_slug(&title);
    let file_name = format!("{}.md", slug);
    let relative_path_buf = PathBuf::from(subfolder).join(&file_name);

    let target_path = validate_and_resolve_path(&root, &relative_path_buf)?;

    // Ensure parent directory exists
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Atomic write to disk
    tokio::fs::write(&target_path, &content)
        .await
        .map_err(|e| format!("Failed to write note: {}", e))?;

    let metadata = fs::metadata(&target_path).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    Ok(FileInfo {
        absolute_path: target_path.to_string_lossy().to_string(),
        relative_path: relative_path_buf.to_string_lossy().to_string(),
        file_name,
        title,
        realm,
        r#type: note_type,
        created_at: now.clone(),
        modified_at: now,
        size_bytes: metadata.len(),
        tags,
    })
}

#[command]
pub async fn list_recent_notes(limit: Option<usize>) -> Result<Vec<FileInfo>, String> {
    let root = get_workspace_root();
    let max_items = limit.unwrap_or(10);
    let mut files = Vec::new();

    let realms = ["Academic", "Commercial", "Sanctum"];
    for realm_dir in realms {
        let dir = root.join(realm_dir);
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("md") {
                    if let Ok(meta) = fs::metadata(&path) {
                        let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                        let title = file_name.trim_end_matches(".md").replace('-', " ");
                        let realm_key = match realm_dir {
                            "Academic" => "uni",
                            "Commercial" => "work",
                            _ => "personal",
                        };

                        files.push(FileInfo {
                            absolute_path: path.to_string_lossy().to_string(),
                            relative_path: format!("{}/{}", realm_dir, file_name),
                            file_name,
                            title,
                            realm: realm_key.to_string(),
                            r#type: "note".to_string(),
                            created_at: chrono::Utc::now().to_rfc3339(),
                            modified_at: chrono::Utc::now().to_rfc3339(),
                            size_bytes: meta.len(),
                            tags: vec![realm_key.to_string()],
                        });
                    }
                }
            }
        }
    }

    files.truncate(max_items);
    Ok(files)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_slug() {
        assert_eq!(sanitize_slug("OS Lecture 04: Paging"), "os-lecture-04--paging");
        assert_eq!(sanitize_slug("---Crazy Note!!!---"), "crazy-note");
        assert_eq!(sanitize_slug(""), "note");
    }
}

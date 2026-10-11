use std::path::{Path, PathBuf};

/// Validates that `target_path` is safely contained within `base_root`
/// and does not perform path traversal attacks.
pub fn validate_and_resolve_path(base_root: &Path, relative_subpath: &Path) -> Result<PathBuf, String> {
    // Check for explicit parent components (e.g. `..`)
    for component in relative_subpath.components() {
        if let std::path::Component::ParentDir = component {
            return Err("SecurityError: Path traversal component '..' is forbidden".to_string());
        }
    }

    let combined = base_root.join(relative_subpath);

    // If target exists, verify canonical containment
    if combined.exists() {
        let canonical_base = base_root.canonicalize().map_err(|e| e.to_string())?;
        let canonical_target = combined.canonicalize().map_err(|e| e.to_string())?;
        if !canonical_target.starts_with(&canonical_base) {
            return Err("SecurityError: Target path escapes root directory".to_string());
        }
    }

    Ok(combined)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_rejects_parent_traversal() {
        let root = env::temp_dir();
        let malicious = Path::new("../../etc/passwd");
        let result = validate_and_resolve_path(&root, malicious);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Path traversal"));
    }

    #[test]
    fn test_accepts_clean_relative_path() {
        let root = env::temp_dir();
        let valid = Path::new("Academic/notes.md");
        let result = validate_and_resolve_path(&root, valid);
        assert!(result.is_ok());
    }
}

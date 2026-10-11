use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FocusSessionConfig {
    pub duration_minutes: u32,
    pub realm: String,
    pub label: String,
    pub ambient_soundscape: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FocusSessionState {
    pub id: String,
    pub config: FocusSessionConfig,
    pub status: String,
    pub total_duration_seconds: u32,
    pub remaining_seconds: u32,
    pub elapsed_seconds: u32,
    pub void_mana_cost: u32,
    pub started_at: String,
    pub paused_at: Option<String>,
    pub completed_at: Option<String>,
    pub abandoned_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AttributeBoost {
    pub attribute: String,
    pub amount: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FocusCompletionResult {
    pub session: FocusSessionState,
    pub xp_earned: u32,
    pub attribute_boost: AttributeBoost,
    pub mana_recharged: u32,
}

static ACTIVE_SESSION: Mutex<Option<FocusSessionState>> = Mutex::new(None);

fn calculate_mana_cost(duration: u32) -> u32 {
    match duration {
        25 => 15,
        50 => 30,
        90 => 50,
        _ => 15,
    }
}

fn calculate_xp_reward(duration: u32) -> u32 {
    match duration {
        25 => 50,
        50 => 120,
        90 => 250,
        _ => 50,
    }
}

fn calculate_attribute_boost(duration: u32, realm: &str) -> AttributeBoost {
    let amount = match duration {
        25 => 3,
        50 => 7,
        90 => 15,
        _ => 3,
    };
    let attribute = match realm {
        "uni" => "intellect",
        "work" => "craft",
        _ => "vitality",
    };
    AttributeBoost {
        attribute: attribute.to_string(),
        amount,
    }
}

#[command]
pub fn start_focus_session(
    duration_minutes: u32,
    realm: String,
    label: String,
    ambient_soundscape: Option<String>,
) -> Result<FocusSessionState, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    if let Some(existing) = &*lock {
        if existing.status == "active" || existing.status == "paused" {
            return Err("SESSION_ALREADY_ACTIVE: Complete or abandon the current session first.".to_string());
        }
    }

    let total_seconds = duration_minutes * 60;
    let now = chrono::Utc::now().to_rfc3339();
    let session_id = format!("focus_{}", chrono::Utc::now().timestamp_millis());

    let session = FocusSessionState {
        id: session_id,
        config: FocusSessionConfig {
            duration_minutes,
            realm,
            label,
            ambient_soundscape,
        },
        status: "active".to_string(),
        total_duration_seconds: total_seconds,
        remaining_seconds: total_seconds,
        elapsed_seconds: 0,
        void_mana_cost: calculate_mana_cost(duration_minutes),
        started_at: now,
        paused_at: None,
        completed_at: None,
        abandoned_at: None,
    };

    *lock = Some(session.clone());
    Ok(session)
}

#[command]
pub fn tick_focus_session(elapsed_delta_seconds: u32) -> Result<FocusSessionState, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    let session = lock.as_mut().ok_or("NO_ACTIVE_SESSION: No session is currently running.")?;
    if session.status != "active" {
        return Err(format!("SESSION_NOT_ACTIVE: Session is currently in status '{}'.", session.status));
    }

    session.elapsed_seconds = (session.elapsed_seconds + elapsed_delta_seconds).min(session.total_duration_seconds);
    session.remaining_seconds = session.total_duration_seconds.saturating_sub(session.elapsed_seconds);

    Ok(session.clone())
}

#[command]
pub fn pause_focus_session() -> Result<FocusSessionState, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    let session = lock.as_mut().ok_or("NO_ACTIVE_SESSION: No session is currently running.")?;
    if session.status != "active" {
        return Err("CANNOT_PAUSE: Session is not currently active.".to_string());
    }

    session.status = "paused".to_string();
    session.paused_at = Some(chrono::Utc::now().to_rfc3339());

    Ok(session.clone())
}

#[command]
pub fn resume_focus_session() -> Result<FocusSessionState, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    let session = lock.as_mut().ok_or("NO_ACTIVE_SESSION: No session is currently running.")?;
    if session.status != "paused" {
        return Err("CANNOT_RESUME: Session is not paused.".to_string());
    }

    session.status = "active".to_string();
    session.paused_at = None;

    Ok(session.clone())
}

#[command]
pub fn complete_focus_session() -> Result<FocusCompletionResult, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    let mut session = lock.take().ok_or("NO_ACTIVE_SESSION: No session to complete.")?;
    let now = chrono::Utc::now().to_rfc3339();

    session.status = "completed".to_string();
    session.remaining_seconds = 0;
    session.elapsed_seconds = session.total_duration_seconds;
    session.completed_at = Some(now);

    let xp_earned = calculate_xp_reward(session.config.duration_minutes);
    let boost = calculate_attribute_boost(session.config.duration_minutes, &session.config.realm);

    Ok(FocusCompletionResult {
        session,
        xp_earned,
        attribute_boost: boost,
        mana_recharged: 5,
    })
}

#[command]
pub fn abandon_focus_session() -> Result<FocusSessionState, String> {
    let mut lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;

    let mut session = lock.take().ok_or("NO_ACTIVE_SESSION: No session to abandon.")?;
    session.status = "abandoned".to_string();
    session.abandoned_at = Some(chrono::Utc::now().to_rfc3339());

    Ok(session)
}

#[command]
pub fn get_active_focus_session() -> Result<Option<FocusSessionState>, String> {
    let lock = ACTIVE_SESSION.lock().map_err(|e| e.to_string())?;
    Ok(lock.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reset_state() {
        let mut lock = ACTIVE_SESSION.lock().unwrap();
        *lock = None;
    }

    #[test]
    fn test_focus_session_lifecycle() {
        reset_state();

        // 1. Start
        let session = start_focus_session(25, "uni".to_string(), "Linear Algebra Review".to_string(), None).unwrap();
        assert_eq!(session.status, "active");
        assert_eq!(session.remaining_seconds, 1500);
        assert_eq!(session.void_mana_cost, 15);

        // 2. Reject duplicate
        let dup = start_focus_session(25, "uni".to_string(), "Duplicate".to_string(), None);
        assert!(dup.is_err());

        // 3. Tick
        let ticked = tick_focus_session(100).unwrap();
        assert_eq!(ticked.elapsed_seconds, 100);
        assert_eq!(ticked.remaining_seconds, 1400);

        // 4. Pause and Resume
        let paused = pause_focus_session().unwrap();
        assert_eq!(paused.status, "paused");
        let resumed = resume_focus_session().unwrap();
        assert_eq!(resumed.status, "active");

        // 5. Complete
        let result = complete_focus_session().unwrap();
        assert_eq!(result.session.status, "completed");
        assert_eq!(result.xp_earned, 50);
        assert_eq!(result.attribute_boost.attribute, "intellect");
        assert_eq!(result.attribute_boost.amount, 3);

        // 6. Active is now None
        let current = get_active_focus_session().unwrap();
        assert!(current.is_none());
    }

    #[test]
    fn test_abandon_session() {
        reset_state();

        let session = start_focus_session(50, "work".to_string(), "Database Optimization".to_string(), None).unwrap();
        assert_eq!(session.void_mana_cost, 30);

        let abandoned = abandon_focus_session().unwrap();
        assert_eq!(abandoned.status, "abandoned");
        assert!(abandoned.abandoned_at.is_some());

        let current = get_active_focus_session().unwrap();
        assert!(current.is_none());
    }
}

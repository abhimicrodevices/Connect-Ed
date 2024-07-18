use serde::{Serialize, Deserialize};

// Define your application state struct
#[derive(Serialize, Deserialize)]
pub struct AppState {
    pub user_name: String,
    pub dark_mode_enabled: bool,
    // Add other fields as needed
}

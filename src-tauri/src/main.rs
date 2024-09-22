#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{command};

#[tauri::command]
fn convert_image(image_path: String) -> Result<String, String> {
    let node_backend = "src-tauri/src/node-backend/convert.js";
    let result = std::process::Command::new("node")
        .arg(node_backend)
        .arg(image_path)
        .output()
        .expect("failed to execute process");

    if result.status.success() {
        Ok(String::from_utf8_lossy(&result.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&result.stderr).to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![convert_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

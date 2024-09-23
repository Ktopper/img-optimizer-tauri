#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use tauri::Manager;

#[tauri::command]
fn convert_image(image_path: String) -> Result<String, String> {
    // Correct the path to the Node.js backend script
    let node_backend = "src/node-backend/convert.cjs"; // Adjust this based on the actual location of the file
    let result = Command::new("node")
        .arg(node_backend)
        .arg(image_path)
        .output()
        .expect("Failed to execute Node.js process");

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

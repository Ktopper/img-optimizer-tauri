#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;


#[tauri::command]
fn convert_image(image_path: String, conversion_type: String) -> Result<String, String> {
    let node_backend = "src/node-backend/convert.cjs";
    let output = Command::new("node")
        .arg(node_backend)
        .arg("--image")
        .arg(&image_path)
        .arg(&conversion_type)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![convert_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

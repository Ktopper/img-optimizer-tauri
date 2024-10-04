#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use tauri::Manager;

#[tauri::command]
fn convert_image(image_path: String, conversion_type: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let resource_path = app_handle.path_resolver().resolve_resource("node-backend/convert.cjs")
        .expect("failed to resolve resource");
    let node_backend = resource_path.to_str().unwrap();

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

#[tauri::command]
fn overlay_image(base_image_path: String, overlay_image_path: String, overlay_option: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let resource_path = app_handle.path_resolver().resolve_resource("node-backend/convert.cjs")
        .expect("failed to resolve resource");
    let node_backend = resource_path.to_str().unwrap();

    let output = Command::new("node")
        .arg(node_backend)
        .arg("--image")
        .arg(&base_image_path)
        .arg("overlay")
        .arg(&overlay_image_path)
        .arg(&overlay_option)
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
        .invoke_handler(tauri::generate_handler![convert_image, overlay_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

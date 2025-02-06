#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use tauri::Manager;

#[tauri::command]
fn convert_image(
    image_path: String,
    conversion_type: String,
    target_width: Option<String>,
    target_height: Option<String>,
    aspect_ratio: Option<String>,
    app_handle: tauri::AppHandle
) -> Result<String, String> {
    println!("Conversion type: {}", conversion_type);
    println!("Target height: {:?}", target_height);

    let resource_path = app_handle.path_resolver().resolve_resource("node-backend/convert.cjs")
        .expect("failed to resolve resource");
    let node_backend = resource_path.to_str().unwrap();

    let mut command = Command::new("node");
    command.arg(node_backend)
        .arg("--image")
        .arg(&image_path)
        .arg(&conversion_type);

    match conversion_type.as_str() {
        "resize" => {
            if let Some(width) = target_width {
                command.arg(width);
            }
        }
        "resize-height" => {
            if let Some(height) = target_height {
                println!("Adding height argument: {}", height);
                command.arg(height);
            } else {
                println!("No height value provided");
            }
        }
        _ => {
            if let Some(width) = target_width {
                command.arg(width);
            }
            if let Some(ratio) = aspect_ratio {
                command.arg(ratio);
            }
        }
    }

    let output = command.output().map_err(|e| e.to_string())?;

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

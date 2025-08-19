#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use std::fs;
use regex::Regex;

#[tauri::command]
fn convert_image(
    image_path: String,
    conversion_type: String,
    target_width: Option<String>,
    target_height: Option<String>,
    aspect_ratio: Option<String>,
    convert_to_webp: Option<bool>,
    app_handle: tauri::AppHandle
) -> Result<String, String> {
    println!("Conversion type: {}", conversion_type);
    println!("Target height: {:?}", target_height);
    println!("Convert to WebP: {:?}", convert_to_webp);

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
            if convert_to_webp.unwrap_or(false) {
                command.arg("--webp");
            }
        }
        "resize-height" => {
            if let Some(height) = target_height {
                println!("Adding height argument: {}", height);
                command.arg(height);
            } else {
                println!("No height value provided");
            }
            if convert_to_webp.unwrap_or(false) {
                command.arg("--webp");
            }
        }
        "aspect-ratio" => {
            if let Some(ratio) = aspect_ratio {
                command.arg(ratio);
            }
            if convert_to_webp.unwrap_or(false) {
                command.arg("--webp");
            }
        }
        "square700" | "square300" => {
            if convert_to_webp.unwrap_or(false) {
                command.arg("--webp");
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

#[tauri::command]
fn convert_video(video_path: String, aspect_ratio: String, resolution: String, compression: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let resource_path = app_handle.path_resolver().resolve_resource("node-backend/convert.cjs")
        .expect("failed to resolve resource");
    let node_backend = resource_path.to_str().unwrap();

    let output = Command::new("node")
        .arg(node_backend)
        .arg("--video")
        .arg(&video_path)
        .arg(&aspect_ratio)
        .arg(&resolution)
        .arg(&compression)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
fn list_files(folder_path: String) -> String {
    let paths = std::fs::read_dir(folder_path).unwrap();
    let mut file_list = String::new();
    
    for path in paths {
        if let Ok(entry) = path {
            if let Some(file_name) = entry.file_name().to_str() {
                file_list.push_str(file_name);
                file_list.push('\n');
            }
        }
    }
    
    file_list
}

#[tauri::command]
fn convert_markdown(markdown_path: String) -> Result<String, String> {
    let content = fs::read_to_string(&markdown_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Convert headers but keep the text (remove only the # symbols)
    let header_regex = Regex::new(r"^(#{1,6})\s(.*)$").unwrap();
    let mut text = content
        .lines()
        .map(|line| {
            if header_regex.is_match(line) {
                header_regex.replace(line, "$2").to_string()
            } else {
                line.to_string()
            }
        })
        .collect::<Vec<String>>()
        .join("\n");

    // Remove inline code blocks
    text = Regex::new(r"`[^`]+`").unwrap().replace_all(&text, "").to_string();

    // Remove code blocks
    text = Regex::new(r"```[\s\S]*?```").unwrap().replace_all(&text, "").to_string();

    // Remove links but keep text
    text = Regex::new(r"\[([^\]]+)\]\([^\)]+\)").unwrap().replace_all(&text, "$1").to_string();

    // Remove images
    text = Regex::new(r"!\[[^\]]*\]\([^\)]+\)").unwrap().replace_all(&text, "").to_string();

    // Remove bold/italic markers
    text = Regex::new(r"\*\*|\*|__|\b_\b").unwrap().replace_all(&text, "").to_string();

    // Remove horizontal rules
    text = Regex::new(r"^\s*[-*_]{3,}\s*$").unwrap().replace_all(&text, "").to_string();

    // Remove blockquotes
    text = Regex::new(r"^>\s").unwrap().replace_all(&text, "").to_string();

    // Remove list markers
    text = Regex::new(r"^\s*[-*+]\s").unwrap().replace_all(&text, "").to_string();
    text = Regex::new(r"^\s*\d+\.\s").unwrap().replace_all(&text, "").to_string();

    // Clean up extra whitespace
    text = Regex::new(r"\n{3,}").unwrap().replace_all(&text, "\n\n").to_string();
    text = text.trim().to_string();

    // Save as a new .txt file
    let txt_path = markdown_path.replace(".md", ".txt").replace(".markdown", ".txt");
    fs::write(&txt_path, &text)
        .map_err(|e| format!("Failed to write text file: {}", e))?;

    Ok(text)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            convert_image,
            overlay_image,
            convert_video,
            list_files,
            convert_markdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

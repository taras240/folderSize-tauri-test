#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use std::{env, fs, path::Path, path::PathBuf, time::UNIX_EPOCH};
use tauri::{Manager, PhysicalPosition, PhysicalSize, WindowEvent};
use tauri_plugin_store::StoreBuilder;
mod disks;
use disks::*;
mod net;
use net::*;
mod metadata;
use metadata::*;
use trash::delete;

#[derive(serde::Serialize)]
struct DirEntry {
    name: String,
    is_dir: bool,
    is_file: bool,
    is_symlink: bool,
    size: Option<u64>,
    modified: Option<u128>, // timestamp
    readonly: bool,
    hidden: bool,
    path: String,
}
#[tauri::command]
fn parse_env_path(path: &str) -> String {
    let mut result = path.to_string();

    for (key, value) in env::vars() {
        let needle = format!("%{}%", key);
        if result.contains(&needle) {
            result = result.replace(&needle, &value);
        }
    }

    result
}

use std::collections::HashMap;

#[tauri::command]
async fn calc_folder_sizes(path: String) -> Result<HashMap<String, u64>, String> {
    let mut sizes: HashMap<String, u64> = HashMap::new();
    calc_recursive(&path, &mut sizes)
        .await
        .map_err(|e| e.to_string())?;
    Ok(sizes)
}

async fn calc_recursive(
    path: &str,
    sizes: &mut HashMap<String, u64>,
) -> Result<u64, Box<dyn std::error::Error>> {
    // Викликаємо вашу наявну функцію
    let entries = list_dir(path.to_owned()).await?;
    let mut total_size: u64 = 0;

    for entry in entries {
        if entry.is_dir {
            // Рекурсивно обчислюємо розмір підпапки
            let subfolder_size = Box::pin(calc_recursive(&entry.path, sizes)).await?;
            total_size += subfolder_size;
        } else if let Some(file_size) = entry.size {
            // Додаємо розмір файлу
            total_size += file_size;
        }
    }

    // Зберігаємо розмір цієї папки
    sizes.insert(path.to_string(), total_size);
    Ok(total_size)
}

#[tauri::command]
async fn list_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let real_path = parse_env_path(&path);
    let entries = match fs::read_dir(real_path) {
        Ok(e) => e,
        Err(_) => return Ok(vec![]), // ❗ нема доступу → порожній список
    };

    let mut result = Vec::new();

    for entry in entries {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let meta = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        let full_path = fs::canonicalize(entry.path())
            .unwrap_or(entry.path())
            .to_string_lossy()
            .replace(r"\\?\", "");

        result.push(DirEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            is_dir: meta.is_dir(),
            is_file: meta.is_file(),
            size: meta.is_file().then(|| meta.len()),
            modified: meta
                .modified()
                .ok()
                .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                .map(|d| d.as_millis()),
            readonly: meta.permissions().readonly(),
            hidden: meta.is_symlink(),
            is_symlink: meta.is_symlink(),
            path: full_path,
        });
    }

    Ok(result)
}
#[tauri::command]
fn full_files_list(path: String) -> Result<Vec<DirEntry>, String> {
    let real_path = parse_env_path(&path);

    let entries = match fs::read_dir(real_path) {
        Ok(e) => e,
        Err(_) => return Ok(vec![]),
    };

    let mut result = Vec::new();

    for entry in entries.flatten() {
        let meta = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        let full_path = fs::canonicalize(entry.path())
            .unwrap_or(entry.path())
            .to_string_lossy()
            .replace(r"\\?\", "");

        if meta.is_dir() {
            if let Ok(inner) = full_files_list(full_path.clone()) {
                result.extend(inner);
            }
        } else {
            result.push(DirEntry {
                name: entry.file_name().to_string_lossy().to_string(),
                is_dir: false,
                is_file: true,
                size: Some(meta.len()),
                modified: meta
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .map(|d| d.as_millis()),
                readonly: meta.permissions().readonly(),
                hidden: meta.is_symlink(), // ⚠️ сумнівна логіка
                is_symlink: meta.is_symlink(),
                path: full_path,
            });
        }
    }

    Ok(result)
}

#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let path = Path::new(&path);

    if path.is_file() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    } else if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| e.to_string())?;
    } else {
        return Err("Шлях не існує".into());
    }

    Ok(())
}

#[tauri::command]
fn delete_path_to_trash(path: String) -> Result<(), String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Шлях не існує".into());
    }

    delete(path).map_err(|e| e.to_string())?;
    Ok(())
}

mod player;

#[tauri::command]
fn play(path: String) -> Result<(), String> {
    player::play_file(path)
}

#[tauri::command]
fn stop() {
    player::stop();
}
#[derive(Debug, Serialize, Deserialize, Clone)]
struct WindowState {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
    maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            width: 800,
            height: 600,
            x: 100,
            y: 100,
            maximized: false,
        }
    }
}

fn get_state_path(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to get app data dir")
        .join("window-state.json")
}

fn load_window_state(app: &tauri::AppHandle) -> WindowState {
    let path = get_state_path(app);

    if let Ok(contents) = fs::read_to_string(&path) {
        if let Ok(state) = serde_json::from_str(&contents) {
            return state;
        }
    }

    WindowState::default()
}

fn save_window_state(app: &tauri::AppHandle, state: &WindowState) {
    let path = get_state_path(app);

    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    if let Ok(json) = serde_json::to_string_pretty(state) {
        let _ = fs::write(&path, json);
    }
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            list_dir,
            full_files_list,
            list_disks,
            delete_path,
            delete_path_to_trash,
            // play,
            // stop,
            fetch_site,
            get_metadata,
            parse_env_path,
            calc_folder_sizes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

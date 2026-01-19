#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::env;
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

mod disks;
use disks::*;
mod net;
use net::*;
mod metadata;
use metadata::*;

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

mod player;

#[tauri::command]
fn play(path: String) -> Result<(), String> {
    player::play_file(path)
}

#[tauri::command]
fn stop() {
    player::stop();
}
use tauri::Manager;
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_dir,
            list_disks,
            delete_path,
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

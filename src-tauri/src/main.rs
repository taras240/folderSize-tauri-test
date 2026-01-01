#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;
use tauri::command;

mod disks;
use disks::*;

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
fn list_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let entries = match fs::read_dir(&path) {
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
        // .to_string();

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_dir,
            list_disks,
            delete_path,
            play,
            stop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

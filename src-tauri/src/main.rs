#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod modules;
use modules::disks::*;
use modules::metadata::*;
use modules::net::*;
use modules::rahashes::*;
use std::collections::HashMap;
use std::{env, fs, path::Path, time::UNIX_EPOCH};
use trash::delete;

use windows::{
    core::HSTRING,
    Win32::{
        System::Com::{
            CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
            COINIT_APARTMENTTHREADED,
        },
        UI::Shell::{
            FileOperation, IFileOperation, IShellItem, SHCreateItemFromParsingName,
            FOFX_SHOWELEVATIONPROMPT, FOF_ALLOWUNDO, FOF_WANTNUKEWARNING,
        },
    },
};

#[derive(serde::Serialize)]
struct DirEntry {
    name: String,
    is_dir: bool,
    is_file: bool,
    is_symlink: bool,
    size: Option<u64>,
    modified: Option<u128>, // timestamp
    created: Option<u128>,
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
            created: meta
                .created()
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
                created: meta
                    .created()
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
fn delete_path(path: String, permanent: bool) -> Result<(), String> {
    if !Path::new(&path).exists() {
        return Err("Шлях не існує".into());
    }

    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED)
            .ok()
            .map_err(|e| e.to_string())?;

        let result = (|| -> windows::core::Result<()> {
            let file_op: IFileOperation =
                CoCreateInstance(&FileOperation, None, CLSCTX_INPROC_SERVER)?;

            let mut flags = FOF_WANTNUKEWARNING | FOFX_SHOWELEVATIONPROMPT.into();

            if !permanent {
                flags |= FOF_ALLOWUNDO;
            }

            file_op.SetOperationFlags(flags)?;

            let item: IShellItem = SHCreateItemFromParsingName(&HSTRING::from(path), None)?;

            file_op.DeleteItem(&item, None)?;
            file_op.PerformOperations()?;

            Ok(())
        })();

        CoUninitialize();

        result.map_err(|e| e.to_string())?;
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
            fetch_site,
            download_file,
            get_metadata,
            set_metadata,
            parse_env_path,
            calc_folder_sizes,
            get_ra_hash,
            get_zip_file_extension,
            launch_retroarch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

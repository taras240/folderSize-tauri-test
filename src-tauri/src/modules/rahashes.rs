use std::{env, process::Command};

use std::{
    fs,
    fs::File,
    path::{Path, PathBuf},
};
use zip::ZipArchive;

#[tauri::command]
pub fn get_zip_file_extension(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;

    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let entry = archive.by_index(i).map_err(|e| e.to_string())?;

        if entry.is_dir() {
            continue;
        }

        if let Some(ext) = Path::new(entry.name()).extension().and_then(|e| e.to_str()) {
            return Ok(ext.to_lowercase());
        }
    }

    Err("No files found in archive".into())
}

#[tauri::command]
pub fn get_ra_hash(path: String, system: String) -> Result<String, String> {
    // Шлях до директорії з exe програми
    let exe_dir = env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Failed to get executable directory")?
        .to_path_buf();

    let hasher = exe_dir.join("RAHasher.exe");
    if !hasher.exists() {
        return Err(format!("RAHasher.exe not found: {}", hasher.display()));
    }

    let output = Command::new(hasher.clone())
        .arg(&system)
        .arg(&path)
        .output()
        .map_err(|e| e.to_string())?;

    let hash = String::from_utf8_lossy(&output.stdout).trim().to_string();

    if hash.len() == 32 {
        return Ok(hash);
    }

    return Err(format!(
        "status={}\nstdout={}\nstderr={}",
        output.status,
        hash,
        String::from_utf8_lossy(&output.stderr)
    ));
}

// #[tauri::command]
// pub fn run_ra_game(rom_path: String, exe_path: String) {
//     Command::new(exe_path.clone()).arg(&rom_path);
// }

#[tauri::command]
pub fn launch_retroarch(path: String, game_path: String) -> Result<(), String> {
    let retroarch = PathBuf::from(&path);
    let base_dir = retroarch
        .parent()
        .ok_or("Не вдалося визначити папку RetroArch")?;

    let info_dir = base_dir.join("info");
    let cores_dir = base_dir.join("cores");

    let mut extension = Path::new(&game_path)
        .extension()
        .and_then(|e| e.to_str())
        .ok_or("Не вдалося визначити розширення ROM")?
        .to_lowercase();

    if extension == "zip" {
        extension = get_zip_file_extension(Path::new(&game_path))?;
    }
    let mut core_path = None;

    for entry in fs::read_dir(&info_dir).map_err(|e| e.to_string())? {
        let path = entry.map_err(|e| e.to_string())?.path();

        if path.extension().and_then(|e| e.to_str()) != Some("info") {
            continue;
        }

        let text = fs::read_to_string(&path).map_err(|e| e.to_string())?;

        if let Some(line) = text.lines().find(|l| l.starts_with("supported_extensions")) {
            let extensions = line.split('=').nth(1).unwrap_or("").replace('"', "");

            let exts = extensions
                .trim()
                .split('|')
                .map(|s| s.trim().to_lowercase());

            if exts.into_iter().any(|e| e == extension) {
                let dll_name = path
                    .file_stem()
                    .unwrap()
                    .to_string_lossy()
                    .replace(".libretro", "_libretro")
                    + ".dll";

                let dll = cores_dir.join(dll_name);

                if dll.exists() {
                    core_path = Some(dll);
                    break;
                }
            }
        }
    }

    let core_path = core_path.ok_or(format!("Не знайдено ядро для файлів .{}", extension))?;

    Command::new(path)
        .arg("-L")
        .arg(core_path)
        .arg(game_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

// #[tauri::command]
// pub fn launch_ralibretro(path: String, game_path: String) -> Result<(), String> {
//     let retroarch = PathBuf::from(&path);
//     let base_dir = retroarch
//         .parent()
//         .ok_or("Не вдалося визначити папку RetroArch")?;

//     let cores_dir = base_dir.join("cores");
//     let cores_json = cores_dir.join("cores.json");

//     let extension = Path::new(&game_path)
//         .extension()
//         .and_then(|e| e.to_str())
//         .ok_or("Не вдалося визначити розширення ROM")?
//         .to_lowercase();

//     let json = fs::read_to_string(&cores_json).map_err(|e| e.to_string())?;

//     let mut core_path = None;
//     let mut current_core: Option<String> = None;

//     for line in json.lines() {
//         let line = line.trim();

//         if line.starts_with('"') && line.ends_with("{") {
//             if let Some(end) = line[1..].find('"') {
//                 current_core = Some(line[1..1 + end].to_string());
//             }
//             continue;
//         }

//         // Рядок з extensions
//         if line.starts_with("\"extensions\"") {
//             let extensions = line
//                 .split(':')
//                 .nth(1)
//                 .unwrap_or("")
//                 .trim()
//                 .trim_matches(',')
//                 .trim_matches('"');

//             if extensions
//                 .split('|')
//                 .any(|e| e.trim().eq_ignore_ascii_case(&extension))
//             {
//                 if let Some(core_name) = &current_core {
//                     let dll = cores_dir.join(format!("{core_name}.dll"));

//                     if dll.exists() {
//                         core_path = Some(dll);
//                         break;
//                     }
//                 }
//             }
//         }
//     }

//     let core_path = core_path.ok_or_else(|| format!("Не знайдено ядро для .{}", extension))?;
//     println!(
//         "path: {}, core: {}, game: {}",
//         path,
//         core_path.display(),
//         game_path
//     );
//     Command::new(path)
//         .arg("-L")
//         .arg(core_path)
//         .arg(game_path)
//         .spawn()
//         .map_err(|e| e.to_string())?;

//     Ok(())
// }

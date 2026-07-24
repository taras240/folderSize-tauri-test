use std::{env, path::PathBuf, process::Command};

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

    // let output = Command::new(hasher)
    //     .arg(system)
    //     .arg(path)
    //     .output()
    //     .map_err(|e| e.to_string())?;
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

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

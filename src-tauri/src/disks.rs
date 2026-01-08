use sysinfo::{Disks, System};

#[derive(serde::Serialize)]
pub struct DiskInfo {
    name: String,
    path: String,
    total: u64,
    available: u64,
    is_drive: bool,
}

#[tauri::command]
pub fn list_disks() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();

    disks
        .iter()
        .map(|disk| DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            path: disk.mount_point().to_string_lossy().to_string(),
            total: disk.total_space(),
            available: disk.available_space(),
            is_drive: true,
        })
        .collect()
}

use serde::{Deserialize, Serialize};
use std::path::Path;

use audiotags::Tag;

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    duration: Option<f64>,
    bitrate: Option<u32>,
    genre: Option<String>,
    year: Option<String>,
}

#[tauri::command]
pub fn get_metadata(path: String) -> Result<serde_json::Value, String> {
    let tag = Tag::new()
        .read_from_path(&path)
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "title": tag.title(),
        "artist": tag.artist(),
        "album": tag.album_title(),
        "genre": tag.genre(),
        "year": tag.year(),
        "track": tag.track_number(),
        "comment": tag.comment(),
    }))
}

use serde_json::Value;

#[tauri::command]
pub fn set_metadata(path: String, metadata: Value) -> Result<(), String> {
    let mut tag = Tag::new()
        .read_from_path(&path)
        .map_err(|e| e.to_string())?;

    let get = |k: &str| -> Option<String> {
        metadata
            .get(k)?
            .as_str()
            .map(|s| s.trim().replace('\0', ""))
    };

    if let Some(v) = get("title") {
        tag.set_title(&v);
    }

    if let Some(v) = get("artist") {
        tag.set_artist(&v);
    }

    if let Some(v) = get("album") {
        tag.set_album_title(&v);
    }

    if let Some(v) = get("genre") {
        tag.set_genre(&v);
    }
    if let Some(v) = get("comment") {
        tag.set_comment(v.clone());
    }

    if let Some(v) = get("year") {
        if let Ok(year) = v.parse::<i32>() {
            tag.set_year(year);
        }
    }

    if let Some(v) = get("track") {
        if let Ok(track) = v.parse::<u16>() {
            tag.set_track_number(track);
        }
    }

    tag.write_to_path(&path).map_err(|e| e.to_string())?;

    Ok(())
}

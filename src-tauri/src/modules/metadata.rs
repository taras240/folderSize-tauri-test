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

use audiotags::{AudioTag, FlacTag, Id3v2Tag, Mp4Tag, TagType};
use serde_json::Value;

fn guess_tag_type(path: &str) -> TagType {
    match Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .as_deref()
    {
        Some("mp3") => TagType::Id3v2,
        Some("m4a") | Some("mp4") | Some("m4b") => TagType::Mp4,
        Some("flac") => TagType::Flac,
        _ => TagType::Id3v2,
    }
}

/// Створює порожній тег потрібного типу "з нуля" (коли файл без тегів)
fn new_empty_tag(tag_type: TagType) -> Box<dyn AudioTag + Send + Sync> {
    match tag_type {
        TagType::Id3v2 => Box::new(Id3v2Tag::default()),
        TagType::Mp4 => Box::new(Mp4Tag::default()),
        TagType::Flac => Box::new(FlacTag::default()),
        _ => Box::new(Id3v2Tag::default()),
    }
}

#[tauri::command]
pub fn set_metadata(path: String, metadata: Value) -> Result<(), String> {
    let tag_type = guess_tag_type(&path);

    // Пробуємо прочитати існуючий тег потрібного типу.
    // Якщо тегів немає (Err) — створюємо новий пустий тег того ж типу.
    // Для mp3 audiotags все одно завжди пише ID3v2.4 при записі,
    // тож "апгрейд версії" відбувається автоматично.
    let mut tag = match Tag::new().with_tag_type(tag_type).read_from_path(&path) {
        Ok(existing) => existing,
        Err(_) => new_empty_tag(tag_type),
    };

    let get = |key: &str| -> Option<String> {
        metadata
            .get(key)?
            .as_str()
            .map(|s| s.trim().replace('\0', ""))
        // .filter(|s: &String| !s.is_empty())
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
        tag.remove_comment();
        tag.set_comment(v);
    }
    if let Some(v) = get("track") {
        if let Ok(track) = v.parse::<u16>() {
            tag.set_track_number(track);
        }
    }
    if let Some(v) = get("year") {
        if let Ok(year) = v.parse::<i32>() {
            tag.set_year(year);
        }
    }

    tag.write_to_path(&path).map_err(|e| e.to_string())?;

    Ok(())
}

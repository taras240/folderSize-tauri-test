use serde::{Deserialize, Serialize};
use std::path::Path;

// Імпортуємо всі необхідні трейти для роботи з файлом та тегами
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::probe::Probe;
use lofty::tag::Accessor;

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    duration: Option<f64>,
    bitrate: Option<u32>,
    genre: Option<String>,
}

#[tauri::command]
pub fn get_metadata(path: String) -> Result<Metadata, String> {
    let path = Path::new(&path);

    let file = Probe::open(path)
        .map_err(|e| e.to_string())?
        .read()
        .map_err(|e| e.to_string())?;

    let tag = file.primary_tag();

    // Завдяки `use lofty::file::AudioFile;` метод .properties() стає доступним!
    let properties = file.properties();

    Ok(Metadata {
        title: tag.and_then(|t| t.title().map(|s| s.into_owned())),
        artist: tag.and_then(|t| t.artist().map(|s| s.into_owned())),
        album: tag.and_then(|t| t.album().map(|s| s.into_owned())),
        duration: Some(properties.duration().as_secs_f64()),
        bitrate: properties.audio_bitrate(),
        genre: tag.and_then(|t| t.genre().map(|s| s.into_owned())),
    })
}

use lofty::config::WriteOptions;
use lofty::tag::{Tag, TagType};
use serde_json::Value;

#[tauri::command]
pub fn set_metadata(path: String, metadata: Value) -> Result<(), String> {
    let path = Path::new(&path);

    // Читаємо файл без застарілих ParseOptions
    let mut file = Probe::open(path)
        .map_err(|e| e.to_string())?
        .read()
        .map_err(|e| e.to_string())?;

    // Якщо первинного тегу немає, визначаємо відповідний тип для цього файлу
    // (наприклад, ID3v2 для MP3) і створюємо його. Якщо тип не визначився, беремо ID3v2 як фолбек.
    if file.primary_tag().is_none() {
        let tag_type = file.primary_tag_type();
        file.insert_tag(Tag::new(tag_type));
    }

    // Отримуємо мутабельне посилання на тег
    let tag = file.primary_tag_mut().ok_or("No tag")?;

    let get = |k: &str| -> Option<String> {
        metadata
            .get(k)?
            .as_str()
            .map(|s| s.trim().replace('\0', ""))
    };

    // Записуємо текстові поля через трейт Accessor
    if let Some(v) = get("title") {
        tag.set_title(v);
    }

    if let Some(v) = get("artist") {
        tag.set_artist(v);
    }

    if let Some(v) = get("album") {
        tag.set_album(v);
    }

    if let Some(v) = get("genre") {
        tag.set_genre(v);
    }

    // Завдяки трейту AudioFile метод save_to_path відпрацює коректно
    file.save_to_path(path, WriteOptions::default())
        .map_err(|e| e.to_string())?;

    Ok(())
}

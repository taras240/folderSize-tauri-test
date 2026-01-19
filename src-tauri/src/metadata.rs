use lofty::{Accessor, AudioFile, Probe, TaggedFileExt};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    year: Option<u32>,
    duration: Option<f64>,
}

#[tauri::command]
pub fn get_metadata(path: String) -> Result<Metadata, String> {
    let tagged_file = Probe::open(&path)
        .map_err(|e| e.to_string())?
        .read()
        .map_err(|e| e.to_string())?;

    let tag = tagged_file.primary_tag().or(tagged_file.first_tag());
    let properties = tagged_file.properties();

    Ok(Metadata {
        title: tag.and_then(|t| t.title().map(|s| s.to_string())),
        artist: tag.and_then(|t| t.artist().map(|s| s.to_string())),
        album: tag.and_then(|t| t.album().map(|s| s.to_string())),
        year: tag.and_then(|t| t.year()),
        duration: Some(properties.duration().as_secs_f64()),
    })
}

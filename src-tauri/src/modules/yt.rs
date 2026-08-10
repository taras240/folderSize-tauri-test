use std::path::PathBuf;

use serde::Serialize;
use std::path::Path;
use yt_dlp::client::deps::LibraryInstaller;
use yt_dlp::VideoSelection;

use tauri::Manager;
#[derive(Debug, Serialize)]
pub struct YoutubeSearchResult {
    pub id: String,
    pub title: String,
    pub url: String,
    pub thumbnail: Option<String>,
    pub duration: Option<f64>,
    pub channel: Option<String>,
}
#[tauri::command]
pub async fn youtube_search(
    app: tauri::AppHandle,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<YoutubeSearchResult>, String> {
    let query = query.trim();

    if query.is_empty() {
        return Ok(Vec::new());
    }
    let limit = limit.unwrap_or(10).clamp(1, 50);

    let libraries_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Не вдалося отримати AppData: {e}"))?
        .join("yt-dlp");

    let (yt_dlp_path, ffmpeg_path, deno_path) = ensure_libraries(&libraries_dir).await?;

    let libraries = yt_dlp::client::deps::Libraries::new(yt_dlp_path, ffmpeg_path);

    let downloader = yt_dlp::Downloader::builder(libraries, libraries_dir.join("output"))
        .build()
        .await
        .map_err(|e| format!("Не вдалося створити Downloader: {e:?}"))?;

    let youtube = downloader.youtube_extractor();

    let results = youtube
        .search(query, limit.try_into().unwrap())
        .await
        .map_err(|e| format!("Помилка пошуку YouTube: {e:?}"))?;

    let results = results
        .entries
        .into_iter()
        .map(|video| YoutubeSearchResult {
            id: video.id.clone(),
            title: video.title.clone(),
            url: format!("https://www.youtube.com/watch?v={}", video.id),
            thumbnail: video.thumbnail.clone(),
            duration: video.duration,
            channel: video.uploader.clone(),
        })
        .collect::<Vec<_>>();

    Ok(results)
}

#[derive(Debug, Serialize)]
pub struct YoutubeAudioResult {
    pub url: String,
    pub format_id: String,
    pub ext: String,
    // pub mime_type: Option<String>,
    // pub bitrate: Option<f64>,
}

#[tauri::command]
pub async fn youtube_audio_url(
    app: tauri::AppHandle,
    video_url: String,
) -> Result<YoutubeAudioResult, String> {
    let libraries_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Не вдалося отримати AppData: {e}"))?
        .join("yt-dlp");

    let (yt_dlp_path, ffmpeg_path, deno_path) = ensure_libraries(&libraries_dir).await?;

    let libraries = yt_dlp::client::deps::Libraries::new(yt_dlp_path, ffmpeg_path);

    let downloader = yt_dlp::Downloader::builder(libraries, libraries_dir.join("output"))
        .build()
        .await
        .map_err(|e| format!("Downloader error: {e:?}"))?;

    let video = downloader
        .fetch_video_infos(&video_url)
        .await
        .map_err(|e| format!("Не вдалося отримати інформацію про відео: {e:?}"))?;

    let audio = video
        .best_audio_format()
        .ok_or_else(|| "Аудіоформат не знайдено".to_string())?;

    Ok(YoutubeAudioResult {
        url: audio
            .url()
            .map_err(|e| format!("Не вдалося отримати URL аудіо: {e:?}"))?
            .clone(),
        format_id: audio.format_id.clone(),
        ext: audio.format.clone(),
        // bitrate: audio.audio_bitrate,
    })
}

/// Перевіряє наявність yt-dlp та FFmpeg.
/// Відсутні файли автоматично завантажуються.
async fn ensure_libraries(libraries_dir: &Path) -> Result<(PathBuf, PathBuf, PathBuf), String> {
    std::fs::create_dir_all(libraries_dir).map_err(|e| {
        format!(
            "Не вдалося створити директорію {}: {e}",
            libraries_dir.display()
        )
    })?;

    let yt_dlp_path = libraries_dir.join("yt-dlp.exe");
    let ffmpeg_path = libraries_dir.join("ffmpeg.exe");

    let installer = LibraryInstaller::new(libraries_dir.to_path_buf());

    // yt-dlp
    let yt_dlp_path = if yt_dlp_path.exists() {
        yt_dlp_path
    } else {
        println!("yt-dlp відсутній. Завантаження...");
        installer
            .install_youtube(None)
            .await
            .map_err(|e| format!("Не вдалося завантажити yt-dlp: {e:?}"))?
    };

    // FFmpeg
    let ffmpeg_path = if ffmpeg_path.exists() {
        ffmpeg_path
    } else {
        println!("FFmpeg відсутній. Завантаження...");

        installer
            .install_ffmpeg(None)
            .await
            .map_err(|e| format!("Не вдалося завантажити FFmpeg: {e:?}"))?
    };
    let deno_path = download_deno(libraries_dir).await?;

    Ok((yt_dlp_path, ffmpeg_path, deno_path))
}
use std::io::{Cursor, Read};

async fn download_deno(libraries_dir: &Path) -> Result<PathBuf, String> {
    let deno_path = libraries_dir.join("deno.exe");

    if deno_path.exists() {
        return Ok(deno_path);
    }

    let target = match std::env::consts::ARCH {
        "x86_64" => "x86_64-pc-windows-msvc",
        "aarch64" => "aarch64-pc-windows-msvc",
        arch => {
            return Err(format!("Непідтримувана архітектура Windows: {arch}"));
        }
    };

    let url =
        format!("https://github.com/denoland/deno/releases/latest/download/deno-{target}.zip");

    println!("Deno відсутній. Завантаження: {url}");

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Не вдалося завантажити Deno: {e}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "GitHub повернув HTTP {} при завантаженні Deno",
            response.status()
        ));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Не вдалося отримати файл Deno: {e}"))?;

    let cursor = Cursor::new(bytes);

    let mut archive =
        zip::ZipArchive::new(cursor).map_err(|e| format!("Не вдалося відкрити Deno ZIP: {e}"))?;

    let mut deno_file = archive
        .by_name("deno.exe")
        .map_err(|e| format!("deno.exe не знайдено в архіві: {e}"))?;

    let mut data = Vec::new();

    deno_file
        .read_to_end(&mut data)
        .map_err(|e| format!("Не вдалося розпакувати deno.exe: {e}"))?;

    std::fs::write(&deno_path, data)
        .map_err(|e| format!("Не вдалося зберегти Deno у {}: {e}", deno_path.display()))?;

    println!("Deno встановлено: {}", deno_path.display());

    Ok(deno_path)
}

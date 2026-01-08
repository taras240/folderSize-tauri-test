#[tauri::command]
pub async fn fetch_site(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    let res = client
        .get(url)
        .header("User-Agent", "Mozilla/5.0")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

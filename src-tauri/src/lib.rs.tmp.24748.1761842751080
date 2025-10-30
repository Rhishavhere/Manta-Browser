use tauri::{WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn create_webview(
    app: tauri::AppHandle,
    url: String,
) -> Result<(), String> {
    let _webview = WebviewWindowBuilder::new(
        &app,
        "browser",
        WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {:?}", e))?)
    )
    .title("Manta Browser")
    .inner_size(1200.0, 800.0)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn navigate_to(
    window: tauri::WebviewWindow,
    url: String,
) -> Result<(), String> {
    window.eval(&format!("window.location.href = '{}'", url))
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![create_webview, navigate_to])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

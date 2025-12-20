use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, Runtime};
use serde::Serialize;

// 2025-12-20 00:00:00
// 硬编码的阈值时间戳
const THRESHOLD_TIME: u64 = 1766294400;
// 存储安装时间的文件名
const INSTALL_TIME_FILENAME: &str = ".install_time";

#[derive(Serialize)]
pub struct AccessStatus {
    pub allowed: bool,
    pub install_time: u64,
    pub threshold_time: u64,
}

pub fn get_install_time<R: Runtime>(app: &AppHandle<R>) -> Result<u64, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    }
    
    let file_path = data_dir.join(INSTALL_TIME_FILENAME);

    if file_path.exists() {
        let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
        let time = content.trim().parse::<u64>().map_err(|_| "Invalid timestamp format".to_string())?;
        Ok(time)
    } else {
        let start = SystemTime::now();
        let since_the_epoch = start
            .duration_since(UNIX_EPOCH)
            .map_err(|e| e.to_string())?;
        let time = since_the_epoch.as_secs();
        
        // 尝试写入文件
        if let Err(e) = fs::write(&file_path, time.to_string()) {
            return Err(format!("Failed to write install time: {}", e));
        }
        
        Ok(time)
    }
}

#[tauri::command]
pub async fn check_access_status<R: Runtime>(app: AppHandle<R>) -> Result<AccessStatus, String> {
    let install_time = get_install_time(&app)?;
    
    // 权限判断逻辑：
    // 若 install_time > threshold_time：禁止访问
    // 若 install_time <= threshold_time：允许访问
    let allowed = install_time <= THRESHOLD_TIME;
    
    Ok(AccessStatus {
        allowed,
        install_time,
        threshold_time: THRESHOLD_TIME,
    })
}

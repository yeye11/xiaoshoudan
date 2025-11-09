use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize)]
struct VideoInfo {
    title: String,
    cover: String,
    #[serde(rename = "videoUrl")]
    video_url: Option<String>,
    author: String,
    platform: String,
    duration: Option<u32>,
    likes: Option<u64>,
    comments: Option<u64>,
    images: Option<Vec<String>>,
    #[serde(rename = "type")]
    content_type: String,
    #[serde(rename = "musicUrl")]
    music_url: Option<String>,
}

/// 从抖音链接中提取 aweme_id
fn extract_aweme_id(url: &str) -> Option<String> {
    // 匹配各种格式的链接
    let patterns = [
        r"/video/(\d+)",
        r"/note/(\d+)",
        r"/slides/(\d+)",
        r"modal_id=(\d+)",
    ];

    for pattern in patterns.iter() {
        if let Ok(re) = regex::Regex::new(pattern) {
            if let Some(caps) = re.captures(url) {
                if let Some(id) = caps.get(1) {
                    return Some(id.as_str().to_string());
                }
            }
        }
    }
    None
}

/// 解析抖音视频/图文链接
#[tauri::command]
async fn parse_douyin_video(url: String) -> Result<VideoInfo, String> {
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("创建客户端失败: {}", e))?;

    // 1. 跟随重定向获取真实 URL
    let response = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    let real_url = response.url().to_string();

    // 2. 提取 aweme_id
    let aweme_id = extract_aweme_id(&real_url)
        .ok_or_else(|| format!("无法从链接中提取作品ID: {}", real_url))?;

    // 3. 调用抖音 API 获取作品信息
    let api_url = format!("https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={}", aweme_id);

    let api_response = client
        .get(&api_url)
        .header("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
        .header("Referer", "https://www.douyin.com/")
        .send()
        .await
        .map_err(|e| format!("API 请求失败: {}", e))?;

    let json_text = api_response
        .text()
        .await
        .map_err(|e| format!("读取响应失败: {}", e))?;

    // 打印响应内容用于调试
    println!("API 响应: {}", &json_text[..json_text.len().min(500)]);

    // 4. 解析 JSON
    let json_value: serde_json::Value = serde_json::from_str(&json_text)
        .map_err(|e| format!("JSON 解析失败: {} (响应前100字符: {})", e, &json_text[..json_text.len().min(100)]))?;

    // 5. 提取作品信息
    let item_list = json_value["item_list"]
        .as_array()
        .ok_or_else(|| format!("未找到作品列表,响应结构: {:?}", json_value.as_object().map(|o| o.keys().collect::<Vec<_>>())))?;

    if item_list.is_empty() {
        return Err(format!("作品列表为空,完整响应: {}", json_text));
    }

    let aweme = &item_list[0];

    // 6. 判断是视频还是图文
    let images = aweme["images"].as_array();
    let is_image = images.is_some() && !images.unwrap().is_empty();

    // 7. 提取数据
    let title = aweme["desc"].as_str().unwrap_or("无标题").to_string();
    let author = aweme["author"]["nickname"].as_str().unwrap_or("").to_string();

    let cover = if is_image {
        images.unwrap()[0]["url_list"][0].as_str().unwrap_or("").to_string()
    } else {
        aweme["video"]["cover"]["url_list"][0].as_str().unwrap_or("").to_string()
    };

    let video_url = if !is_image {
        aweme["video"]["play_addr"]["url_list"][0].as_str().map(|s| s.to_string())
    } else {
        None
    };

    let image_urls = if is_image {
        Some(
            images.unwrap()
                .iter()
                .filter_map(|img| img["url_list"][0].as_str().map(|s| s.to_string()))
                .collect()
        )
    } else {
        None
    };

    let duration = aweme["video"]["duration"].as_u64().map(|d| (d / 1000) as u32);
    let likes = aweme["statistics"]["digg_count"].as_u64();
    let comments = aweme["statistics"]["comment_count"].as_u64();
    let music_url = aweme["music"]["play_url"]["url_list"][0].as_str().map(|s| s.to_string());

    Ok(VideoInfo {
        title,
        cover,
        video_url,
        author,
        platform: "抖音".to_string(),
        duration,
        likes,
        comments,
        images: image_urls,
        content_type: if is_image { "image".to_string() } else { "video".to_string() },
        music_url,
    })
}

#[tauri::command]
async fn download_video(url: String, filename: String) -> Result<String, String> {
    // 创建 HTTP 客户端并添加请求头绕过防盗链
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("Referer", "https://www.douyin.com/")
        .header("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36")
        .send()
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("读取数据失败: {}", e))?;

    // 获取下载目录路径
    #[cfg(target_os = "android")]
    let download_dir = PathBuf::from("/storage/emulated/0/Download");

    #[cfg(not(target_os = "android"))]
    let download_dir = dirs::download_dir()
        .ok_or_else(|| "无法获取下载目录".to_string())?;

    // 确保下载目录存在
    fs::create_dir_all(&download_dir)
        .map_err(|e| format!("创建目录失败: {}", e))?;

    // 构建完整文件路径
    let file_path = download_dir.join(&filename);

    // 写入文件
    fs::write(&file_path, bytes)
        .map_err(|e| format!("保存文件失败: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, download_video, parse_douyin_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

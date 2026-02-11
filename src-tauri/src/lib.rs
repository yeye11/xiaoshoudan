use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

mod access_control;

const MOBILE_USER_AGENT: &str =
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

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

fn build_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .timeout(Duration::from_secs(20))
        .build()
        .map_err(|e| format!("创建客户端失败: {}", e))
}

fn detect_platform(url: &str) -> String {
    if url.contains("douyin.com") || url.contains("iesdouyin.com") {
        "抖音".to_string()
    } else if url.contains("kuaishou.com") || url.contains("chenzhongtech.com") {
        "快手".to_string()
    } else if url.contains("xiaohongshu.com") || url.contains("xhslink.com") {
        "小红书".to_string()
    } else if url.contains("tiktok.com") {
        "TikTok".to_string()
    } else {
        "未知".to_string()
    }
}

fn build_referer(url: &str) -> String {
    if let Ok(parsed) = reqwest::Url::parse(url) {
        if let Some(host) = parsed.host_str() {
            return format!("{}://{}/", parsed.scheme(), host);
        }
    }
    "https://www.douyin.com/".to_string()
}

fn get_value<'a>(root: &'a Value, path: &[&str]) -> Option<&'a Value> {
    let mut current = root;
    for key in path {
        current = current.get(*key)?;
    }
    Some(current)
}

fn get_str(root: &Value, path: &[&str]) -> Option<String> {
    get_value(root, path)
        .and_then(|value| value.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn get_u64(root: &Value, path: &[&str]) -> Option<u64> {
    get_value(root, path).and_then(|value| {
        value
            .as_u64()
            .or_else(|| value.as_i64().filter(|v| *v >= 0).map(|v| v as u64))
            .or_else(|| value.as_str().and_then(|s| s.trim().parse::<u64>().ok()))
    })
}

fn get_array_first_str(root: &Value, path: &[&str]) -> Option<String> {
    get_value(root, path)
        .and_then(|value| value.as_array())
        .and_then(|arr| arr.first())
        .and_then(|item| item.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn first_non_empty(candidates: Vec<Option<String>>) -> Option<String> {
    for candidate in candidates {
        if let Some(value) = candidate {
            let trimmed = value.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }
    None
}

fn parse_image_urls(raw: &Value) -> Vec<String> {
    let mut urls = Vec::new();
    if let Some(arr) = raw.as_array() {
        for item in arr {
            let value = if let Some(s) = item.as_str() {
                Some(s.to_string())
            } else {
                first_non_empty(vec![
                    get_str(item, &["url"]),
                    get_str(item, &["image"]),
                    get_str(item, &["img"]),
                    get_array_first_str(item, &["url_list"]),
                ])
            };

            if let Some(url) = value {
                let trimmed = url.trim();
                if !trimmed.is_empty() {
                    urls.push(trimmed.to_string());
                }
            }
        }
    }
    urls
}

fn normalize_duration_seconds(raw: Option<u64>) -> Option<u32> {
    raw.map(|value| {
        if value > 10000 {
            (value / 1000) as u32
        } else {
            value as u32
        }
    })
}

fn has_content(info: &VideoInfo) -> bool {
    match info.content_type.as_str() {
        "image" => info.images.as_ref().map(|v| !v.is_empty()).unwrap_or(false),
        _ => info
            .video_url
            .as_ref()
            .map(|v| !v.trim().is_empty())
            .unwrap_or(false),
    }
}

fn extract_router_data_json(html: &str) -> Option<String> {
    let marker = "window._ROUTER_DATA =";
    let marker_pos = html.find(marker)?;
    let after_marker = &html[marker_pos + marker.len()..];
    let json_start_rel = after_marker.find('{')?;
    let json_start = marker_pos + marker.len() + json_start_rel;
    let script_end_rel = html[json_start..].find("</script>")?;
    let script_end = json_start + script_end_rel;

    let json_text = html[json_start..script_end]
        .trim()
        .trim_end_matches(';')
        .trim();

    if json_text.is_empty() {
        None
    } else {
        Some(json_text.to_string())
    }
}

fn extract_douyin_item_from_router_data<'a>(router_data: &'a Value) -> Option<&'a Value> {
    let loader_data = router_data.get("loaderData")?.as_object()?;
    for value in loader_data.values() {
        if let Some(item) = value
            .get("videoInfoRes")
            .and_then(|v| v.get("item_list"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.first())
        {
            if item.is_object() {
                return Some(item);
            }
        }
    }
    None
}

fn extract_douyin_aweme_info(text: &str) -> Option<(String, String)> {
    let patterns = [
        (r"/video/(\d+)", "video"),
        (r"/note/(\d+)", "note"),
        (r"/slides/(\d+)", "slides"),
        (r"[?&]modal_id=(\d+)", "video"),
        (r"[?&]aweme_id=(\d+)", "video"),
    ];

    for (pattern, kind) in patterns {
        if let Ok(re) = regex::Regex::new(pattern) {
            if let Some(caps) = re.captures(text) {
                if let Some(id) = caps.get(1) {
                    return Some((id.as_str().to_string(), kind.to_string()));
                }
            }
        }
    }

    None
}

fn to_douyin_no_watermark_url(raw_url: &str) -> String {
    let sanitized = raw_url.trim().replace("\\u002F", "/");

    if let Ok(mut parsed) = reqwest::Url::parse(&sanitized) {
        let replaced_path = parsed
            .path()
            .replace("/playwm/", "/play/")
            .replace("/playwm", "/play");
        parsed.set_path(&replaced_path);

        let pairs: Vec<(String, String)> = parsed
            .query_pairs()
            .filter(|(k, _)| k != "logo_name" && k != "watermark" && k != "wm")
            .map(|(k, v)| (k.into_owned(), v.into_owned()))
            .collect();

        {
            let mut query = parsed.query_pairs_mut();
            query.clear();
            for (k, v) in pairs {
                query.append_pair(&k, &v);
            }
        }

        parsed.to_string()
    } else {
        sanitized
            .replace("/playwm/", "/play/")
            .replace("/playwm", "/play")
    }
}

fn parse_douyin_item_to_video_info(item: &Value, source_url: &str) -> Result<VideoInfo, String> {
    let raw_images = item
        .get("images")
        .or_else(|| item.get("image_infos"))
        .or_else(|| item.get("images_list"))
        .unwrap_or(&Value::Null);
    let images = parse_image_urls(raw_images);
    let is_image = !images.is_empty();

    let bitrate_video = item
        .get("video")
        .and_then(|v| v.get("bit_rate"))
        .and_then(|v| v.as_array())
        .and_then(|arr| arr.first())
        .and_then(|first| get_array_first_str(first, &["play_addr", "url_list"]));

    let raw_video_url = first_non_empty(vec![
        bitrate_video,
        get_array_first_str(item, &["video", "play_addr", "url_list"]),
        get_array_first_str(item, &["video", "download_addr", "url_list"]),
    ]);

    let result = VideoInfo {
        title: first_non_empty(vec![get_str(item, &["desc"]), get_str(item, &["title"])])
            .unwrap_or_else(|| "无标题".to_string()),
        cover: first_non_empty(vec![
            get_array_first_str(item, &["video", "cover", "url_list"]),
            get_array_first_str(item, &["video", "origin_cover", "url_list"]),
            get_array_first_str(item, &["video", "dynamic_cover", "url_list"]),
            images.first().cloned(),
        ])
        .unwrap_or_default(),
        video_url: if is_image {
            None
        } else {
            raw_video_url.map(|url| to_douyin_no_watermark_url(&url))
        },
        author: first_non_empty(vec![
            get_str(item, &["author", "nickname"]),
            get_str(item, &["author", "unique_id"]),
            get_str(item, &["author", "short_id"]),
        ])
        .unwrap_or_default(),
        platform: detect_platform(source_url),
        duration: normalize_duration_seconds(get_u64(item, &["video", "duration"])),
        likes: get_u64(item, &["statistics", "digg_count"]),
        comments: get_u64(item, &["statistics", "comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: first_non_empty(vec![
            get_array_first_str(item, &["music", "play_url", "url_list"]),
            get_str(item, &["music", "play_url", "uri"]),
        ]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("抖音分享页返回内容不完整".to_string())
    }
}

fn parse_douyin_html_to_video_info(
    html: &str,
    source_url: &str,
) -> Result<Option<VideoInfo>, String> {
    let json_text = match extract_router_data_json(html) {
        Some(text) => text,
        None => return Ok(None),
    };

    let router_data: Value =
        serde_json::from_str(&json_text).map_err(|e| format!("解析 _ROUTER_DATA 失败: {}", e))?;

    let item = match extract_douyin_item_from_router_data(&router_data) {
        Some(item) => item,
        None => return Ok(None),
    };

    let info = parse_douyin_item_to_video_info(item, source_url)?;
    Ok(Some(info))
}

async fn fetch_douyin_page(
    client: &reqwest::Client,
    target_url: &str,
) -> Result<(String, String), String> {
    let response = client
        .get(target_url)
        .header("User-Agent", MOBILE_USER_AGENT)
        .header("Accept", "application/json, text/plain, */*")
        .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
        .header("Referer", "https://www.douyin.com/")
        .send()
        .await
        .map_err(|e| format!("请求抖音页面失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("抖音页面返回异常: HTTP {}", response.status()));
    }

    let final_url = response.url().to_string();
    let html = response
        .text()
        .await
        .map_err(|e| format!("读取抖音页面失败: {}", e))?;

    Ok((html, final_url))
}

async fn try_parse_douyin_share_page(
    client: &reqwest::Client,
    source_url: &str,
) -> Result<VideoInfo, String> {
    if detect_platform(source_url) != "抖音" {
        return Err("非抖音链接，跳过抖音分享页解析".to_string());
    }

    let mut errors: Vec<String> = Vec::new();

    let (first_html, first_final_url) = fetch_douyin_page(client, source_url)
        .await
        .map_err(|e| format!("入口页失败: {}", e))?;

    match parse_douyin_html_to_video_info(&first_html, &first_final_url) {
        Ok(Some(info)) => return Ok(info),
        Ok(None) => errors.push("入口页未找到 _ROUTER_DATA".to_string()),
        Err(err) => errors.push(format!("入口页解析失败: {}", err)),
    }

    let aweme_info = extract_douyin_aweme_info(&first_final_url)
        .or_else(|| extract_douyin_aweme_info(source_url))
        .or_else(|| extract_douyin_aweme_info(&first_html));

    let (aweme_id, aweme_kind) =
        aweme_info.ok_or_else(|| format!("无法提取作品ID: {}", first_final_url))?;

    let candidate_urls = vec![
        format!(
            "https://www.iesdouyin.com/share/{}/{}/",
            aweme_kind, aweme_id
        ),
        format!("https://www.iesdouyin.com/share/video/{}/", aweme_id),
        format!("https://www.iesdouyin.com/share/note/{}/", aweme_id),
        format!("https://www.iesdouyin.com/share/slides/{}/", aweme_id),
    ];

    for candidate in candidate_urls {
        let page = fetch_douyin_page(client, &candidate).await;
        let (html, final_url) = match page {
            Ok(data) => data,
            Err(err) => {
                errors.push(format!("{} -> {}", candidate, err));
                continue;
            }
        };

        match parse_douyin_html_to_video_info(&html, &final_url) {
            Ok(Some(info)) => return Ok(info),
            Ok(None) => errors.push(format!("{} -> 无 _ROUTER_DATA 作品数据", candidate)),
            Err(err) => errors.push(format!("{} -> {}", candidate, err)),
        }
    }

    Err(format!("抖音分享页解析失败: {}", errors.join(" | ")))
}

/// 从抖音链接中提取 aweme_id
fn extract_aweme_id(url: &str) -> Option<String> {
    let patterns = [
        r"/video/(\d+)",
        r"/note/(\d+)",
        r"/slides/(\d+)",
        r"modal_id=(\d+)",
        r"aweme_id=(\d+)",
    ];

    for pattern in patterns {
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

async fn parse_douyin_via_official_api(
    client: &reqwest::Client,
    source_url: &str,
) -> Result<VideoInfo, String> {
    let response = client
        .get(source_url)
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    let real_url = response.url().to_string();
    let aweme_id = extract_aweme_id(&real_url)
        .ok_or_else(|| format!("无法从链接中提取作品ID: {}", real_url))?;

    let api_url = format!(
        "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={}",
        aweme_id
    );

    let api_response = client
        .get(&api_url)
        .header("User-Agent", MOBILE_USER_AGENT)
        .header("Referer", "https://www.douyin.com/")
        .send()
        .await
        .map_err(|e| format!("抖音官方 API 请求失败: {}", e))?;

    if !api_response.status().is_success() {
        return Err(format!(
            "抖音官方 API 返回异常: HTTP {}",
            api_response.status()
        ));
    }

    let payload: Value = api_response
        .json()
        .await
        .map_err(|e| format!("解析抖音官方 API 响应失败: {}", e))?;

    let item_list = payload
        .get("item_list")
        .and_then(|v| v.as_array())
        .ok_or_else(|| "抖音官方 API 响应中缺少 item_list".to_string())?;

    let aweme = item_list
        .first()
        .ok_or_else(|| "抖音官方 API 未返回作品数据".to_string())?;

    let images = parse_image_urls(aweme.get("images").unwrap_or(&Value::Null));
    let is_image = !images.is_empty();

    let result = VideoInfo {
        title: get_str(aweme, &["desc"]).unwrap_or_else(|| "无标题".to_string()),
        cover: if is_image {
            images.first().cloned().unwrap_or_default()
        } else {
            first_non_empty(vec![get_array_first_str(
                aweme,
                &["video", "cover", "url_list"],
            )])
            .unwrap_or_default()
        },
        video_url: if is_image {
            None
        } else {
            first_non_empty(vec![get_array_first_str(
                aweme,
                &["video", "play_addr", "url_list"],
            )])
        },
        author: get_str(aweme, &["author", "nickname"]).unwrap_or_default(),
        platform: "抖音".to_string(),
        duration: normalize_duration_seconds(get_u64(aweme, &["video", "duration"])),
        likes: get_u64(aweme, &["statistics", "digg_count"]),
        comments: get_u64(aweme, &["statistics", "comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: get_array_first_str(aweme, &["music", "play_url", "url_list"]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("抖音官方 API 返回内容不完整".to_string())
    }
}

async fn try_parse_tikwm(client: &reqwest::Client, source_url: &str) -> Result<VideoInfo, String> {
    let response = client
        .get("https://www.tikwm.com/api/")
        .query(&[("url", source_url), ("hd", "1")])
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("TikWM 请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("TikWM 返回异常: HTTP {}", response.status()));
    }

    let payload: Value = response
        .json()
        .await
        .map_err(|e| format!("TikWM 响应解析失败: {}", e))?;

    let code = payload
        .get("code")
        .and_then(|v| {
            v.as_i64()
                .or_else(|| v.as_str().and_then(|s| s.parse::<i64>().ok()))
        })
        .unwrap_or(-1);

    if code != 0 {
        return Err(format!("TikWM 返回失败 code={}", code));
    }

    let data = payload
        .get("data")
        .ok_or_else(|| "TikWM 响应缺少 data 字段".to_string())?;

    let images = parse_image_urls(data.get("images").unwrap_or(&Value::Null));
    let is_image = !images.is_empty();

    let result = VideoInfo {
        title: first_non_empty(vec![get_str(data, &["title"]), get_str(data, &["desc"])])
            .unwrap_or_else(|| "无标题".to_string()),
        cover: first_non_empty(vec![
            get_str(data, &["cover"]),
            get_str(data, &["origin_cover"]),
            images.first().cloned(),
        ])
        .unwrap_or_default(),
        video_url: if is_image {
            None
        } else {
            first_non_empty(vec![
                get_str(data, &["hdplay"]),
                get_str(data, &["play"]),
                get_str(data, &["wmplay"]),
                get_array_first_str(data, &["video", "play_addr", "url_list"]),
            ])
        },
        author: first_non_empty(vec![
            get_str(data, &["author", "nickname"]),
            get_str(data, &["author", "unique_id"]),
            get_str(data, &["author", "id"]),
        ])
        .unwrap_or_default(),
        platform: detect_platform(source_url),
        duration: normalize_duration_seconds(get_u64(data, &["duration"])),
        likes: get_u64(data, &["digg_count"]),
        comments: get_u64(data, &["comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: first_non_empty(vec![
            get_str(data, &["music"]),
            get_str(data, &["music_info", "play"]),
        ]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("TikWM 返回内容不完整".to_string())
    }
}

async fn try_parse_pearktrue(
    client: &reqwest::Client,
    source_url: &str,
) -> Result<VideoInfo, String> {
    let response = client
        .get("https://api.pearktrue.cn/api/video/douyin/")
        .query(&[("url", source_url)])
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("Pearktrue 请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Pearktrue 返回异常: HTTP {}", response.status()));
    }

    let payload: Value = response
        .json()
        .await
        .map_err(|e| format!("Pearktrue 响应解析失败: {}", e))?;

    if payload.get("code").and_then(|v| v.as_i64()) != Some(200) {
        return Err("Pearktrue 返回状态非 200".to_string());
    }

    let data = payload
        .get("data")
        .ok_or_else(|| "Pearktrue 响应缺少 data".to_string())?;

    let images = parse_image_urls(data.get("images").unwrap_or(&Value::Null));
    let is_image = !images.is_empty();

    let result = VideoInfo {
        title: first_non_empty(vec![get_str(data, &["title"]), get_str(data, &["desc"])])
            .unwrap_or_else(|| "无标题".to_string()),
        cover: first_non_empty(vec![
            get_str(data, &["cover"]),
            get_str(data, &["origin_cover"]),
            images.first().cloned(),
        ])
        .unwrap_or_default(),
        video_url: if is_image {
            None
        } else {
            first_non_empty(vec![
                get_str(data, &["url"]),
                get_str(data, &["video_url"]),
                get_str(data, &["nwm_video_url"]),
            ])
        },
        author: first_non_empty(vec![
            get_str(data, &["author"]),
            get_str(data, &["nickname"]),
            get_str(data, &["author_name"]),
        ])
        .unwrap_or_default(),
        platform: detect_platform(source_url),
        duration: normalize_duration_seconds(get_u64(data, &["duration"])),
        likes: get_u64(data, &["digg_count"]),
        comments: get_u64(data, &["comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: first_non_empty(vec![
            get_str(data, &["music_url"]),
            get_str(data, &["music"]),
        ]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("Pearktrue 返回内容不完整".to_string())
    }
}

async fn try_parse_vvhan(client: &reqwest::Client, source_url: &str) -> Result<VideoInfo, String> {
    let response = client
        .get("https://api.vvhan.com/api/video")
        .query(&[("url", source_url)])
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("VVHAN 请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("VVHAN 返回异常: HTTP {}", response.status()));
    }

    let payload: Value = response
        .json()
        .await
        .map_err(|e| format!("VVHAN 响应解析失败: {}", e))?;

    if payload.get("success").and_then(|v| v.as_bool()) != Some(true) {
        return Err("VVHAN 返回 success=false".to_string());
    }

    let data = payload
        .get("data")
        .ok_or_else(|| "VVHAN 响应缺少 data".to_string())?;

    let images = parse_image_urls(data.get("images").unwrap_or(&Value::Null));
    let is_image = !images.is_empty();

    let result = VideoInfo {
        title: get_str(data, &["title"]).unwrap_or_else(|| "无标题".to_string()),
        cover: first_non_empty(vec![get_str(data, &["cover"]), images.first().cloned()])
            .unwrap_or_default(),
        video_url: if is_image {
            None
        } else {
            first_non_empty(vec![get_str(data, &["url"]), get_str(data, &["video_url"])])
        },
        author: get_str(data, &["author"]).unwrap_or_default(),
        platform: detect_platform(source_url),
        duration: normalize_duration_seconds(get_u64(data, &["duration"])),
        likes: get_u64(data, &["digg_count"]),
        comments: get_u64(data, &["comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: first_non_empty(vec![
            get_str(data, &["music_url"]),
            get_str(data, &["music"]),
        ]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("VVHAN 返回内容不完整".to_string())
    }
}

async fn try_parse_lolimi(client: &reqwest::Client, source_url: &str) -> Result<VideoInfo, String> {
    let response = client
        .get("https://api.lolimi.cn/API/dy/")
        .query(&[("url", source_url)])
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("Lolimi 请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Lolimi 返回异常: HTTP {}", response.status()));
    }

    let payload: Value = response
        .json()
        .await
        .map_err(|e| format!("Lolimi 响应解析失败: {}", e))?;

    let code = payload
        .get("code")
        .and_then(|v| {
            v.as_i64()
                .or_else(|| v.as_str().and_then(|s| s.parse::<i64>().ok()))
        })
        .unwrap_or(-1);

    if code != 1 {
        return Err(format!("Lolimi 返回失败 code={}", code));
    }

    let data = payload
        .get("data")
        .ok_or_else(|| "Lolimi 响应缺少 data".to_string())?;

    let images = parse_image_urls(data.get("images").unwrap_or(&Value::Null));
    let is_image = !images.is_empty();

    let result = VideoInfo {
        title: first_non_empty(vec![get_str(data, &["title"]), get_str(data, &["desc"])])
            .unwrap_or_else(|| "无标题".to_string()),
        cover: first_non_empty(vec![get_str(data, &["cover"]), images.first().cloned()])
            .unwrap_or_default(),
        video_url: if is_image {
            None
        } else {
            first_non_empty(vec![
                get_str(data, &["url"]),
                get_str(data, &["video"]),
                get_str(data, &["video_url"]),
            ])
        },
        author: first_non_empty(vec![
            get_str(data, &["author"]),
            get_str(data, &["nickname"]),
        ])
        .unwrap_or_default(),
        platform: detect_platform(source_url),
        duration: normalize_duration_seconds(get_u64(data, &["duration"])),
        likes: get_u64(data, &["digg_count"]),
        comments: get_u64(data, &["comment_count"]),
        images: if is_image { Some(images) } else { None },
        content_type: if is_image {
            "image".to_string()
        } else {
            "video".to_string()
        },
        music_url: first_non_empty(vec![
            get_str(data, &["music_url"]),
            get_str(data, &["music"]),
        ]),
    };

    if has_content(&result) {
        Ok(result)
    } else {
        Err("Lolimi 返回内容不完整".to_string())
    }
}

async fn parse_video_via_providers_inner(
    client: &reqwest::Client,
    source_url: &str,
) -> Result<VideoInfo, String> {
    let mut errors = Vec::new();

    if detect_platform(source_url) == "抖音" {
        match try_parse_douyin_share_page(client, source_url).await {
            Ok(info) => return Ok(info),
            Err(err) => errors.push(format!("DouyinShare: {}", err)),
        }
    }

    match try_parse_tikwm(client, source_url).await {
        Ok(info) => return Ok(info),
        Err(err) => errors.push(format!("TikWM: {}", err)),
    }

    match try_parse_pearktrue(client, source_url).await {
        Ok(info) => return Ok(info),
        Err(err) => errors.push(format!("Pearktrue: {}", err)),
    }

    match try_parse_vvhan(client, source_url).await {
        Ok(info) => return Ok(info),
        Err(err) => errors.push(format!("VVHAN: {}", err)),
    }

    match try_parse_lolimi(client, source_url).await {
        Ok(info) => return Ok(info),
        Err(err) => errors.push(format!("Lolimi: {}", err)),
    }

    Err(format!("所有解析源均失败: {}", errors.join(" | ")))
}

#[tauri::command]
async fn parse_video_via_providers(url: String) -> Result<VideoInfo, String> {
    let client = build_http_client()?;
    parse_video_via_providers_inner(&client, &url).await
}

/// 解析抖音视频/图文链接（兼容旧命令）
#[tauri::command]
async fn parse_douyin_video(url: String) -> Result<VideoInfo, String> {
    let client = build_http_client()?;

    match try_parse_douyin_share_page(&client, &url).await {
        Ok(info) => Ok(info),
        Err(share_error) => match parse_douyin_via_official_api(&client, &url).await {
            Ok(info) => Ok(info),
            Err(official_error) => match parse_video_via_providers_inner(&client, &url).await {
                Ok(info) => Ok(info),
                Err(provider_error) => Err(format!(
                    "抖音解析失败（分享页 + 官方接口 + 备用接口）: {} | {} | {}",
                    share_error, official_error, provider_error
                )),
            },
        },
    }
}

#[tauri::command]
async fn download_video(url: String, filename: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let referer = build_referer(&url);
    let origin = referer.trim_end_matches('/').to_string();

    let response = client
        .get(&url)
        .header("Referer", &referer)
        .header("Origin", &origin)
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("下载失败: HTTP {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("读取数据失败: {}", e))?;

    #[cfg(target_os = "android")]
    let download_dir = PathBuf::from("/storage/emulated/0/Download");

    #[cfg(target_os = "ios")]
    let download_dir = std::env::temp_dir();

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let download_dir = dirs::download_dir().ok_or_else(|| "无法获取下载目录".to_string())?;

    fs::create_dir_all(&download_dir).map_err(|e| format!("创建目录失败: {}", e))?;

    let file_path = download_dir.join(&filename);
    fs::write(&file_path, bytes).map_err(|e| format!("保存文件失败: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

/// 获取视频数据 (Base64 编码)
#[tauri::command]
async fn fetch_video_base64(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {}", e))?;

    let referer = build_referer(&url);
    let origin = referer.trim_end_matches('/').to_string();

    let response = client
        .get(&url)
        .header("Referer", &referer)
        .header("Origin", &origin)
        .header("User-Agent", MOBILE_USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("获取失败: HTTP {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("读取数据失败: {}", e))?;

    use base64::{engine::general_purpose, Engine as _};
    let base64_data = general_purpose::STANDARD.encode(&bytes);

    Ok(base64_data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            download_video,
            parse_douyin_video,
            parse_video_via_providers,
            fetch_video_base64,
            access_control::check_access_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

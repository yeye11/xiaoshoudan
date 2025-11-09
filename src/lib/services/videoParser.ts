/**
 * 视频解析服务
 * 支持抖音、快手、小红书、TikTok 等平台的视频解析
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * 检测是否在 Tauri 环境中
 */
function isTauriEnvironment(): boolean {
	return typeof window !== 'undefined' && '__TAURI__' in window;
}

export interface VideoInfo {
	title: string;
	cover: string;
	videoUrl?: string; // 视频链接(视频类型时必填)
	author?: string;
	platform: string;
	duration?: number;
	likes?: number;
	comments?: number;
	images?: string[]; // 图文内容的图片数组
	type: 'video' | 'image'; // 内容类型
	musicUrl?: string; // 音乐链接
}

export interface ParseResult {
	success: boolean;
	data?: VideoInfo;
	error?: string;
}

/**
 * 检测视频平台
 */
export function detectPlatform(url: string): string {
	if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return '抖音';
	if (url.includes('kuaishou.com') || url.includes('chenzhongtech.com')) return '快手';
	if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return '小红书';
	if (url.includes('tiktok.com')) return 'TikTok';
	if (url.includes('bilibili.com')) return 'B站';
	if (url.includes('weibo.com') || url.includes('weibo.cn')) return '微博';
	return '未知';
}

/**
 * 解析 API 列表
 * 按优先级排序,如果第一个失败会尝试下一个
 *
 * 注意: 免费的抖音解析 API 经常失效,建议:
 * 1. 自己部署 Evil0ctal/Douyin_TikTok_Download_API 项目
 * 2. 使用付费 API 服务 (如 TikHub API)
 * 3. 使用浏览器扩展或其他工具
 */
const API_ENDPOINTS = [
	// API 1: 免费公共 API (经常失效)
	{
		name: 'API-1 (pearktrue)',
		url: (videoUrl: string) =>
			`https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(videoUrl)}`,
		parser: (data: any, url: string): VideoInfo | null => {
			if (data.code === 200 && data.data) {
				// 检测是否为图文内容
				const isImage = data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0;

				return {
					title: data.data.title || data.data.desc || '无标题',
					cover: data.data.cover || data.data.origin_cover || (isImage && data.data.images[0]) || '',
					videoUrl: isImage ? undefined : (data.data.url || data.data.video_url || data.data.nwm_video_url || ''),
					author: data.data.author || data.data.nickname || data.data.author_name || '',
					platform: detectPlatform(url),
					duration: data.data.duration,
					likes: data.data.digg_count,
					comments: data.data.comment_count,
					images: isImage ? data.data.images : undefined,
					type: isImage ? 'image' : 'video',
					musicUrl: data.data.music_url || data.data.music
				};
			}
			return null;
		}
	},
	// API 2: 备用 API
	{
		name: 'API-2',
		url: (videoUrl: string) =>
			`https://api.vvhan.com/api/video?url=${encodeURIComponent(videoUrl)}`,
		parser: (data: any, url: string): VideoInfo | null => {
			if (data.success && data.data) {
				const isImage = data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0;

				return {
					title: data.data.title || '无标题',
					cover: data.data.cover || (isImage && data.data.images[0]) || '',
					videoUrl: isImage ? undefined : (data.data.url || ''),
					author: data.data.author || '',
					platform: detectPlatform(url),
					images: isImage ? data.data.images : undefined,
					type: isImage ? 'image' : 'video',
					musicUrl: data.data.music_url
				};
			}
			return null;
		}
	},
	// API 3: 另一个备用 API
	{
		name: 'API-3',
		url: (videoUrl: string) =>
			`https://api.lolimi.cn/API/dy/?url=${encodeURIComponent(videoUrl)}`,
		parser: (data: any, url: string): VideoInfo | null => {
			if (data.code === 1 && data.data) {
				const isImage = data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0;

				return {
					title: data.data.title || '无标题',
					cover: data.data.cover || (isImage && data.data.images[0]) || '',
					videoUrl: isImage ? undefined : (data.data.url || data.data.video || ''),
					author: data.data.author || '',
					platform: detectPlatform(url),
					images: isImage ? data.data.images : undefined,
					type: isImage ? 'image' : 'video',
					musicUrl: data.data.music_url
				};
			}
			return null;
		}
	}
];

/**
 * 从文本中提取视频链接
 */
function extractVideoUrl(text: string): string | null {
	// 匹配常见的短链接格式
	const patterns = [
		/https?:\/\/v\.douyin\.com\/[A-Za-z0-9\-]+\/?/,
		/https?:\/\/www\.douyin\.com\/[^\s]+/,
		/https?:\/\/www\.iesdouyin\.com\/[^\s]+/,
		/https?:\/\/v\.kuaishou\.com\/[A-Za-z0-9\-]+\/?/,
		/https?:\/\/www\.kuaishou\.com\/[^\s]+/,
		/https?:\/\/xhslink\.com\/[A-Za-z0-9\-]+\/?/,
		/https?:\/\/www\.xiaohongshu\.com\/[^\s]+/,
		/https?:\/\/www\.tiktok\.com\/[^\s]+/
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			return match[0];
		}
	}

	return null;
}

/**
 * 解析视频
 * 会依次尝试多个 API,直到成功或全部失败
 */
export async function parseVideo(url: string): Promise<ParseResult> {
	if (!url || !url.trim()) {
		return {
			success: false,
			error: '请输入视频链接'
		};
	}

	// 尝试从文本中提取链接
	let videoUrl = url.trim();
	const extractedUrl = extractVideoUrl(videoUrl);
	if (extractedUrl) {
		console.log(`📎 从文本中提取到链接: ${extractedUrl}`);
		videoUrl = extractedUrl;
	}

	const platform = detectPlatform(videoUrl);
	if (platform === '未知') {
		return {
			success: false,
			error: '不支持的平台,目前仅支持抖音、快手、小红书、TikTok'
		};
	}

	// 如果是抖音链接,优先使用本地后端 API
	if (platform === '抖音') {
		try {
			// 在 Tauri 环境中使用 Rust 后端
			if (isTauriEnvironment()) {
				console.log('🦀 使用 Tauri Rust 后端解析抖音视频...');
				const videoInfo = await invoke<VideoInfo>('parse_douyin_video', { url: videoUrl });
				console.log('✅ Rust 后端解析成功:', videoInfo);
				return {
					success: true,
					data: videoInfo
				};
			} else {
				// 在浏览器环境中使用 SvelteKit API
				console.log('🌐 使用 SvelteKit 后端解析抖音视频...');
				const apiUrl = `/api/parse-douyin?url=${encodeURIComponent(videoUrl)}`;
				const response = await fetch(apiUrl);
				const result = await response.json();

				if (result.success && result.data) {
					console.log('✅ SvelteKit 后端解析成功:', result.data);
					return {
						success: true,
						data: result.data
					};
				} else {
					console.warn('❌ SvelteKit 后端解析失败:', result.error);
				}
			}
		} catch (error) {
			console.warn('❌ 本地后端解析失败,尝试使用在线 API:', error);
			// 继续尝试在线 API
		}
	}

	// 依次尝试每个 API
	for (const api of API_ENDPOINTS) {
		try {
			console.log(`尝试使用 ${api.name} 解析视频...`);

			const apiUrl = api.url(videoUrl);
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
				}
			});

			if (!response.ok) {
				console.warn(`${api.name} 请求失败: ${response.status}`);
				continue;
			}

			const data = await response.json();
			console.log(`${api.name} 返回数据:`, data);

			const videoInfo = api.parser(data, videoUrl);
			console.log(`${api.name} 解析结果:`, videoInfo);

			// 检查是否成功解析(视频类型需要有 videoUrl,图文类型需要有 images)
			if (videoInfo && (videoInfo.videoUrl || (videoInfo.type === 'image' && videoInfo.images && videoInfo.images.length > 0))) {
				console.log(`${api.name} 解析成功! 类型: ${videoInfo.type}`);
				return {
					success: true,
					data: videoInfo
				};
			} else {
				console.warn(`${api.name} 返回数据无效, videoInfo:`, videoInfo);
			}
		} catch (error) {
			console.error(`${api.name} 解析失败:`, error);
			continue;
		}
	}

	// 所有 API 都失败了
	return {
		success: false,
		error: '解析失败,请检查链接是否正确或稍后重试'
	};
}

/**
 * 将 Blob 转换为 Base64 字符串
 */
function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = (reader.result as string).split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * 检查是否有 AndroidFileSaver 接口
 */
function hasAndroidFileSaver(): boolean {
	const w: any = window as any;
	const hasInterface = w.AndroidFileSaver && typeof w.AndroidFileSaver.saveFile === 'function';
	console.log('🔍 检查 AndroidFileSaver 接口:', {
		hasWindow: typeof window !== 'undefined',
		hasAndroidFileSaver: !!w.AndroidFileSaver,
		hasSaveFile: w.AndroidFileSaver ? typeof w.AndroidFileSaver.saveFile : 'N/A',
		result: hasInterface
	});
	return hasInterface;
}

/**
 * 检查是否有 AndroidVideoDownloader 接口
 */
function hasAndroidVideoDownloader(): boolean {
	const w: any = window as any;
	const hasInterface = w.AndroidVideoDownloader && typeof w.AndroidVideoDownloader.downloadVideo === 'function';
	console.log('🔍 检查 AndroidVideoDownloader 接口:', {
		hasWindow: typeof window !== 'undefined',
		hasAndroidVideoDownloader: !!w.AndroidVideoDownloader,
		hasDownloadVideo: w.AndroidVideoDownloader ? typeof w.AndroidVideoDownloader.downloadVideo : 'N/A',
		result: hasInterface
	});
	return hasInterface;
}

/**
 * 下载视频到手机
 */
export async function downloadVideo(
	videoUrl: string,
	title: string = 'video',
	platform: string = '抖音'
): Promise<{ success: boolean; path?: string; error?: string }> {
	try {
		const filename = `${sanitizeFilename(title)}.mp4`;

		// 优先使用 Android 原生视频下载器 (直接在 Android 端下载,绕过 CORS 和防盗链)
		if (hasAndroidVideoDownloader()) {
			console.log('📱 检测到 Android 环境,使用原生视频下载器...');
			try {
				const w: any = window as any;
				console.log('📞 调用 AndroidVideoDownloader.downloadVideo()...');
				console.log(`🔗 视频 URL: ${videoUrl}`);
				console.log(`📝 文件名: ${filename}`);
				console.log(`📱 平台: ${platform}`);

				// 调用 Android 原生下载器 (异步执行,不等待结果)
				w.AndroidVideoDownloader.downloadVideo(videoUrl, filename, platform);

				console.log('✅ 已发起下载请求,请等待下载完成...');
				return { success: true, path: filename };
			} catch (error) {
				console.error('❌ Android 下载失败:', error);
				throw error;
			}
		}

		// 如果没有 Android 下载器,尝试通过后端 API 代理下载
		console.log('🌐 使用后端 API 代理下载视频...');
		const apiUrl = `/api/download-video?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;

		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`下载失败: ${response.status}`);
		}

		// 转换为 blob
		const blob = await response.blob();

		// 使用 Android 文件保存器保存
		if (hasAndroidFileSaver()) {
			console.log('📱 检测到 Android 环境,使用原生接口保存...');
			try {
				console.log(`📦 Blob 大小: ${blob.size} bytes, 类型: ${blob.type}`);
				const base64 = await blobToBase64(blob);
				console.log(`🔐 Base64 转换成功,长度: ${base64.length} 字符`);

				const w: any = window as any;
				console.log('📞 调用 AndroidFileSaver.saveFile()...');
				const success = w.AndroidFileSaver.saveFile(base64, filename, 'video/mp4');
				console.log(`📞 AndroidFileSaver.saveFile() 返回: ${success}`);

				if (success) {
					console.log('✅ 视频已保存到下载文件夹！');
					return {
						success: true,
						path: `/storage/emulated/0/Download/${filename}`
					};
				}
				console.warn('🔄 AndroidFileSaver 返回 false，回退到浏览器下载');
			} catch (e) {
				console.error('⚠️ Android 原生保存失败，回退到浏览器下载:', e);
			}
		} else {
			console.log('🌐 浏览器环境,使用浏览器下载');
		}

		// 回退到浏览器下载
		const blobUrl = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = blobUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

		return {
			success: true
		};
	} catch (error) {
		console.error('下载失败:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : '下载失败,请稍后重试'
		};
	}
}

/**
 * 清理文件名中的非法字符
 */
function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[<>:"/\\|?*]/g, '') // 移除非法字符
		.replace(/\s+/g, '_') // 空格替换为下划线
		.substring(0, 100); // 限制长度
}

/**
 * 复制链接到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('复制失败:', error);
		return false;
	}
}

/**
 * 格式化数字(点赞数、评论数等)
 */
export function formatNumber(num: number | undefined): string {
	if (!num) return '0';
	if (num >= 10000) {
		return (num / 10000).toFixed(1) + 'w';
	}
	return num.toString();
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number | undefined): string {
	if (!seconds) return '00:00';
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 检查是否有 Android 剪贴板接口
 */
function hasAndroidClipboard(): boolean {
	const w: any = window as any;
	return w.AndroidClipboard && typeof w.AndroidClipboard.readText === 'function';
}

/**
 * 从剪贴板读取文本
 * 优先使用 Android 原生接口,回退到浏览器 API
 */
export async function getClipboardText(): Promise<string> {
	// 优先使用 Android 原生剪贴板接口
	if (hasAndroidClipboard()) {
		console.log('📋 使用 Android 原生剪贴板接口...');
		try {
			const w: any = window as any;
			const text = w.AndroidClipboard.readText();
			console.log('✅ Android 剪贴板读取成功:', text.substring(0, 100));
			return text || '';
		} catch (error) {
			console.error('❌ Android 剪贴板读取失败:', error);
		}
	}

	// 回退到浏览器 Clipboard API
	try {
		console.log('📋 使用浏览器剪贴板 API...');
		const text = await navigator.clipboard.readText();
		console.log('✅ 浏览器剪贴板读取成功:', text.substring(0, 100));
		return text || '';
	} catch (error) {
		console.error('❌ 浏览器剪贴板读取失败:', error);
		return '';
	}
}

/**
 * 从剪贴板提取视频链接
 */
export async function getClipboardUrl(): Promise<string | null> {
	try {
		const text = await getClipboardText();
		if (!text) {
			console.log('⚠️ 剪贴板为空');
			return null;
		}

		// 提取链接的正则表达式
		const urlRegex = /https?:\/\/[^\s]+/g;
		const urls = text.match(urlRegex);

		if (!urls || urls.length === 0) {
			console.log('⚠️ 剪贴板中没有找到链接');
			return null;
		}

		// 返回第一个链接
		const url = urls[0];
		console.log('📎 从剪贴板提取到链接:', url);
		return url;
	} catch (error) {
		console.error('❌ 提取剪贴板链接失败:', error);
		return null;
	}
}

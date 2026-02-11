import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface ParsedVideoInfo {
	title: string;
	cover: string;
	videoUrl?: string;
	author?: string;
	platform: string;
	duration?: number;
	likes?: number;
	comments?: number;
	images?: string[];
	type: 'video' | 'image';
	musicUrl?: string;
}

const MOBILE_UA =
	'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const COMMON_HEADERS: HeadersInit = {
	'User-Agent': MOBILE_UA,
	Accept: 'application/json, text/plain, */*',
	'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

function detectPlatform(url: string): string {
	if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return '抖音';
	if (url.includes('kuaishou.com') || url.includes('chenzhongtech.com')) return '快手';
	if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return '小红书';
	if (url.includes('tiktok.com')) return 'TikTok';
	return '未知';
}

function extractFirstUrl(text: string): string {
	const match = text.match(/https?:\/\/[^\s]+/);
	return match ? match[0] : text.trim();
}

function firstNonEmpty(values: any[]): string | undefined {
	for (const value of values) {
		if (typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}
	return undefined;
}

function toNumber(value: any): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
}

function normalizeDurationSeconds(value: any): number | undefined {
	const num = toNumber(value);
	if (!num || num <= 0) return undefined;
	return num > 10000 ? Math.floor(num / 1000) : Math.floor(num);
}

function parseImageUrls(raw: any): string[] {
	if (!Array.isArray(raw)) return [];

	return raw
		.map((item) => {
			if (typeof item === 'string') return item;
			if (!item || typeof item !== 'object') return '';
			return firstNonEmpty([
				item.url,
				item.image,
				item.img,
				item.display_url,
				item.url_list?.[0],
				item.url_list?.[1]
			]);
		})
		.filter((url): url is string => Boolean(url));
}

function isValidResult(info: ParsedVideoInfo): boolean {
	const hasImages = info.type === 'image' && Array.isArray(info.images) && info.images.length > 0;
	const hasVideo = info.type === 'video' && typeof info.videoUrl === 'string' && info.videoUrl.length > 0;
	return hasImages || hasVideo;
}

function extractAwemeInfo(text: string): { id: string; kind: 'video' | 'note' | 'slides' } | null {
	const patterns: Array<{ regex: RegExp; kind: 'video' | 'note' | 'slides' }> = [
		{ regex: /\/video\/(\d+)/, kind: 'video' },
		{ regex: /\/note\/(\d+)/, kind: 'note' },
		{ regex: /\/slides\/(\d+)/, kind: 'slides' },
		{ regex: /[?&]modal_id=(\d+)/, kind: 'video' },
		{ regex: /[?&]aweme_id=(\d+)/, kind: 'video' }
	];

	for (const { regex, kind } of patterns) {
		const match = text.match(regex);
		if (match?.[1]) {
			return { id: match[1], kind };
		}
	}

	return null;
}

function toDouyinNoWatermarkUrl(rawUrl: string | undefined): string | undefined {
	if (!rawUrl || !rawUrl.trim()) return undefined;
	const sanitized = rawUrl.trim().replace(/\\u002F/g, '/');

	try {
		const parsed = new URL(sanitized);
		parsed.pathname = parsed.pathname.replace('/playwm/', '/play/').replace('/playwm', '/play');
		parsed.searchParams.delete('logo_name');
		parsed.searchParams.delete('watermark');
		parsed.searchParams.delete('wm');
		return parsed.toString();
	} catch {
		return sanitized.replace('/playwm/', '/play/').replace('/playwm', '/play');
	}
}

function extractRouterData(html: string): any | null {
	const match = html.match(/window\._ROUTER_DATA\s*=\s*(\{[\s\S]*?\})<\/script>/);
	if (!match?.[1]) return null;

	try {
		return JSON.parse(match[1]);
	} catch {
		return null;
	}
}

function extractDouyinItem(routerData: any): any | null {
	const loaderData = routerData?.loaderData;
	if (!loaderData || typeof loaderData !== 'object') return null;

	for (const value of Object.values(loaderData as Record<string, any>)) {
		const item = value?.videoInfoRes?.item_list?.[0];
		if (item && typeof item === 'object') {
			return item;
		}
	}

	return null;
}

function parseDouyinShareResult(item: any, sourceUrl: string): ParsedVideoInfo | null {
	if (!item || typeof item !== 'object') return null;

	const images = parseImageUrls(item.images || item.image_infos || item.images_list);
	const isImage = images.length > 0;

	const rawVideoUrl = firstNonEmpty([
		item.video?.bit_rate?.[0]?.play_addr?.url_list?.[0],
		item.video?.play_addr?.url_list?.[0],
		item.video?.download_addr?.url_list?.[0]
	]);
	const videoUrl = isImage ? undefined : toDouyinNoWatermarkUrl(rawVideoUrl);

	const result: ParsedVideoInfo = {
		title: firstNonEmpty([item.desc, item.title]) || '无标题',
		cover:
			firstNonEmpty([
				item.video?.cover?.url_list?.[0],
				item.video?.origin_cover?.url_list?.[0],
				item.video?.dynamic_cover?.url_list?.[0],
				images[0]
			]) || '',
		videoUrl,
		author: firstNonEmpty([item.author?.nickname, item.author?.unique_id, item.author?.short_id]) || '',
		platform: detectPlatform(sourceUrl),
		duration: normalizeDurationSeconds(item.video?.duration),
		likes: toNumber(item.statistics?.digg_count),
		comments: toNumber(item.statistics?.comment_count),
		images: isImage ? images : undefined,
		type: isImage ? 'image' : 'video',
		musicUrl: firstNonEmpty([item.music?.play_url?.url_list?.[0], item.music?.play_url?.uri])
	};

	return isValidResult(result) ? result : null;
}

async function fetchDouyinPage(url: string): Promise<{ html: string; finalUrl: string } | null> {
	const response = await fetch(url, {
		headers: {
			...COMMON_HEADERS,
			Referer: 'https://www.douyin.com/'
		},
		redirect: 'follow'
	});

	if (!response.ok) return null;
	return {
		html: await response.text(),
		finalUrl: response.url
	};
}

async function tryDouyinSharePage(inputUrl: string): Promise<ParsedVideoInfo | null> {
	const platform = detectPlatform(inputUrl);
	if (platform !== '抖音') return null;

	const firstPage = await fetchDouyinPage(inputUrl);
	if (!firstPage) return null;

	const firstRouterData = extractRouterData(firstPage.html);
	const firstItem = extractDouyinItem(firstRouterData);
	if (firstItem) {
		const parsed = parseDouyinShareResult(firstItem, firstPage.finalUrl || inputUrl);
		if (parsed) return parsed;
	}

	const awemeInfo =
		extractAwemeInfo(firstPage.finalUrl) ||
		extractAwemeInfo(inputUrl) ||
		extractAwemeInfo(firstPage.html);
	if (!awemeInfo?.id) return null;

	const shareCandidates = [
		`https://www.iesdouyin.com/share/${awemeInfo.kind}/${awemeInfo.id}/`,
		`https://www.iesdouyin.com/share/video/${awemeInfo.id}/`,
		`https://www.iesdouyin.com/share/note/${awemeInfo.id}/`,
		`https://www.iesdouyin.com/share/slides/${awemeInfo.id}/`
	];

	for (const shareUrl of shareCandidates) {
		const page = await fetchDouyinPage(shareUrl);
		if (!page) continue;

		const routerData = extractRouterData(page.html);
		const item = extractDouyinItem(routerData);
		if (!item) continue;

		const parsed = parseDouyinShareResult(item, page.finalUrl || shareUrl);
		if (parsed) return parsed;
	}

	return null;
}

async function tryTikwm(inputUrl: string): Promise<ParsedVideoInfo | null> {
	const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}&hd=1`;
	const response = await fetch(apiUrl, {
		headers: COMMON_HEADERS
	});
	if (!response.ok) return null;

	const payload: any = await response.json();
	if (!(payload?.code === 0 || payload?.code === '0') || !payload?.data) return null;

	const item = payload.data;
	const images = parseImageUrls(item.images);
	const isImage = images.length > 0;
	const videoUrl = isImage
		? undefined
		: firstNonEmpty([item.hdplay, item.play, item.wmplay, item.video?.play_addr?.url_list?.[0]]);

	const result: ParsedVideoInfo = {
		title: firstNonEmpty([item.title, item.desc]) || '无标题',
		cover: firstNonEmpty([item.cover, item.origin_cover, images[0]]) || '',
		videoUrl,
		author: firstNonEmpty([item.author?.nickname, item.author?.unique_id, item.author?.id]) || '',
		platform: detectPlatform(inputUrl),
		duration: normalizeDurationSeconds(item.duration),
		likes: toNumber(item.digg_count),
		comments: toNumber(item.comment_count),
		images: isImage ? images : undefined,
		type: isImage ? 'image' : 'video',
		musicUrl: firstNonEmpty([item.music, item.music_info?.play])
	};

	return isValidResult(result) ? result : null;
}

async function tryPearktrue(inputUrl: string): Promise<ParsedVideoInfo | null> {
	const apiUrl = `https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(inputUrl)}`;
	const response = await fetch(apiUrl, {
		headers: COMMON_HEADERS
	});
	if (!response.ok) return null;

	const payload: any = await response.json();
	if (payload?.code !== 200 || !payload?.data) return null;

	const item = payload.data;
	const images = parseImageUrls(item.images);
	const isImage = images.length > 0;

	const result: ParsedVideoInfo = {
		title: firstNonEmpty([item.title, item.desc]) || '无标题',
		cover: firstNonEmpty([item.cover, item.origin_cover, images[0]]) || '',
		videoUrl: isImage ? undefined : firstNonEmpty([item.url, item.video_url, item.nwm_video_url]),
		author: firstNonEmpty([item.author, item.nickname, item.author_name]) || '',
		platform: detectPlatform(inputUrl),
		duration: normalizeDurationSeconds(item.duration),
		likes: toNumber(item.digg_count),
		comments: toNumber(item.comment_count),
		images: isImage ? images : undefined,
		type: isImage ? 'image' : 'video',
		musicUrl: firstNonEmpty([item.music_url, item.music])
	};

	return isValidResult(result) ? result : null;
}

async function tryVvhan(inputUrl: string): Promise<ParsedVideoInfo | null> {
	const apiUrl = `https://api.vvhan.com/api/video?url=${encodeURIComponent(inputUrl)}`;
	const response = await fetch(apiUrl, {
		headers: COMMON_HEADERS
	});
	if (!response.ok) return null;

	const payload: any = await response.json();
	if (!payload?.success || !payload?.data) return null;

	const item = payload.data;
	const images = parseImageUrls(item.images);
	const isImage = images.length > 0;

	const result: ParsedVideoInfo = {
		title: firstNonEmpty([item.title]) || '无标题',
		cover: firstNonEmpty([item.cover, images[0]]) || '',
		videoUrl: isImage ? undefined : firstNonEmpty([item.url, item.video_url]),
		author: firstNonEmpty([item.author]) || '',
		platform: detectPlatform(inputUrl),
		images: isImage ? images : undefined,
		type: isImage ? 'image' : 'video',
		musicUrl: firstNonEmpty([item.music_url, item.music])
	};

	return isValidResult(result) ? result : null;
}

async function tryLolimi(inputUrl: string): Promise<ParsedVideoInfo | null> {
	const apiUrl = `https://api.lolimi.cn/API/dy/?url=${encodeURIComponent(inputUrl)}`;
	const response = await fetch(apiUrl, {
		headers: COMMON_HEADERS
	});
	if (!response.ok) return null;

	const payload: any = await response.json();
	if (!(payload?.code === 1 || payload?.code === '1') || !payload?.data) return null;

	const item = payload.data;
	const images = parseImageUrls(item.images);
	const isImage = images.length > 0;

	const result: ParsedVideoInfo = {
		title: firstNonEmpty([item.title, item.desc]) || '无标题',
		cover: firstNonEmpty([item.cover, images[0]]) || '',
		videoUrl: isImage ? undefined : firstNonEmpty([item.url, item.video, item.video_url]),
		author: firstNonEmpty([item.author, item.nickname]) || '',
		platform: detectPlatform(inputUrl),
		images: isImage ? images : undefined,
		type: isImage ? 'image' : 'video',
		musicUrl: firstNonEmpty([item.music_url, item.music])
	};

	return isValidResult(result) ? result : null;
}

export const GET: RequestHandler = async ({ url }) => {
	const rawUrl = url.searchParams.get('url');
	if (!rawUrl) {
		return json({ success: false, error: '缺少 URL 参数' }, { status: 400 });
	}

	const inputUrl = extractFirstUrl(rawUrl);
	if (!inputUrl.startsWith('http')) {
		return json({ success: false, error: '链接格式不正确' }, { status: 400 });
	}

	const parsers = [tryDouyinSharePage, tryTikwm, tryPearktrue, tryVvhan, tryLolimi];
	const errors: string[] = [];

	for (const parser of parsers) {
		try {
			const result = await parser(inputUrl);
			if (result) {
				return json({ success: true, data: result });
			}
			errors.push(`${parser.name}: 无可用数据`);
		} catch (error) {
			errors.push(`${parser.name}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	console.error('解析失败:', {
		inputUrl,
		errors
	});

	return json(
		{
			success: false,
			error: '解析失败，请稍后重试或更换链接'
		},
		{ status: 502 }
	);
};

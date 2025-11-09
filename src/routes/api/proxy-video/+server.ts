import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * 视频代理 API - 用于绕过防盗链限制,支持视频播放
 */
export const GET: RequestHandler = async ({ url, request }) => {
	const videoUrl = url.searchParams.get('url');

	if (!videoUrl) {
		throw error(400, 'Missing video URL');
	}

	try {
		// 获取客户端的 Range 请求头(用于视频流播放)
		const range = request.headers.get('range');

		// 构建请求头
		const headers: HeadersInit = {
			'Referer': 'https://www.douyin.com/',
			'User-Agent':
				'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
		};

		// 如果有 Range 请求,添加到请求头
		if (range) {
			headers['Range'] = range;
		}

		// 请求视频
		const response = await fetch(videoUrl, { headers });

		if (!response.ok) {
			throw error(response.status, `Failed to fetch video: ${response.statusText}`);
		}

		// 获取响应头
		const contentType = response.headers.get('content-type') || 'video/mp4';
		const contentLength = response.headers.get('content-length');
		const contentRange = response.headers.get('content-range');
		const acceptRanges = response.headers.get('accept-ranges');

		// 构建响应头
		const responseHeaders: HeadersInit = {
			'Content-Type': contentType,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': 'Range',
			'Cache-Control': 'public, max-age=3600'
		};

		if (contentLength) {
			responseHeaders['Content-Length'] = contentLength;
		}

		if (contentRange) {
			responseHeaders['Content-Range'] = contentRange;
		}

		if (acceptRanges) {
			responseHeaders['Accept-Ranges'] = acceptRanges;
		}

		// 返回视频流
		return new Response(response.body, {
			status: response.status,
			headers: responseHeaders
		});
	} catch (err) {
		console.error('Proxy error:', err);
		throw error(500, 'Failed to proxy video');
	}
};

// 支持 OPTIONS 请求(CORS 预检)
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': 'Range'
		}
	});
};


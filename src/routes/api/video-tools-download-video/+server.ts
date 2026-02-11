import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function buildReferer(videoUrl: string): string {
	try {
		const parsed = new URL(videoUrl);
		return `${parsed.protocol}//${parsed.host}/`;
	} catch {
		return 'https://www.douyin.com/';
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const videoUrl = url.searchParams.get('url');
	const filename = url.searchParams.get('filename') || 'video.mp4';

	if (!videoUrl) {
		throw error(400, 'Missing video URL');
	}

	try {
		const referer = buildReferer(videoUrl);

		// 使用服务器端下载,添加必要的请求头绕过防盗链
		const response = await fetch(videoUrl, {
			headers: {
				'Referer': referer,
				'Origin': referer.replace(/\/$/, ''),
				'User-Agent':
					'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
			}
		});

		if (!response.ok) {
			throw error(response.status, `Failed to download video: ${response.statusText}`);
		}

		// 获取视频数据
		const videoBuffer = await response.arrayBuffer();

		// 返回视频文件
		return new Response(videoBuffer, {
			headers: {
				'Content-Type': 'video/mp4',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
				'Content-Length': videoBuffer.byteLength.toString()
			}
		});
	} catch (err) {
		console.error('Download error:', err);
		throw error(500, 'Failed to download video');
	}
};

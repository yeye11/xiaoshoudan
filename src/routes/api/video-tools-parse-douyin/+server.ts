import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const inputUrl = url.searchParams.get('url');

	if (!inputUrl) {
		return json({ success: false, error: '缺少 URL 参数' }, { status: 400 });
	}

	try {
		console.log(`🔍 开始解析抖音链接: ${inputUrl}`);

		// 1. 先获取重定向后的真实链接
		const redirectResponse = await fetch(inputUrl, {
			method: 'GET',
			redirect: 'follow',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			}
		});

		const realUrl = redirectResponse.url;
		console.log(`📍 重定向后的真实链接: ${realUrl}`);

		// 2. 提取 aweme_id
		let awemeId: string | null = null;

		// 尝试多种模式提取 ID
		const patterns = [
			/\/video\/(\d+)/,
			/\/note\/(\d+)/,
			/\/slides\/(\d+)/,
			/modal_id=(\d+)/,
			/aweme_id=(\d+)/
		];

		for (const pattern of patterns) {
			const match = realUrl.match(pattern);
			if (match && match[1]) {
				awemeId = match[1];
				break;
			}
		}

		if (!awemeId) {
			return json({ success: false, error: `无法从链接中提取作品ID: ${realUrl}` }, { status: 400 });
		}

		console.log(`🆔 提取到作品 ID: ${awemeId}`);

		// 3. 使用第三方 API 解析 (douyin.wtf)
		const apiUrl = `https://douyin.wtf/api/hybrid/video_data?url=${encodeURIComponent(realUrl)}&minimal=false`;
		console.log(`📡 调用第三方 API: ${apiUrl}`);

		const apiResponse = await fetch(apiUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': 'application/json'
			}
		});

		if (!apiResponse.ok) {
			console.error(`❌ API 请求失败: ${apiResponse.status} ${apiResponse.statusText}`);
			return json({ success: false, error: `API 请求失败: ${apiResponse.status}` }, { status: 500 });
		}

		const responseText = await apiResponse.text();
		console.log(`📦 API 响应文本 (前500字符):`, responseText.substring(0, 500));

		if (!responseText || responseText.trim().length === 0) {
			console.error('❌ API 返回空响应');
			return json({ success: false, error: 'API 返回空响应' }, { status: 500 });
		}

		let apiData: any;
		try {
			apiData = JSON.parse(responseText);
		} catch (e) {
			console.error('❌ JSON 解析失败:', e);
			console.log('响应内容:', responseText.substring(0, 1000));
			return json({ success: false, error: 'API 返回数据格式错误' }, { status: 500 });
		}

		// 4. 检查响应数据 (douyin.wtf API 格式)
		if (!apiData || apiData.status !== 'success' || !apiData.data) {
			console.error('❌ API 返回数据无效:', apiData);
			return json({ success: false, error: 'API 返回数据无效' }, { status: 500 });
		}

		const awemeData = apiData.data;

		// 5. 判断是视频还是图文
		const images = awemeData.images;
		const isImage = images && Array.isArray(images) && images.length > 0;

		console.log(`📝 内容类型: ${isImage ? '图文' : '视频'}`);

		// 6. 提取数据
		const title = awemeData.desc || awemeData.title || '无标题';
		const author = awemeData.author?.nickname || awemeData.author?.unique_id || '';

		let cover = '';
		if (isImage && images.length > 0) {
			cover = images[0].url || images[0].url_list?.[0] || '';
		} else if (awemeData.cover) {
			cover = awemeData.cover.url_list?.[0] || awemeData.cover || '';
		}

		let videoUrl: string | undefined;
		if (!isImage && awemeData.video) {
			// douyin.wtf 提供无水印视频链接
			videoUrl = awemeData.video.play_addr?.url_list?.[0] || awemeData.video.download_addr?.url_list?.[0];
		}

		let imageUrls: string[] | undefined;
		if (isImage) {
			imageUrls = images.map((img: any) => img.url || img.url_list?.[0] || '').filter((url: string) => url);
		}

		const duration = awemeData.duration ? Math.floor(awemeData.duration / 1000) : undefined;
		const likes = awemeData.statistics?.digg_count || awemeData.digg_count;
		const comments = awemeData.statistics?.comment_count || awemeData.comment_count;
		const musicUrl = awemeData.music?.play_url?.url_list?.[0];

		// 7. 构建返回数据
		const result = {
			title,
			cover,
			videoUrl,
			author,
			platform: '抖音',
			duration,
			likes,
			comments,
			images: imageUrls,
			type: isImage ? 'image' : 'video',
			musicUrl
		};

		console.log(`✅ 解析成功! 类型: ${result.type}, 标题: ${result.title}`);

		return json({ success: true, data: result });
	} catch (error) {
		console.error('❌ 解析失败:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : '解析失败,请稍后重试'
			},
			{ status: 500 }
		);
	}
};


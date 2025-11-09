<script lang="ts">
	import { onMount } from 'svelte';
	import MobileHeader from '$lib/components/MobileHeader.svelte';
	import {
		parseVideo as parseVideoService,
		getClipboardUrl,
		downloadVideo as downloadVideoService,
		copyToClipboard,
		type VideoInfo
	} from '$lib/services/videoParser';

	let url = $state('');
	let loading = $state(false);
	let result = $state<VideoInfo | null>(null);
	let error = $state<string | null>(null);
	let downloadProgress = $state(0);
	let isDownloading = $state(false);
	let downloadedPath = $state<string | null>(null);
	let downloadSuccess = $state(false);

	// 支持的平台
	const platforms = [
		{ name: '抖音', icon: '🎵', example: 'https://v.douyin.com/xxx' },
		{ name: '快手', icon: '⚡', example: 'https://v.kuaishou.com/xxx' },
		{ name: '小红书', icon: '📕', example: 'https://xhslink.com/xxx' },
		{ name: 'TikTok', icon: '🎶', example: 'https://vm.tiktok.com/xxx' }
	];

	// 解析视频
	async function parseVideo() {
		if (!url.trim()) {
			alert('请输入视频链接');
			return;
		}

		loading = true;
		result = null;
		error = null;

		try {
			const parseResult = await parseVideoService(url);

			if (parseResult.success && parseResult.data) {
				result = parseResult.data;
			} else {
				error = parseResult.error || '解析失败';
			}
		} catch (err) {
			console.error('解析错误:', err);
			error = '解析失败,请稍后重试';
		} finally {
			loading = false;
		}
	}

	// 下载视频或图片
	async function downloadVideo() {
		if (!result) return;

		// 如果是图文,下载所有图片
		if (result.type === 'image' && result.images && result.images.length > 0) {
			await downloadImages();
			return;
		}

		// 如果是视频
		if (!result.videoUrl) return;

		isDownloading = true;
		downloadProgress = 0;
		downloadSuccess = false;
		downloadedPath = null;

		try {
			// 模拟下载进度
			const progressInterval = setInterval(() => {
				if (downloadProgress < 90) {
					downloadProgress += 10;
				}
			}, 200);

			const downloadResult = await downloadVideoService(result.videoUrl, result.title, result.platform);

			clearInterval(progressInterval);
			downloadProgress = 100;

			if (downloadResult.success) {
				downloadSuccess = true;
				downloadedPath = downloadResult.path || null;

				setTimeout(() => {
					alert(
						downloadResult.path
							? `视频已保存到:\n${downloadResult.path}`
							: '视频下载成功!'
					);
				}, 300);
			} else {
				alert(downloadResult.error || '下载失败,请尝试长按视频保存');
			}

			setTimeout(() => {
				isDownloading = false;
				downloadProgress = 0;
			}, 1000);
		} catch (err) {
			console.error('下载错误:', err);
			alert('下载失败,请尝试长按视频保存');
			isDownloading = false;
			downloadProgress = 0;
		}
	}

	// 下载图片
	async function downloadImages() {
		if (!result?.images || result.images.length === 0) return;

		isDownloading = true;
		downloadProgress = 0;
		downloadSuccess = false;

		try {
			const total = result.images.length;
			let completed = 0;

			for (const imageUrl of result.images) {
				const filename = `${result.title}_${completed + 1}.jpg`;
				await downloadVideoService(imageUrl, filename);
				completed++;
				downloadProgress = Math.round((completed / total) * 100);
			}

			downloadSuccess = true;
			setTimeout(() => {
				alert(`已保存 ${total} 张图片到手机下载目录`);
			}, 300);

			setTimeout(() => {
				isDownloading = false;
				downloadProgress = 0;
			}, 1000);
		} catch (err) {
			console.error('下载图片错误:', err);
			alert('下载失败,请稍后重试');
			isDownloading = false;
			downloadProgress = 0;
		}
	}

	// 复制链接
	async function copyUrl() {
		if (!result?.videoUrl) return;

		const success = await copyToClipboard(result.videoUrl);
		if (success) {
			alert('视频链接已复制到剪贴板');
		} else {
			alert('复制失败,请手动复制');
		}
	}

	// 清空
	function reset() {
		url = '';
		result = null;
		error = null;
		downloadProgress = 0;
		isDownloading = false;
		downloadedPath = null;
		downloadSuccess = false;
	}

	// 粘贴剪贴板内容
	async function pasteFromClipboard() {
		try {
			const clipboardUrl = await getClipboardUrl();
			if (clipboardUrl) {
				url = clipboardUrl;
			} else {
				const text = await navigator.clipboard.readText();
				if (text) {
					url = text;
				}
			}
		} catch (err) {
			console.error('读取剪贴板失败:', err);
		}
	}

	// 页面加载时自动检查剪贴板
	onMount(async () => {
		const clipboardUrl = await getClipboardUrl();
		if (clipboardUrl) {
			url = clipboardUrl;
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<MobileHeader title="视频去水印" showBack={true} />

	<div class="p-4 space-y-4">
		<!-- 平台说明 -->
		<div class="bg-white rounded-lg p-4 shadow-sm">
			<h3 class="text-sm font-medium text-gray-700 mb-3">支持平台</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each platforms as platform}
					<div class="flex items-center space-x-2 text-sm text-gray-600">
						<span class="text-xl">{platform.icon}</span>
						<span>{platform.name}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- 输入区域 -->
		<div class="bg-white rounded-lg p-4 shadow-sm">
			<label for="video-url-input" class="block text-sm font-medium text-gray-700 mb-2">
				视频链接
			</label>
			<div class="flex space-x-2">
				<input
					id="video-url-input"
					type="text"
					bind:value={url}
					placeholder="粘贴抖音/快手/小红书视频链接"
					class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					onkeypress={(e) => e.key === 'Enter' && parseVideo()}
				/>
				<button
					onclick={pasteFromClipboard}
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					📋 粘贴
				</button>
			</div>
			
			<div class="mt-3 flex space-x-2">
				<button
					onclick={parseVideo}
					disabled={loading || !url.trim()}
					class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? '解析中...' : '🔍 解析视频'}
				</button>
				{#if url || result}
					<button
						onclick={reset}
						class="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						🔄 重置
					</button>
				{/if}
			</div>
		</div>

		<!-- 错误信息 -->
		{#if error}
			<div class="bg-white rounded-lg p-4 shadow-sm">
				<div class="flex items-center space-x-3 text-red-600">
					<span class="text-2xl">❌</span>
					<div>
						<p class="font-medium">解析失败</p>
						<p class="text-sm text-red-500">{error}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- 解析结果 -->
		{#if result}
			<div class="bg-white rounded-lg p-4 shadow-sm">
				<!-- 成功结果 -->
				<div class="space-y-4">
					<!-- 视频信息 -->
					<div class="flex items-start space-x-3">
						{#if result.cover}
							<img
								src={result.cover}
								alt="封面"
								class="w-24 h-24 object-cover rounded-lg"
							/>
						{/if}
						<div class="flex-1 min-w-0">
							<p class="font-medium text-gray-900 line-clamp-2">
								{result.title}
							</p>
							{#if result.author}
								<p class="text-sm text-gray-500 mt-1">
									👤 {result.author}
								</p>
							{/if}
							{#if result.platform}
								<p class="text-xs text-gray-400 mt-1">
									📱 {result.platform}
								</p>
							{/if}
						</div>
					</div>

					<!-- 内容预览 -->
					{#if result.type === 'video' && result.videoUrl}
						<!-- 视频预览 -->
						<!-- svelte-ignore a11y_media_has_caption -->
						<video
							src={result.videoUrl}
							controls
							class="w-full rounded-lg"
							poster={result.cover}
						>
							您的浏览器不支持视频播放
						</video>
					{:else if result.type === 'image' && result.images && result.images.length > 0}
						<!-- 图文预览 -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<p class="text-sm text-gray-600">
									📷 共 {result.images.length} 张图片
								</p>
							</div>
							<div class="grid grid-cols-2 gap-2">
								{#each result.images as image, index}
									<img
										src={image}
										alt="图片 {index + 1}"
										class="w-full h-48 object-cover rounded-lg"
									/>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 下载进度 -->
					{#if isDownloading}
						<div class="space-y-2">
							<div class="flex justify-between text-sm text-gray-600">
								<span>正在保存到手机...</span>
								<span>{downloadProgress}%</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div
									class="bg-blue-500 h-2 rounded-full transition-all duration-300"
									style="width: {downloadProgress}%"
								></div>
							</div>
						</div>
					{/if}

					<!-- 下载成功提示 -->
					{#if downloadSuccess && downloadedPath}
						<div class="bg-green-50 border border-green-200 rounded-lg p-3">
							<div class="flex items-start space-x-2">
								<span class="text-green-500 text-xl">✅</span>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-green-900">保存成功!</p>
									<p class="text-xs text-green-700 mt-1 break-all">
										{downloadedPath}
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- 操作按钮 -->
					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={downloadVideo}
							disabled={isDownloading}
							class="px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
						>
							{#if isDownloading}
								💾 保存中...
							{:else if result.type === 'image'}
								💾 保存图片
							{:else}
								💾 保存视频
							{/if}
						</button>
						{#if result.type === 'video' && result.videoUrl}
							<button
								onclick={copyUrl}
								class="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
							>
								📋 复制链接
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- 使用说明 -->
		<div class="bg-blue-50 rounded-lg p-4">
			<h3 class="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h3>
			<ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
				<li>打开抖音/快手等 APP,找到想要下载的视频或图文</li>
				<li>点击分享按钮,选择"复制链接"</li>
				<li>返回本应用,点击"粘贴"按钮</li>
				<li>点击"解析视频"获取无水印内容</li>
				<li>支持视频和图文内容,可在线预览或保存到手机</li>
			</ol>
		</div>

		<!-- 免责声明 -->
		<div class="bg-yellow-50 rounded-lg p-4">
			<h3 class="text-sm font-medium text-yellow-900 mb-2">⚠️ 免责声明</h3>
			<p class="text-xs text-yellow-800">
				本功能仅供个人学习和研究使用,请勿用于商业用途。下载的视频/图片版权归原作者所有,请尊重原创,合理使用。
			</p>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>


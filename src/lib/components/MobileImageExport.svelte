<script lang="ts">
  import { onMount } from 'svelte';
  import html2canvas from 'html2canvas';
  import { IMAGE_EXPORT_CONFIG } from '$lib/utils/imageExport';

  export let targetElement: HTMLElement | null = null;
  export let fileName: string = 'document';
  export let showButton: boolean = true;

  let isExporting = false;
  let isTauri = false;

  // 仅导出销售单内容；可通过 selector 定制
  export let selector: string = '.sales-invoice';
  let html2canvasFn: ((el: HTMLElement, opts?: any) => Promise<HTMLCanvasElement>) | null = null;
  let supportsShare = false;

  onMount(async () => {
    // 检测是否在 Tauri 环境中（Android WebView）
    isTauri = '__TAURI_INTERNALS__' in window || '__TAURI_INVOKE__' in window || '__TAURI__' in window;
    supportsShare = !!navigator.share;

    console.log('🔍 环境检测:', {
      '__TAURI_INTERNALS__': '__TAURI_INTERNALS__' in window,
      '__TAURI_INVOKE__': '__TAURI_INVOKE__' in window,
      '__TAURI__': '__TAURI__' in window,
      'isTauri': isTauri,
      'AndroidImageSaver': 'AndroidImageSaver' in window
    });

    // 直接使用静态导入的 html2canvas
    html2canvasFn = html2canvas;
    console.log('✅ html2canvas 已加载');
  });

  // 使用 Android 原生方法保存图片（通过 JavaScript 接口）
  async function saveWithAndroidNative(blob: Blob, filename: string) {
    try {
      console.log('📱 使用 Android 原生方法保存图片:', filename);

      // 将 Blob 转换为 Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;
      console.log('📦 Base64 数据长度:', base64Data.length);

      // 调用 Android 原生方法
      // @ts-ignore - AndroidImageSaver 是在 Android WebView 中注入的
      if (window.AndroidImageSaver && typeof window.AndroidImageSaver.saveImage === 'function') {
        console.log('🚀 调用 AndroidImageSaver.saveImage()');
        const success = window.AndroidImageSaver.saveImage(base64Data, filename);

        if (success) {
          console.log('✅ Android 原生保存成功！');
          alert(`✅ 图片已保存到相册！\n\n文件名：${filename}`);
        } else {
          console.error('❌ Android 原生保存失败');
          alert(`❌ 保存失败，请检查权限设置`);
        }
      } else {
        console.error('❌ AndroidImageSaver 不可用');
        alert(`❌ 保存功能不可用，请确保在 Android 应用中运行`);
      }
    } catch (error: any) {
      console.error('❌ Android 原生保存失败:', error);
      alert(`❌ 保存失败：${error.message}`);
      throw error;
    }
  }

  // 使用 Tauri API 保存文件到 Android 下载文件夹（备用方案）
  async function saveBlobWithTauri(blob: Blob, filename: string) {
    try {
      console.log('🔧 使用 Tauri API 保存文件:', filename);

      // 将 Blob 转换为 Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;
      console.log('📦 Base64 数据长度:', base64Data.length);

      // 使用 Tauri 的 writeFile API
      const { writeFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');

      console.log('📁 保存文件到图片文件夹...');

      // 将 base64 转换为字节数组
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 使用 Picture 目录，这样文件会自动显示在相册中
      await writeFile(filename, bytes, { baseDir: BaseDirectory.Picture });

      console.log('✅ 文件保存成功!');
      alert(`✅ 图片已保存成功！\n\n文件名：${filename}\n\n请在相册或文件管理器的"图片"文件夹中查看`);
    } catch (error: any) {
      console.error('❌ Tauri 保存失败:', error);
      alert(`❌ 保存失败：${error}\n\n请尝试使用截图功能保存图片`);
      throw error;
    }
  }

  // 浏览器下载方式
  function downloadBlobAsBrowser(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);

    alert(`✅ 图片已保存！\n\n文件名：${filename}\n\n请在浏览器下载文件夹中查看`);
  }

  // 使用 html2canvas 截取“销售单”并生成 1280x720 PNG
  const exportAsImage = async () => {
    console.log('🔍 exportAsImage 开始');
    console.log('targetElement:', targetElement);

    if (!targetElement) {
      console.error('❌ targetElement 为空');
      showFallbackMethods();
      return;
    }

    if (!html2canvasFn) {
      console.error('❌ html2canvas 未加载');
      showFallbackMethods();
      return;
    }

    isExporting = true;
    console.log('✅ 开始导出，isExporting =', isExporting);

    try {
      // 1) 找到要导出的节点：优先仅销售单
      const sourceEl = (selector ? (targetElement.querySelector(selector) as HTMLElement | null) : null)
        || (targetElement.querySelector('.sales-invoice') as HTMLElement | null)
        || (targetElement.querySelector('.delivery-note') as HTMLElement | null)
        || targetElement;

      console.log('📄 找到源元素:', sourceEl);

      // 2) 克隆到离屏容器，自适应尺寸 + 白底
      const offscreen = document.createElement('div');
      offscreen.style.position = 'fixed';
      offscreen.style.left = '-10000px';
      offscreen.style.top = '0';
      offscreen.style.background = '#ffffff';
      offscreen.style.padding = '0';
      offscreen.style.margin = '0';
      offscreen.style.zIndex = '-1';

      const clone = (sourceEl as HTMLElement).cloneNode(true) as HTMLElement;

      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      // 设置容器样式，让内容自适应
      clone.style.margin = '0';
      clone.style.background = '#ffffff';

      // 强制设置宽度为 A4 纸张宽度（210mm ≈ 794px）
      clone.style.setProperty('width', '794px', 'important');
      clone.style.setProperty('max-width', '794px', 'important');
      clone.style.setProperty('min-width', '794px', 'important');

      // 移除所有 oklch 颜色，替换为标准颜色
      const removeOklchColors = (element: HTMLElement) => {
        // 移除所有元素的 class，避免 Tailwind 的 oklch 颜色
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // 获取计算后的样式
          const computedStyle = window.getComputedStyle(htmlEl);

          // 将重要的样式直接设置为内联样式（使用计算后的值）
          if (computedStyle.color && computedStyle.color.includes('oklch')) {
            htmlEl.style.color = '#000000'; // 默认黑色
          }
          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
            htmlEl.style.backgroundColor = 'transparent';
          }
          if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
            htmlEl.style.borderColor = '#000000';
          }
        });
      };

      removeOklchColors(clone);

      try { await (document as any).fonts?.ready; } catch {}

      // 3) 截图 (html2canvas-pro 支持 oklch 颜色)
      console.log('🎨 开始调用 html2canvas...');
      let canvas;
      try {
        canvas = await html2canvasFn(clone, {
          backgroundColor: IMAGE_EXPORT_CONFIG.backgroundColor,
          scale: IMAGE_EXPORT_CONFIG.scale,
          useCORS: IMAGE_EXPORT_CONFIG.useCORS,
          allowTaint: true,
          logging: IMAGE_EXPORT_CONFIG.logging
        });
        console.log('✅ html2canvas 完成，canvas:', canvas);
      } catch (canvasError) {
        console.error('❌ html2canvas 失败:', canvasError);
        document.body.removeChild(offscreen);
        alert(`❌ 图片生成失败：${canvasError}\n\n请尝试截图功能`);
        return;
      }

      // 清理离屏容器
      document.body.removeChild(offscreen);
      console.log('🧹 离屏容器已清理');

      // 4) 保存图片
      console.log('💾 开始转换 canvas 为 blob...');
      canvas.toBlob(async (blob) => {
        console.log('📦 toBlob 回调执行，blob:', blob);

        if (!blob) {
          console.error('❌ blob 为空');
          alert('❌ 图片生成失败，请重试');
          return;
        }

        console.log('✅ blob 生成成功，大小:', blob.size, 'bytes');

        const base = `${fileName}-${new Date().toISOString().split('T')[0]}`;
        const fullFileName = `${base}${IMAGE_EXPORT_CONFIG.fileExtension}`;
        console.log('📝 文件名:', fullFileName);

        // 检查是否在 Android WebView 中，并且有原生保存接口
        // @ts-ignore
        if (isTauri && window.AndroidImageSaver && typeof window.AndroidImageSaver.saveImage === 'function') {
          console.log('📱 检测到 Android 原生接口，使用原生方法保存');
          await saveWithAndroidNative(blob, fullFileName);
        } else {
          // 备用方案：使用浏览器下载 API
          console.log('🔍 检查环境 - isTauri:', isTauri);
          console.log('🌐 使用浏览器下载 API（备用方案）...');
          downloadBlobAsBrowser(blob, fullFileName);
        }

        // 可选：尝试分享（不影响下载）
        try {
          // @ts-ignore Web Share Level 2
          if (navigator.canShare && supportsShare) {
            const file = new File([blob], fullFileName, { type: IMAGE_EXPORT_CONFIG.format });
            // @ts-ignore
            if (navigator.canShare({ files: [file] })) {
              // 询问是否要分享
              const shouldShare = confirm('图片已下载！是否要分享到其他应用？');
              if (shouldShare) {
                // @ts-ignore
                await navigator.share({ files: [file], title: base, text: '销售单据' });
              }
            }
          }
        } catch (err) {
          // 分享失败不影响下载，静默处理
          console.log('分享取消或失败:', err);
        }
      }, IMAGE_EXPORT_CONFIG.format, IMAGE_EXPORT_CONFIG.quality);
    } catch (error) {
      console.error('图片导出失败:', error);
      showFallbackMethods();
    } finally { isExporting = false; }
  };


  // 显示备用保存方法
  const showFallbackMethods = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      alert(
        '📱 移动端保存图片方法：\n\n' +
        '1. 📸 截图保存：\n' +
        '   • Android: 同时按住电源键+音量下键\n' +
        '   • iPhone: 同时按住侧边键+音量上键\n' +
        '   • 然后裁剪需要的区域\n\n' +
        '2. 🖼️ 长按保存：\n' +
        '   • 长按单据图片\n' +
        '   • 选择"保存图片"或"保存到相册"\n\n' +
        '3. 📤 分享功能：\n' +
        '   • 使用系统分享功能\n' +
        '   • 发送到微信、QQ等应用保存'
      );
    } else {
      alert(
        '💻 桌面端保存图片方法：\n\n' +
        '1. 🖼️ 右键保存：\n' +
        '   • 在单据上右键点击\n' +
        '   • 选择"另存为图片"\n\n' +
        '2. 📸 截图工具：\n' +
        '   • Windows: Win + Shift + S\n' +
        '   • Mac: Cmd + Shift + 4\n' +
        '   • 选择单据区域截图\n\n' +
        '3. 🖨️ 打印为PDF：\n' +
        '   • 使用浏览器打印功能\n' +
        '   • 选择"保存为PDF"'
      );
    }
  };

  // 使用系统分享 API（如果支持）
  const shareImage = async () => {
    if (!navigator.share) {
      showFallbackMethods();
      return;
    }

    try {
      await navigator.share({
        title: fileName,
        text: '销售单据',
        url: window.location.href
      });
    } catch (error) {
      console.error('分享失败:', error);
      showFallbackMethods();
    }
  };


</script>

{#if showButton}
  <div class="flex flex-col space-y-2">
    <!-- 主要导出按钮 -->
    <button
      on:click={exportAsImage}
      disabled={isExporting}
      class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      {#if isExporting}
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>导出中...</span>
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12"></path>
        </svg>
        <span>保存图片</span>
      {/if}
    </button>

    <!-- 备用方法按钮 -->
    <div class="flex space-x-2">
      <button
        on:click={showFallbackMethods}
        class="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm"
      >
        保存方法
      </button>

      {#if supportsShare}
        <button
          on:click={shareImage}
          class="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm"
        >
          分享
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* 确保按钮在移动端有合适的触摸目标大小 */
  button {
    min-height: 44px;
    touch-action: manipulation;
  }
</style>

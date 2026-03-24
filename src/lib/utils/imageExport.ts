import { toCanvas } from 'html-to-image';
import {
  removeOklchColors,
  prepareElementForExport,
  applyExportStyleAdjustments,
  calculateScale
} from './exportHelpers';
import { blobToBase64, hasAndroidImageSaver, downloadBlobAsBrowser } from './androidHelpers';

/**
 * 统一的图片导出配置
 */
export const IMAGE_EXPORT_CONFIG = {
  fixedPixelWidth: 1800,
  fixedCssWidth: 600,
  scale: 3,
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false,
  format: 'image/jpeg' as const,
  quality: 1.0,
  fileExtension: '.jpg' as const
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 导出HTML元素为图片
 * @param element - 要导出的HTML元素
 * @param fileName - 文件名（不含扩展名）
 * @param customWidth - 自定义CSS宽度（可选）
 * @returns Promise<void>
 */
export const exportElementAsImage = async (
  element: HTMLElement,
  fileName: string,
  customWidth?: number
): Promise<void> => {
  try {
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    const cssWidth = customWidth ?? IMAGE_EXPORT_CONFIG.fixedCssWidth ?? Math.max(1, Math.round(element.getBoundingClientRect().width || element.offsetWidth));

    await new Promise(resolve => setTimeout(resolve, 50));
    try { await (document as any).fonts?.ready; } catch {}

    const { clone, offscreen } = prepareElementForExport(element, cssWidth);
    const computedScale = calculateScale(cssWidth, IMAGE_EXPORT_CONFIG.fixedPixelWidth, IMAGE_EXPORT_CONFIG.scale);

    applyExportStyleAdjustments(clone, 0);

    const canvas = await toCanvas(clone, {
      pixelRatio: computedScale,
      backgroundColor: IMAGE_EXPORT_CONFIG.backgroundColor,
      cacheBust: true,
      skipAutoScale: true,
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRElEQkSuQmCC',
    });

    document.body.removeChild(offscreen);
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          try {
            if (!blob) {
              const dataUrl = canvas.toDataURL(IMAGE_EXPORT_CONFIG.format, IMAGE_EXPORT_CONFIG.quality);
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `${fileName}${IMAGE_EXPORT_CONFIG.fileExtension}`;
              link.click();
              resolve();
              return;
            }

            const fullName = `${fileName}${IMAGE_EXPORT_CONFIG.fileExtension}`;

            if (hasAndroidImageSaver()) {
              try {
                const base64 = await blobToBase64(blob);
                const w: any = window as any;
                const ok = w.AndroidImageSaver.saveImage(base64, fullName);
                if (ok) { resolve(); return; }
                console.warn('🔄 AndroidImageSaver 返回 false，回退到浏览器下载');
              } catch (e) {
                console.warn('⚠️ Android 原生保存失败，回退到浏览器下载:', e);
              }
            }

            downloadBlobAsBrowser(blob, fullName);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        IMAGE_EXPORT_CONFIG.format,
        IMAGE_EXPORT_CONFIG.quality
      );
    });
  } catch (error) {
    console.error('❌ 导出失败:', error);
    throw error;
  }
};

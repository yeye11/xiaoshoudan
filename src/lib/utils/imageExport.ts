import html2canvas from 'html2canvas';

/**
 * 统一的图片导出配置
 */
export const IMAGE_EXPORT_CONFIG = {
  scale: 1, // 1:1 缩放，输出实际尺寸
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false,
  format: 'image/jpeg' as const,
  quality: 0.95,
  fileExtension: '.jpg' as const
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 移除元素中的 oklch 颜色（html2canvas 不支持）
 * @param element - 要处理的HTML元素
 */
const removeOklchColors = (element: HTMLElement): void => {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);

    // 检查并替换 oklch 颜色
    if (computedStyle.color && computedStyle.color.includes('oklch')) {
      htmlEl.style.color = '#000000';
    }
    if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
      htmlEl.style.backgroundColor = 'transparent';
    }
    if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
      htmlEl.style.borderColor = '#000000';
    }
  });
};

/**
 * 导出HTML元素为图片
 * @param element - 要导出的HTML元素
 * @param fileName - 文件名（不含扩展名）
 * @returns Promise<void>
 */
export const exportElementAsImage = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    // 保存原始样式
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    // 临时修改元素宽度为 A4 纸张宽度（210mm ≈ 794px）
    element.style.setProperty('width', '794px', 'important');
    element.style.setProperty('max-width', '794px', 'important');

    // 等待 DOM 重排
    await new Promise(resolve => setTimeout(resolve, 100));

    // 克隆元素以避免修改原始DOM
    const clone = element.cloneNode(true) as HTMLElement;

    // 创建离屏容器
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-10000px';
    offscreen.style.top = '0';
    offscreen.style.zIndex = '-1';
    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    // 移除 oklch 颜色
    removeOklchColors(clone);

    // 使用 html2canvas 生成图片
    const canvas = await html2canvas(clone, {
      scale: IMAGE_EXPORT_CONFIG.scale,
      useCORS: IMAGE_EXPORT_CONFIG.useCORS,
      backgroundColor: IMAGE_EXPORT_CONFIG.backgroundColor,
      logging: IMAGE_EXPORT_CONFIG.logging
    });

    // 清理离屏容器
    document.body.removeChild(offscreen);

    // 恢复原始样式
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;

    // 转换为图片并下载
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}${IMAGE_EXPORT_CONFIG.fileExtension}`;
            link.click();
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('生成图片失败'));
          }
        },
        IMAGE_EXPORT_CONFIG.format,
        IMAGE_EXPORT_CONFIG.quality
      );
    });
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
};


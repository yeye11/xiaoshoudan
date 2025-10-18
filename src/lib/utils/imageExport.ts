import html2canvas from 'html2canvas';

/**
 * 统一的图片导出配置
 */
export const IMAGE_EXPORT_CONFIG = {
  scale: 3, // 2倍缩放提高清晰度
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
 * 在克隆节点上，规范化表格单元格的垂直/水平对齐，避免 html2canvas 的兼容性差异
 * 仅作用于克隆体，不影响页面真实 DOM
 */
const normalizeTableCellsForExport = (root: HTMLElement): void => {
  const cells = root.querySelectorAll('th, td');
  cells.forEach((el) => {
    const cell = el as HTMLElement;
    const rect = cell.getBoundingClientRect();
    const cs = window.getComputedStyle(cell);

    // 仅在导出用克隆体上，消除上下内边距对视觉中心的影响
    // 保留左右 padding，不改变水平间距
    const pl = cs.paddingLeft;
    const pr = cs.paddingRight;
    cell.style.paddingTop = '0px';
    cell.style.paddingBottom = '0px';
    cell.style.paddingLeft = pl;
    cell.style.paddingRight = pr;

    // 锁定高度，避免渲染时行高被重算导致偏移
    if (rect.height > 0) {
      cell.style.height = `${rect.height}px`;
      cell.style.minHeight = `${rect.height}px`;
    }

    // 确保盒模型一致
    cell.style.boxSizing = 'border-box';
    // 明确 vertical-align，提升一致性
    cell.style.verticalAlign = 'middle';
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

    // 根据页面当前渲染宽度导出，跟随页面宽度
    const rect = element.getBoundingClientRect();
    const targetWidth = Math.max(1, Math.round(rect.width || element.offsetWidth));
    element.style.setProperty('width', `${targetWidth}px`, 'important');
    element.style.setProperty('max-width', `${targetWidth}px`, 'important');

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

    // 规范化表格单元格（仅作用于克隆体）
    normalizeTableCellsForExport(clone);

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

    // 转换为图片并下载（包含 dataURL 兜底，避免个别环境 toBlob 返回 null）
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
            try {
              const dataUrl = canvas.toDataURL(IMAGE_EXPORT_CONFIG.format, IMAGE_EXPORT_CONFIG.quality);
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `${fileName}${IMAGE_EXPORT_CONFIG.fileExtension}`;
              link.click();
              resolve();
            } catch (e) {
              reject(new Error('生成图片失败：toBlob 返回空且 dataURL 兜底失败'));
            }
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


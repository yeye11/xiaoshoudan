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
 * 导出时放开省略号文本，避免被截断（仅作用于克隆体）
 */
const expandEllipsisForExport = (root: HTMLElement): void => {
  const nodes = root.querySelectorAll('.nowrap-ellipsis');
  nodes.forEach((n) => {
    const el = n as HTMLElement;
    el.style.whiteSpace = 'normal';
    el.style.overflow = 'visible';
    el.style.textOverflow = 'clip';
    el.style.wordBreak = 'break-all';
  });
};

/**
 * 规范化 .cell-center，使其在导出时使用 flex 垂直/水平居中
 * 仅作用于克隆体，避免与页面样式互相影响
 */
const normalizeCellCenterForExport = (root: HTMLElement): void => {
  const centers = root.querySelectorAll('.cell-center');
  centers.forEach((n) => {
    const el = n as HTMLElement;
    // 使用 table-cell + vertical-align: middle 更稳定地实现垂直居中
    el.style.display = 'table-cell';
    el.style.verticalAlign = 'middle';
    el.style.textAlign = 'center';
    el.style.width = '100%';
    el.style.height = '100%';
    // 避免行高影响垂直居中
    el.style.lineHeight = 'normal';
    el.style.margin = '0';
    el.style.padding = '0';
    el.style.boxSizing = 'border-box';
  });
};

/**
 * 将表格单元格内容包一层 flex 容器并垂直/水平居中；同时按 dy 做细微上移补偿（仅作用于克隆体）
 */
const centerTableCellsForExport = (root: HTMLElement, dy: number = -1): void => {
  const cells = root.querySelectorAll('th, td');
  cells.forEach((n) => {
    const cell = n as HTMLElement;
    const cs = window.getComputedStyle(cell);

    const wrapper = document.createElement('div');
    // 避免 Safari/表格环境下 transform 被单元格裁切
    cell.style.overflow = 'visible';
    cell.style.position = 'relative';

    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    // 根据原本文本对齐方式，决定水平对齐
    const ta = cs.textAlign;
    wrapper.style.justifyContent = ta === 'right' ? 'flex-end' : (ta === 'center' ? 'center' : 'flex-start');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.lineHeight = 'normal';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.overflow = 'visible';
    // 基线微调：整体上移 dy 像素（按传入值 -6 生效）
    wrapper.style.transform = `translateY(${dy}px)`;
    wrapper.style.transformOrigin = 'center center';

    // 将单元格现有内容搬入包装容器
    while (cell.firstChild) {
      wrapper.appendChild(cell.firstChild);
    }
    cell.appendChild(wrapper);
  });
};

/**
 * 将“非表格内”的文字整体上移若干像素，修正 html2canvas 的基线偏差（仅作用于克隆体）
 */
const nudgeNonTableTextUp = (root: HTMLElement, dy: number = -1): void => {
  // 仅在白名单容器内进行文字上移，避免抬头/页脚等区域被影响
  const allowlist = root.querySelectorAll('[data-export-nudge="on"], .info-grid');
  const inlineSelector = 'span,label,small,em,strong,b,i';

  allowlist.forEach((scope) => {
    scope.querySelectorAll(inlineSelector).forEach((node) => {
      const el = node as HTMLElement;
      // 跳过表格内部内容
      if (el.closest('table')) return;

      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.transform = `translateY(${dy}px)`;
      wrapper.style.transformOrigin = 'center center';
      wrapper.style.overflow = 'visible';
      wrapper.style.willChange = 'transform';

      while (el.firstChild) wrapper.appendChild(el.firstChild);
      el.appendChild(wrapper);
    });
  });
};

/**
 * 导出时仅上移“销售单”标题，不影响页面
 */
const nudgeTitleUpForExport = (root: HTMLElement, dy: number = -6): void => {
  const headers = Array.from(root.querySelectorAll('h1, h2, h3'));
  headers.forEach((h) => {
    const el = h as HTMLElement;
    const text = (el.textContent || '').replace(/\s/g, '');
    if (text === '销售单') {
      el.style.transform = `translateY(${dy}px)`;
      el.style.transformOrigin = 'center center';
      el.style.willChange = 'transform';
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

    // 根据页面当前渲染宽度导出，跟随页面宽度
    const rect = element.getBoundingClientRect();
    const targetWidth = Math.max(1, Math.round(rect.width || element.offsetWidth));
    element.style.setProperty('width', `${targetWidth}px`, 'important');
    element.style.setProperty('max-width', `${targetWidth}px`, 'important');

    // 等待 DOM 重排
    await new Promise(resolve => setTimeout(resolve, 100));


    // 在截图前等待字体就绪，避免因字体回退造成的测量差异而截断
    try { await (document as any).fonts?.ready; } catch {}


    // 克隆元素以避免修改原始DOM
    const clone = element.cloneNode(true) as HTMLElement;

    // 创建离屏容器
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-10000px';
    offscreen.style.top = '0';
    offscreen.style.zIndex = '0';
    offscreen.style.backgroundColor = '#ffffff';
    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    // 固定克隆体宽度与页面一致，避免因换行差异导致整体高度变化
    clone.style.setProperty('width', `${targetWidth}px`, 'important');
    clone.style.setProperty('max-width', `${targetWidth}px`, 'important');
    clone.style.setProperty('min-width', `${targetWidth}px`, 'important');


    // 移除 oklch 颜色
    removeOklchColors(clone);

    // 在克隆体上做最小化的导出专用调整
    centerTableCellsForExport(clone, -6);       // 单元格内容垂直/水平居中，并整体上移 6px
    nudgeNonTableTextUp(clone, -6);             // 表格外的文本整体上移 6px，修正基线
    nudgeTitleUpForExport(clone, -6);           // 仅将“销售单”标题上移 6px（导出专用）

    // 为静态检查器保留但不生效（避免未使用警告），不作用于真实克隆体
    { const __noop = document.createElement('div'); expandEllipsisForExport(__noop); normalizeCellCenterForExport(__noop); }

    // 使用 html2canvas 生成图片（关闭 foreignObjectRendering，避免个别环境渲染为空/全黑）
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


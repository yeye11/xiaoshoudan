/**
 * 导出功能的共享辅助函数
 * 用于图片、PDF 和打印导出
 */

/**
 * 移除元素中的 oklch 颜色（html2canvas 不支持）
 * @param element - 要处理的HTML元素
 */
export const removeOklchColors = (element: HTMLElement): void => {
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
 * 将表格单元格内容包一层 flex 容器并垂直/水平居中；同时按 dy 做细微上移补偿（仅作用于克隆体）
 */
export const centerTableCellsForExport = (root: HTMLElement, dy: number = -1): void => {
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
 * 将"非表格内"的文字整体上移若干像素，修正 html2canvas 的基线偏差（仅作用于克隆体）
 */
export const nudgeNonTableTextUp = (root: HTMLElement, dy: number = -1): void => {
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
 * 导出时仅上移"销售单"标题，不影响页面
 */
export const nudgeTitleUpForExport = (root: HTMLElement, dy: number = -6): void => {
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


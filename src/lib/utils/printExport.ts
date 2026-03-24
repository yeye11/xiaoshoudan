import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';
import { IMAGE_EXPORT_CONFIG } from './imageExport';
import { isMobileDevice } from './deviceDetect';
import { savePDFWithAndroid } from './androidHelpers';
import {
  removeOklchColors,
  prepareElementForExport,
  applyExportStyleAdjustments,
  calculateScale
} from './exportHelpers';

/**
 * 打印HTML元素
 * - 在移动端：自动保存为 PDF
 * - 在桌面端：调用 window.print() 打印
 * @param element - 要打印的HTML元素
 * @returns Promise<void>
 */
export const printElement = async (element: HTMLElement): Promise<void> => {
  console.log('📄 printElement 开始执行');
  const isMobile = isMobileDevice();
  console.log('📱 是否为移动设备:', isMobile);

  try {
    const cssWidth = IMAGE_EXPORT_CONFIG.fixedCssWidth ?? Math.max(1, Math.round(element.getBoundingClientRect().width || element.offsetWidth));
    console.log('📏 CSS 宽度:', cssWidth);

    await new Promise(resolve => setTimeout(resolve, 50));
    try { await (document as any).fonts?.ready; } catch {}

    // 使用共享的准备函数
    const { clone, offscreen } = prepareElementForExport(element, cssWidth);
    const computedScale = calculateScale(cssWidth, IMAGE_EXPORT_CONFIG.fixedPixelWidth, IMAGE_EXPORT_CONFIG.scale);

    // 应用导出专用调整
    applyExportStyleAdjustments(clone, 0);

    const canvas = await toCanvas(clone, {
      pixelRatio: computedScale,
      backgroundColor: IMAGE_EXPORT_CONFIG.backgroundColor,
      cacheBust: true,
      skipAutoScale: true,
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRElEQkSuQmCC',
    });

    // 清理离屏容器
    document.body.removeChild(offscreen);

    // 将 canvas 转换为图片 URL
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 移动端：保存为 PDF
    if (isMobile) {
      // 创建 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 计算图片在 PDF 中的尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgPdfWidth = imgWidth * ratio;
      const imgPdfHeight = imgHeight * ratio;

      // 居中显示
      const x = (pdfWidth - imgPdfWidth) / 2;
      const y = (pdfHeight - imgPdfHeight) / 2;

      // 添加图片到 PDF
      pdf.addImage(imgData, 'JPEG', x, y, imgPdfWidth, imgPdfHeight);

      // 保存 PDF
      const fileName = `销售单-${new Date().toISOString().split('T')[0]}.pdf`;

      // 检查是否有 Android 原生接口
      // @ts-ignore
      const hasAndroidPDFSaver = window.AndroidImageSaver && typeof window.AndroidImageSaver.savePDF === 'function';

      if (hasAndroidPDFSaver) {
        await savePDFWithAndroid(pdf, fileName);
      } else {
        // 备用方案：浏览器下载
        pdf.save(fileName);
      }

      return;
    }

    // 桌面端：使用 window.print() 打印

    // 创建打印容器
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container-temp';
    printContainer.style.position = 'fixed';
    printContainer.style.left = '0';
    printContainer.style.top = '0';
    printContainer.style.width = '100vw';
    printContainer.style.height = '100vh';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.zIndex = '99999';
    printContainer.style.display = 'none'; // 默认隐藏

    // 创建图片元素
    const img = document.createElement('img');
    img.src = imgData;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '0 auto';

    printContainer.appendChild(img);
    document.body.appendChild(printContainer);

    // 创建打印样式
    const printStyle = document.createElement('style');
    printStyle.id = 'print-style-temp';
    printStyle.textContent = `
      @media print {
        body > *:not(#print-container-temp) {
          display: none !important;
        }
        #print-container-temp {
          display: block !important;
          position: static !important;
          width: auto !important;
          height: auto !important;
          background: white !important;
        }
        #print-container-temp img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // 等待图片加载完成
    await new Promise((resolve) => {
      if (img.complete) {
        resolve(undefined);
      } else {
        img.onload = () => resolve(undefined);
      }
    });

    // 执行打印
    window.print();

    // 清理
    setTimeout(() => {
      const container = document.getElementById('print-container-temp');
      const style = document.getElementById('print-style-temp');
      if (container) document.body.removeChild(container);
      if (style) document.head.removeChild(style);
    }, 1000);

  } catch (error) {
    console.error('打印失败:', error);
    throw error;
  }
};


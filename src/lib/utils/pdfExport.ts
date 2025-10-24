import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, Customer } from '$lib/types/invoice';
import { IMAGE_EXPORT_CONFIG } from './imageExport';
import { savePDFWithAndroid } from './androidHelpers';
import {
  removeOklchColors,
  centerTableCellsForExport,
  nudgeNonTableTextUp,
  nudgeTitleUpForExport
} from './exportHelpers';

/**
 * PDF 导出配置
 */
export interface PDFExportOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
}

/**
 * 默认 PDF 导出配置
 */
const DEFAULT_PDF_OPTIONS: Required<PDFExportOptions> = {
  fileName: 'document',
  orientation: 'portrait',
  format: 'a4'
};

/**
 * 将 HTML 元素导出为 PDF（单页）
 * @param element 要导出的 HTML 元素
 * @param options 导出选项
 */
export async function exportElementAsPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_OPTIONS, ...options };

  try {
    // 保存原始样式
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    // 固定 CSS 宽度（仅用于导出克隆体，不修改原页面）
    const cssWidth = IMAGE_EXPORT_CONFIG.fixedCssWidth ?? Math.max(1, Math.round(element.getBoundingClientRect().width || element.offsetWidth));

    // 等待 DOM 重排（给字体/布局与测量一个最小的 settle 时间）
    await new Promise(resolve => setTimeout(resolve, 50));

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

    // 固定克隆体 CSS 宽度，避免受设备影响产生不同换行
    clone.style.setProperty('width', `${cssWidth}px`, 'important');
    clone.style.setProperty('max-width', `${cssWidth}px`, 'important');
    clone.style.setProperty('min-width', `${cssWidth}px`, 'important');

    // 计算用于"固定图片像素宽度"的缩放倍率：canvasWidth = cssWidth * scale = fixedPixelWidth
    const desiredPixelWidth = IMAGE_EXPORT_CONFIG.fixedPixelWidth ?? Math.round(cssWidth * IMAGE_EXPORT_CONFIG.scale);
    const computedScale = Math.max(1, Math.min(4, desiredPixelWidth / cssWidth)); // 限制缩放范围，避免过大/过小

    // 移除 oklch 颜色
    removeOklchColors(clone);

    // 隐藏所有按钮和不需要导出的元素
    const elementsToHide = clone.querySelectorAll('button, .no-print, .print\\:hidden');
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // 在克隆体上做最小化的导出专用调整
    centerTableCellsForExport(clone, -6);       // 单元格内容垂直/水平居中，并整体上移 6px
    nudgeNonTableTextUp(clone, -6);             // 表格外的文本整体上移 6px，修正基线
    nudgeTitleUpForExport(clone, -6);           // 仅将"销售单"标题上移 6px（导出专用）

    // 使用 html2canvas 生成图片（关闭 foreignObjectRendering，避免个别环境渲染为空/全黑）
    const canvas = await html2canvas(clone, {
      scale: computedScale,
      useCORS: IMAGE_EXPORT_CONFIG.useCORS,
      backgroundColor: IMAGE_EXPORT_CONFIG.backgroundColor,
      logging: IMAGE_EXPORT_CONFIG.logging
    });

    // 清理离屏容器
    document.body.removeChild(offscreen);

    // 恢复原始样式
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;

    // 转换为 PDF
    const imgData = canvas.toDataURL(IMAGE_EXPORT_CONFIG.format, IMAGE_EXPORT_CONFIG.quality);

    // 创建 PDF
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format
    });

    // 计算图片在 PDF 中的尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 保持宽高比
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
    const fileName = `${config.fileName}.pdf`;

    // 检查是否有 Android 原生接口
    // @ts-ignore
    const hasAndroidPDFSaver = window.AndroidImageSaver && typeof window.AndroidImageSaver.savePDF === 'function';

    if (hasAndroidPDFSaver) {
      await savePDFWithAndroid(pdf, fileName);
    } else {
      pdf.save(fileName);
    }
  } catch (error) {
    console.error('导出 PDF 失败:', error);
    throw error;
  }
}

/**
 * 将 HTML 元素导出为多页 PDF（如果内容很长）
 * @param element 要导出的 HTML 元素
 * @param options 导出选项
 */
export async function exportElementAsMultiPagePDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_OPTIONS, ...options };
  
  console.log('📄 开始生成多页 PDF...');

  try {
    // 1. 克隆元素并移除 oklch 颜色
    console.log('🔧 正在准备元素...');
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // 临时添加到 DOM 中以便获取计算样式
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    document.body.appendChild(clonedElement);

    // 移除 oklch 颜色
    removeOklchColors(clonedElement);

    // 2. 截取整个元素
    const canvas = await html2canvas(clonedElement, {
      scale: config.scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 移除临时元素
    document.body.removeChild(clonedElement);

    const imgData = canvas.toDataURL('image/jpeg', config.quality);

    // 2. 创建 PDF
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 3. 计算需要多少页
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // 图片宽度适配 PDF 宽度
    const ratio = pdfWidth / imgWidth;
    const imgPdfWidth = pdfWidth;
    const imgPdfHeight = imgHeight * ratio;
    
    // 计算需要的页数
    const totalPages = Math.ceil(imgPdfHeight / pdfHeight);
    
    console.log('📄 总页数:', totalPages);

    // 4. 分页添加图片
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const yOffset = -(i * pdfHeight);
      pdf.addImage(imgData, 'JPEG', 0, yOffset, imgPdfWidth, imgPdfHeight);
      
      console.log(`📄 已添加第 ${i + 1}/${totalPages} 页`);
    }

    // 5. 保存 PDF
    const fileName = `${config.fileName}.pdf`;

    // 检查是否有 Android 原生接口
    // @ts-ignore
    const hasAndroidPDFSaver = window.AndroidImageSaver && typeof window.AndroidImageSaver.savePDF === 'function';

    if (hasAndroidPDFSaver) {
      console.log('📱 检测到 Android 原生接口，使用原生方法保存');
      await savePDFWithAndroid(pdf, fileName);
    } else {
      console.log('🌐 使用浏览器下载 API 保存文件');
      pdf.save(fileName);
    }

    console.log('✅ 多页 PDF 生成成功！');
  } catch (error) {
    console.error('❌ 多页 PDF 生成失败:', error);
    throw error;
  }
}

/**
 * 检查浏览器是否支持 PDF 导出
 */
export function isPDFExportSupported(): boolean {
  return typeof window !== 'undefined' &&
         typeof document !== 'undefined' &&
         typeof HTMLCanvasElement !== 'undefined';
}

/**
 * 导出销售单为 PDF（使用 HTML 模板生成，支持中文）
 * @param invoice 销售单数据
 * @param customer 客户信息（可选）
 * @param options 导出选项
 */
export async function exportInvoiceAsPDF(
  invoice: Invoice,
  customer: Customer | null = null,
  options: PDFExportOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_OPTIONS, ...options };

  console.log('📄 开始生成销售单 PDF...');
  console.log('📄 配置:', config);

  try {
    // 创建临时 HTML 元素
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 宽度
    tempDiv.style.padding = '15mm';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.color = '#000000';

    const customerName = customer?.name || invoice.customerInfo.name || '未知客户';

    // 生成 HTML 内容
    tempDiv.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #000;">
        <!-- 标题 -->
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">销售单详情</h1>

        <!-- 公司信息 -->
        <div style="margin-bottom: 15px; font-size: 11px;">
          <div><strong>公司:</strong> ${invoice.companyInfo.name}</div>
          ${invoice.companyInfo.address ? `<div><strong>地址:</strong> ${invoice.companyInfo.address}</div>` : ''}
          ${invoice.companyInfo.phone ? `<div><strong>电话:</strong> ${invoice.companyInfo.phone}</div>` : ''}
        </div>

        <!-- 销售单信息 -->
        <div style="margin-bottom: 15px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px;">
          <h3 style="font-size: 14px; margin-bottom: 8px; color: #000;">销售单信息</h3>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div><strong>单号:</strong> ${invoice.invoiceNumber}</div>
              <div><strong>制单人:</strong> ${invoice.createdBy}</div>
            </div>
            <div>
              <div><strong>日期:</strong> ${invoice.date}</div>
              <div><strong>状态:</strong> ${getStatusText(invoice.status)}</div>
            </div>
          </div>
        </div>

        <!-- 客户信息 -->
        <div style="margin-bottom: 15px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px;">
          <h3 style="font-size: 14px; margin-bottom: 8px; color: #000;">客户信息</h3>
          <div><strong>客户:</strong> ${customerName}</div>
          ${invoice.customerInfo.phone ? `<div><strong>电话:</strong> ${invoice.customerInfo.phone}</div>` : ''}
          ${invoice.customerInfo.address ? `<div><strong>地址:</strong> ${invoice.customerInfo.address}</div>` : ''}
        </div>

        <!-- 商品明细表格 -->
        <div style="margin-bottom: 15px; border-top: 1px solid #ccc; padding-top: 10px;">
          <h3 style="font-size: 14px; margin-bottom: 8px; color: #000;">商品明细</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #428bca; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">序号</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">产品名称</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">规格</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">单位</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">数量</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">单价</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">金额</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">备注</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${item.productName}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${item.specification || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${item.unit}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">¥${item.unitPrice.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">¥${item.amount.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${item.note || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 总计 -->
        <div style="margin-bottom: 15px; font-size: 14px; text-align: right; font-weight: bold;">
          <div>总计: ¥${invoice.totalAmount.toFixed(2)}</div>
        </div>

        <!-- 付款信息 -->
        ${invoice.paymentStatus !== 'unpaid' || invoice.paidAmount > 0 ? `
          <div style="margin-bottom: 15px; font-size: 11px; text-align: right;">
            <div>已付金额: ¥${invoice.paidAmount.toFixed(2)}</div>
            <div>未付金额: ¥${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</div>
          </div>
        ` : ''}

        <!-- 备注 -->
        ${invoice.notes ? `
          <div style="margin-top: 15px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px;">
            <div><strong>备注:</strong></div>
            <div style="margin-top: 5px;">${invoice.notes}</div>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(tempDiv);

    // 使用 html2canvas 转换为图片
    console.log('📸 正在截取页面...');
    const canvas = await html2canvas(tempDiv, {
      scale: 3, // 提高分辨率
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 移除临时元素
    document.body.removeChild(tempDiv);

    console.log('✅ 截取完成');

    // 获取图片数据
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 创建 PDF
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format,
      compress: true
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
    const fileName = config.fileName || `销售单-${customerName}-${invoice.invoiceNumber}`;
    const fullFileName = `${fileName}.pdf`;
    console.log('💾 正在保存 PDF:', fullFileName);

    // 尝试 Android 原生接口，否则使用浏览器下载
    try {
      await savePDFWithAndroid(pdf, fullFileName);
    } catch (e) {
      console.log('🌐 回退到浏览器下载 API');
      pdf.save(fullFileName);
    }

    console.log('✅ 销售单 PDF 生成成功！');
  } catch (error) {
    console.error('❌ 销售单 PDF 生成失败:', error);
    console.error('❌ 错误详情:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * 获取状态文本
 */
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'sent': '已发送',
    'paid': '已付款',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
}


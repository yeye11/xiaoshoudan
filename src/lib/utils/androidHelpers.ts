/**
 * Android 原生接口辅助工具
 * 提供统一的 Base64 转换、接口检测等功能
 */

/**
 * 将 Blob 转换为 Base64 字符串
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 检查是否有 AndroidImageSaver 接口
 */
export function hasAndroidImageSaver(): boolean {
  const w: any = window as any;
  return w.AndroidImageSaver && typeof w.AndroidImageSaver.saveImage === 'function';
}

/**
 * 检查是否有 AndroidFileSaver 接口
 */
export function hasAndroidFileSaver(): boolean {
  const w: any = window as any;
  return w.AndroidFileSaver && typeof w.AndroidFileSaver.saveFile === 'function';
}

/**
 * 使用 Android 原生接口保存图片
 */
export async function saveImageWithAndroid(blob: Blob, fileName: string): Promise<boolean> {
  try {
    if (!hasAndroidImageSaver()) return false;
    
    const base64 = await blobToBase64(blob);
    const w: any = window as any;
    const success = w.AndroidImageSaver.saveImage(base64, fileName);
    
    if (success) {
      console.log('✅ 图片已保存到相册！');
      alert(`✅ 图片已保存到相册！\n\n文件名：${fileName}`);
    }
    return success;
  } catch (error) {
    console.warn('⚠️  Android 原生保存失败:', error);
    return false;
  }
}

/**
 * 使用 Android 原生接口保存文件
 */
export async function saveFileWithAndroid(blob: Blob, fileName: string, mimeType: string): Promise<boolean> {
  try {
    if (!hasAndroidFileSaver()) return false;
    
    const base64 = await blobToBase64(blob);
    const w: any = window as any;
    const success = w.AndroidFileSaver.saveFile(base64, fileName, mimeType);
    
    if (success) {
      console.log('✅ 文件已保存！');
      alert(`✅ 文件已保存到下载文件夹！\n\n文件名：${fileName}`);
    }
    return success;
  } catch (error) {
    console.warn('⚠️  Android 原生保存失败:', error);
    return false;
  }
}

/**
 * 使用 Android 原生接口保存 PDF
 */
export async function savePDFWithAndroid(pdf: any, fileName: string): Promise<boolean> {
  try {
    if (!hasAndroidImageSaver()) return false;
    
    const pdfBase64 = pdf.output('dataurlstring').split(',')[1];
    const w: any = window as any;
    const success = w.AndroidImageSaver.savePDF(pdfBase64, fileName);
    
    if (success) {
      console.log('✅ PDF 已保存！');
    }
    return success;
  } catch (error) {
    console.warn('⚠️  Android 原生保存 PDF 失败:', error);
    return false;
  }
}

/**
 * 浏览器下载 Blob
 */
export function downloadBlobAsBrowser(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/**
 * 浏览器下载 DataURL
 */
export function downloadDataURLAsBrowser(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

/**
 * 获取 html2canvas 的标准配置
 * @param scale - 缩放倍率
 * @param useCORS - 是否使用 CORS
 * @param backgroundColor - 背景颜色
 * @param logging - 是否启用日志
 */
export function getHtml2CanvasConfig(
  scale: number = 3,
  useCORS: boolean = true,
  backgroundColor: string = '#ffffff',
  logging: boolean = false
): any {
  return {
    scale,
    useCORS,
    backgroundColor,
    logging
  };
}


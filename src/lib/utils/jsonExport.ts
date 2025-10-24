/**
 * JSON 数据导出工具
 * 支持两层方案：
 * 1. Android 原生接口（保存到下载文件夹）
 * 2. 浏览器下载 API（桌面环境）
 */

/**
 * 将 JSON 数据导出为文件
 * @param data - 要导出的数据对象
 * @param fileName - 文件名（不含扩展名）
 * @returns Promise<void>
 */
export async function exportJsonData(data: any, fileName: string): Promise<void> {
  try {
    console.log('📊 开始导出 JSON 数据:', fileName);

    // 转换为 JSON 字符串
    const jsonStr = JSON.stringify(data, null, 2);
    const fullFileName = `${fileName}.json`;

    // 创建 Blob
    const blob = new Blob([jsonStr], { type: 'application/json' });
    console.log('📦 JSON 数据大小:', blob.size, 'bytes');

    // 尝试方案 1: Android 原生接口（优先，最可靠）
    if (await tryAndroidNativeSave(blob, fullFileName)) {
      console.log('✅ 使用 Android 原生接口保存成功');
      return;
    }

    // 方案 2: 浏览器下载 API（桌面环境）
    tryBrowserDownload(blob, fullFileName);
    console.log('✅ 使用浏览器下载 API 保存成功');
  } catch (error) {
    console.error('❌ JSON 数据导出失败:', error);
    throw error;
  }
}

/**
 * 尝试使用 Android 原生接口保存
 */
async function tryAndroidNativeSave(blob: Blob, fileName: string): Promise<boolean> {
  try {
    const w: any = window as any;

    // 检查 AndroidFileSaver 接口
    if (!w.AndroidFileSaver) {
      console.log('ℹ️  AndroidFileSaver 接口不可用');
      return false;
    }

    if (typeof w.AndroidFileSaver.saveFile !== 'function') {
      console.log('ℹ️  AndroidFileSaver.saveFile 方法不可用');
      return false;
    }

    console.log('🔧 尝试使用 Android 原生接口保存...');
    console.log('📱 检测到 AndroidFileSaver 接口');

    // 将 Blob 转换为 Base64
    const base64 = await blobToBase64(blob);
    console.log('📦 Base64 数据长度:', base64.length);

    // 调用 Android 原生方法
    console.log('🚀 调用 AndroidFileSaver.saveFile()');
    const success = w.AndroidFileSaver.saveFile(base64, fileName, 'application/json');

    if (success) {
      console.log('✅ Android 原生保存成功！');
      alert(`✅ 数据已保存到下载文件夹！\n\n文件名：${fileName}`);
      return true;
    } else {
      console.warn('⚠️  Android 原生保存返回 false');
      return false;
    }
  } catch (error) {
    console.warn('⚠️  Android 原生保存失败:', error);
    return false;
  }
}



/**
 * 使用浏览器下载 API 保存（桌面环境）
 */
function tryBrowserDownload(blob: Blob, fileName: string): void {
  try {
    console.log('🌐 使用浏览器下载 API 保存...');

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 延迟释放 URL
    setTimeout(() => URL.revokeObjectURL(url), 500);

    alert(`✅ 数据已保存！\n\n文件名：${fileName}\n\n请在浏览器下载文件夹中查看`);
  } catch (error) {
    console.error('❌ 浏览器下载失败:', error);
    alert('❌ 导出失败，请重试');
    throw error;
  }
}

/**
 * 将 Blob 转换为 Base64 字符串
 * 注意：这个函数与 imageExport.ts 中的逻辑相同，
 * 但由于 imageExport.ts 是内部函数，这里保留独立实现
 */
function blobToBase64(blob: Blob): Promise<string> {
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


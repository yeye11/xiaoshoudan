import { saveFileWithAndroid, downloadBlobAsBrowser } from './androidHelpers';

/**
 * 将 JSON 数据导出为文件
 * 支持两层方案：
 * 1. Android 原生接口（保存到下载文件夹）
 * 2. 浏览器下载 API（桌面环境）
 */
export async function exportJsonData(data: any, fileName: string): Promise<void> {
  try {
    console.log('📊 开始导出 JSON 数据:', fileName);

    const jsonStr = JSON.stringify(data, null, 2);
    const fullFileName = `${fileName}.json`;
    const blob = new Blob([jsonStr], { type: 'application/json' });
    console.log('📦 JSON 数据大小:', blob.size, 'bytes');

    // 尝试 Android 原生接口
    if (await saveFileWithAndroid(blob, fullFileName, 'application/json')) {
      return;
    }

    // 回退到浏览器下载
    downloadBlobAsBrowser(blob, fullFileName);
    console.log('✅ 使用浏览器下载 API 保存成功');
  } catch (error) {
    console.error('❌ JSON 数据导出失败:', error);
    throw error;
  }
}
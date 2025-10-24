/**
 * JSON 数据导出工具
 * 支持多层备用方案：
 * 1. Android 原生接口（保存到下载文件夹）
 * 2. Tauri API（保存到下载文件夹）
 * 3. IndexedDB 存储（最后的兜底方案）
 * 4. 浏览器下载 API（桌面环境）
 */

/**
 * 检测是否在 Tauri 环境中
 */
function isTauriEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  } catch {
    return false;
  }
}

/**
 * 将 JSON 数据导出为文件
 * @param data - 要导出的数据对象
 * @param fileName - 文件名（不含扩展名）
 * @returns Promise<void>
 */
export async function exportJsonData(data: any, fileName: string): Promise<void> {
  try {
    console.log('📊 开始导出 JSON 数据:', fileName);
    console.log('🔍 环境检测 - Tauri:', isTauriEnvironment());

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

    // 尝试方案 2: Tauri API（仅在 Tauri 环境中）
    if (isTauriEnvironment() && await tryTauriSave(blob, fullFileName)) {
      console.log('✅ 使用 Tauri API 保存成功');
      return;
    }

    // 尝试方案 3: IndexedDB 存储（兜底方案）
    if (await tryIndexedDBSave(jsonStr, fullFileName)) {
      console.log('✅ 使用 IndexedDB 保存成功');
      return;
    }

    // 方案 4: 浏览器下载 API（桌面环境）
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
 * 尝试使用 Tauri API 保存
 */
async function tryTauriSave(blob: Blob, fileName: string): Promise<boolean> {
  try {
    console.log('🔧 尝试使用 Tauri API 保存...');

    // 检查是否在 Tauri 环境中
    if (!isTauriEnvironment()) {
      console.log('ℹ️  不在 Tauri 环境中，跳过 Tauri API');
      return false;
    }

    // 动态导入 Tauri 模块
    let writeFile, BaseDirectory;
    try {
      const tauriFs = await import('@tauri-apps/plugin-fs');
      writeFile = tauriFs.writeFile;
      BaseDirectory = tauriFs.BaseDirectory;
    } catch (importError) {
      console.warn('⚠️  无法导入 Tauri 文件系统模块:', importError);
      return false;
    }

    // 将 Blob 转换为字节数组
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    console.log('📁 保存文件到下载文件夹...');

    // 使用 Download 目录
    await writeFile(fileName, bytes, { baseDir: BaseDirectory.Download });

    console.log('✅ Tauri API 保存成功！');
    alert(`✅ 数据已保存到下载文件夹！\n\n文件名：${fileName}\n\n请在文件管理器的"下载"文件夹中查看`);
    return true;
  } catch (error) {
    console.warn('⚠️  Tauri API 保存失败:', error);
    return false;
  }
}

/**
 * 尝试使用 IndexedDB 保存（作为最后的兜底方案）
 */
async function tryIndexedDBSave(jsonStr: string, fileName: string): Promise<boolean> {
  try {
    console.log('🔧 尝试使用 IndexedDB 保存...');

    // 检查 IndexedDB 支持
    if (!window.indexedDB) {
      console.log('ℹ️  IndexedDB 不可用');
      return false;
    }

    return new Promise((resolve) => {
      const request = window.indexedDB.open('CypridinaBakup', 1);

      request.onerror = () => {
        console.warn('⚠️  IndexedDB 打开失败');
        resolve(false);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('exports')) {
          db.createObjectStore('exports', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event: any) => {
        try {
          const db = event.target.result;
          const transaction = db.transaction(['exports'], 'readwrite');
          const store = transaction.objectStore('exports');

          const exportData = {
            fileName,
            content: jsonStr,
            timestamp: new Date().toISOString(),
            size: jsonStr.length
          };

          const addRequest = store.add(exportData);

          addRequest.onsuccess = () => {
            console.log('✅ IndexedDB 保存成功！');
            alert(
              `✅ 数据已保存到本地存储！\n\n` +
              `文件名：${fileName}\n` +
              `大小：${(jsonStr.length / 1024).toFixed(2)} KB\n\n` +
              `提示：您可以在应用设置中导出此数据`
            );
            resolve(true);
          };

          addRequest.onerror = () => {
            console.warn('⚠️  IndexedDB 保存失败');
            resolve(false);
          };
        } catch (error) {
          console.warn('⚠️  IndexedDB 操作失败:', error);
          resolve(false);
        }
      };
    });
  } catch (error) {
    console.warn('⚠️  IndexedDB 保存失败:', error);
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


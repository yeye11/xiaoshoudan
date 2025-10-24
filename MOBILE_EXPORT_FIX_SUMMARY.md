# 手机端导出数据修复 - 完整总结

## 问题描述
手机端（Android WebView）无法导出 JSON 数据，而浏览器和电脑端可以正常导出。

## 根本原因分析
Profile 页面的导出函数使用浏览器原生的 `<a>` 标签下载方式：
```javascript
const link = document.createElement('a');
link.href = url;
link.download = fileName;
link.click();
```

**这种方式在 Android WebView 中不工作**，因为：
1. WebView 的下载机制与浏览器不同
2. 需要通过 Android 原生接口或 Tauri API 来保存文件
3. 浏览器下载 API 在 WebView 中被限制

## 解决方案

### 1. 创建 JSON 导出工具 (`src/lib/utils/jsonExport.ts`)
实现了**三层备用方案**：

#### 方案 1: Android 原生接口（优先）✅
- 通过 `AndroidFileSaver.saveFile()` 直接调用 Android 原生方法
- 使用 MediaStore API 保存到下载文件夹
- **最可靠，无需权限声明**

#### 方案 2: Tauri API（备用）
- 使用 `@tauri-apps/plugin-fs` 的 `writeFile()` 方法
- 保存到 `BaseDirectory.Download`
- 仅在 Tauri 环境中使用

#### 方案 3: IndexedDB 存储（兜底）
- 保存到本地数据库
- 用户可在设置中导出
- 防止数据丢失

#### 方案 4: 浏览器下载 API（桌面环境）
- 传统的浏览器下载方式
- 仅在桌面环境中使用

### 2. 更新 Profile 页面 (`src/routes/mobile/profile/+page.svelte`)
```typescript
const exportData = async () => {
  const allData = { /* ... */ };
  const { exportJsonData } = await import('$lib/utils/jsonExport');
  const fileName = `cypridina-data-${new Date().toISOString().split('T')[0]}`;
  await exportJsonData(allData, fileName);
};
```

### 3. 添加 Android 原生接口 (`src-tauri/gen/android/app/src/main/java/com/renteng/sales/MainActivity.kt`)
```kotlin
class FileSaver(private val context: Context) {
  @JavascriptInterface
  fun saveFile(base64Data: String, filename: String, mimeType: String): Boolean {
    // 解码 Base64
    val fileBytes = Base64.decode(base64Data, Base64.DEFAULT)
    
    // 使用 MediaStore 保存到下载文件夹
    val contentValues = ContentValues().apply {
      put(MediaStore.Downloads.DISPLAY_NAME, filename)
      put(MediaStore.Downloads.MIME_TYPE, mimeType)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
      }
    }
    
    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
    resolver.openOutputStream(uri)?.use { outputStream ->
      outputStream.write(fileBytes)
    }
    
    return true
  }
}
```

### 4. 更新 Tauri 权限配置 (`src-tauri/capabilities/default.json`)
添加下载文件夹的读写权限：
```json
{
  "identifier": "fs:allow-write-file",
  "allow": [
    { "path": "$DOWNLOAD" },
    { "path": "$DOWNLOAD/*" },
    { "path": "$DOWNLOAD/**/*" }
  ]
}
```

## 测试结果 ✅

### 真机测试成功
- **设备**: Android 真机
- **文件**: `cypridina-data-2025-10-24.json`
- **大小**: 2023 bytes
- **位置**: `/sdcard/Download/`
- **状态**: ✅ 成功保存

### 日志输出
```
📄 开始保存文件: cypridina-data-2025-10-24.json
📦 Base64 数据长度: 2700
📋 MIME 类型: application/json
✅ 文件数据解码成功: 2023 bytes
✅ MediaStore URI 创建成功: content://media/external/downloads/1000149595
✅ 文件数据写入成功
🎉 文件保存成功！
```

## 修改文件清单

| 文件 | 修改内容 |
|------|--------|
| `src/lib/utils/jsonExport.ts` | 新增 - JSON 导出工具 |
| `src/routes/mobile/profile/+page.svelte` | 修改 - 使用新的导出工具 |
| `src-tauri/capabilities/default.json` | 修改 - 添加下载文件夹权限 |
| `src-tauri/gen/android/app/src/main/java/com/renteng/sales/MainActivity.kt` | 修改 - 添加 FileSaver 类 |

## 优势

✅ **多层备用方案** - 确保在各种环境下都能导出
✅ **无需额外权限** - 使用 MediaStore API，Android 10+ 无需权限
✅ **用户友好** - 自动保存到下载文件夹，用户可直接访问
✅ **错误处理** - 详细的日志和错误提示
✅ **一致性** - 与销售单导出功能保持一致

## 后续改进建议

1. 添加导出进度提示
2. 支持导出为 CSV 格式
3. 添加导出历史记录
4. 支持云端备份
5. 添加数据加密选项

## 相关文档

- [Tauri 文件系统 API](https://tauri.app/develop/plugins/fs/)
- [Android MediaStore API](https://developer.android.com/reference/android/provider/MediaStore)
- [WebView JavaScript 接口](https://developer.android.com/guide/webapps/webview/javascript)


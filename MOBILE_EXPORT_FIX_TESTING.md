# 手机端导出数据修复 - 测试指南

## 修复概述

### 问题
手机端（Android WebView）无法导出 JSON 数据，而浏览器和电脑端可以正常导出。

### 根本原因
profile 页面的导出函数使用浏览器原生的 `<a>` 标签下载方式（`link.click()`），在 WebView 中不工作。

### 解决方案
实现了三层备用方案：
1. **Android 原生接口**（优先）- 通过 `AndroidFileSaver.saveFile()` 保存到下载文件夹
2. **Tauri API**（备用）- 使用 `@tauri-apps/plugin-fs` 的 `writeFile()` 保存到下载文件夹
3. **IndexedDB 存储**（兜底）- 保存到本地数据库，用户可在设置中导出
4. **浏览器下载 API**（桌面环境）- 传统的浏览器下载方式

## 修改文件清单

### 1. 新增文件
- `src/lib/utils/jsonExport.ts` - JSON 导出工具函数，支持多层备用方案

### 2. 修改文件
- `src/routes/mobile/profile/+page.svelte` - 更新导出函数使用新的工具
- `src-tauri/capabilities/default.json` - 添加下载文件夹的 Tauri 权限
- `src-tauri/gen/android/app/src/main/java/com/renteng/sales/MainActivity.kt` - 添加 FileSaver 类

## 测试步骤

### 前置条件
- 已安装 Android 模拟器
- 已安装 Node.js 和 npm
- 已安装 Rust 和 Cargo
- 已安装 Android SDK 和 NDK

### 测试流程

#### 1. 构建开发版本
```bash
npm run android:dev
```

#### 2. 在模拟器中测试导出功能

**测试场景 1: 导出 JSON 数据**
1. 打开应用
2. 进入"我的"页面（profile）
3. 点击"导出数据"按钮
4. 验证：
   - ✅ 应该看到成功提示
   - ✅ 文件应该保存到下载文件夹
   - ✅ 文件名格式：`cypridina-data-YYYY-MM-DD.json`

**测试场景 2: 导出销售单为图片**
1. 进入销售单页面
2. 点击"保存为图片"按钮
3. 验证：
   - ✅ 应该看到成功提示
   - ✅ 图片应该保存到相册
   - ✅ 文件名格式：`销售单-YYYY-MM-DD.jpg`

**测试场景 3: 导出销售单为 PDF**
1. 进入销售单页面
2. 点击"保存为 PDF"按钮
3. 验证：
   - ✅ 应该看到成功提示
   - ✅ PDF 应该保存到下载文件夹
   - ✅ 文件名格式：`销售单-YYYY-MM-DD.pdf`

#### 3. 检查日志
在 Android Studio 的 Logcat 中查看日志：
```
adb logcat | grep "MainActivity\|导出\|保存"
```

预期日志输出：
```
📊 开始导出 JSON 数据: cypridina-data-2024-10-24
📦 JSON 数据大小: XXXX bytes
🔧 尝试使用 Android 原生接口保存...
✅ Android 原生保存成功！
```

#### 4. 验证文件
在模拟器中检查文件：
```bash
# 查看下载文件夹
adb shell ls -la /sdcard/Download/

# 查看相册
adb shell ls -la /sdcard/Pictures/
```

## 预期结果

### 成功标志
- ✅ JSON 数据导出成功，文件保存到下载文件夹
- ✅ 销售单图片导出成功，文件保存到相册
- ✅ 销售单 PDF 导出成功，文件保存到下载文件夹
- ✅ 所有导出操作都显示成功提示
- ✅ 日志中没有错误信息

### 失败排查

如果导出失败，检查以下几点：

1. **权限问题**
   - 检查 `src-tauri/capabilities/default.json` 中是否有下载文件夹权限
   - 检查 `AndroidManifest.xml` 中是否有必要的权限声明

2. **Android 原生接口问题**
   - 检查 `MainActivity.kt` 中 `FileSaver` 类是否正确实现
   - 检查 JavaScript 接口是否正确注册

3. **Tauri API 问题**
   - 检查 `@tauri-apps/plugin-fs` 是否正确导入
   - 检查 `BaseDirectory.Download` 是否可用

4. **IndexedDB 问题**
   - 检查浏览器开发者工具中的 IndexedDB 是否有数据
   - 检查数据库名称是否正确（`CypridinaBakup`）

## 性能指标

- JSON 导出时间：< 1 秒
- 图片导出时间：< 3 秒
- PDF 导出时间：< 5 秒

## 回滚计划

如果需要回滚修改：
```bash
git revert <commit-hash>
```

## 相关文档

- [Tauri 文件系统 API](https://tauri.app/develop/plugins/fs/)
- [Android MediaStore API](https://developer.android.com/reference/android/provider/MediaStore)
- [WebView JavaScript 接口](https://developer.android.com/guide/webapps/webview/javascript)


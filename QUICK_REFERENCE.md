# 手机端导出数据修复 - 快速参考

## 问题
❌ 手机端无法导出 JSON 数据

## 解决方案
✅ 实现三层备用方案：
1. **Android 原生接口** (优先)
2. **Tauri API** (备用)
3. **IndexedDB** (兜底)
4. **浏览器下载** (桌面)

## 核心改动

### 1. 新增导出工具
```
src/lib/utils/jsonExport.ts
```
- 导出函数：`exportJsonData(data, fileName)`
- 自动选择最佳方案
- 详细的日志输出

### 2. 更新 Profile 页面
```
src/routes/mobile/profile/+page.svelte
```
- 导出函数改为异步
- 使用新的导出工具

### 3. Android 原生实现
```
src-tauri/gen/android/app/src/main/java/com/renteng/sales/MainActivity.kt
```
- 添加 `FileSaver` 类
- 实现 `saveFile()` 方法
- 使用 MediaStore API

### 4. Tauri 权限配置
```
src-tauri/capabilities/default.json
```
- 添加 `$DOWNLOAD` 目录权限

## 测试步骤

### 构建
```bash
npm run build
export ANDROID_HOME=~/Library/Android/sdk
export NDK_HOME=~/Library/Android/sdk/ndk/29.0.14206865
npx tauri android build
```

### 安装
```bash
adb uninstall com.renteng.sales
adb install src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

### 测试
1. 打开应用
2. 进入"我的"页面
3. 点击"导出数据"
4. 检查下载文件夹

### 验证
```bash
adb shell ls -la /sdcard/Download/ | grep cypridina
adb shell cat /sdcard/Download/cypridina-data-*.json
```

## 日志查看
```bash
adb logcat | grep -i "FileSaver\|导出\|保存"
```

## 预期结果
✅ 文件保存到 `/sdcard/Download/`
✅ 文件名格式：`cypridina-data-YYYY-MM-DD.json`
✅ 文件内容完整正确
✅ 用户收到成功提示

## 常见问题

### Q: 文件没有保存
A: 检查日志，确认 `AndroidFileSaver` 接口是否可用

### Q: 权限错误
A: 确保 `src-tauri/capabilities/default.json` 中有下载文件夹权限

### Q: 签名不匹配
A: 卸载旧版本后重新安装
```bash
adb uninstall com.renteng.sales
```

## 文件清单
- ✅ `src/lib/utils/jsonExport.ts` (新增)
- ✅ `src/routes/mobile/profile/+page.svelte` (修改)
- ✅ `src-tauri/capabilities/default.json` (修改)
- ✅ `src-tauri/gen/android/app/src/main/java/com/renteng/sales/MainActivity.kt` (修改)

## 相关链接
- [完整总结](./MOBILE_EXPORT_FIX_SUMMARY.md)
- [测试指南](./MOBILE_EXPORT_FIX_TESTING.md)


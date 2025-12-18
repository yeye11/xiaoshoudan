# 📱 靓仔的app - APP打包指南

## 🎯 概述

您的SvelteKit应用已经配置了Tauri，可以打包为桌面和移动端APP。Tauri是一个现代的跨平台应用开发框架，可以将Web应用打包为原生应用。

## 📋 当前配置

- **应用名称**: 靓仔的app
- **包标识符**: com.renteng.sales
- **版本**: 1.0.0
- **发布者**: 佛山市仁腾装饰材料有限公司

## 🛠️ 快速开始

### 1. 环境检查
```bash
# 检查Node.js
node --version

# 检查Rust (如果没有安装，请先安装)
rustc --version
```

### 2. 安装Rust (如果需要)
```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Windows
# 下载并运行: https://rustup.rs/
```

### 3. 一键打包
```bash
# 使用提供的脚本
./build.sh

# 或手动执行
npm install
npm run build
npm run tauri build
```

## 📦 支持的平台

### 桌面端 (已配置)
- ✅ **Windows** - .exe/.msi 安装包
- ✅ **macOS** - .dmg 安装包
- ✅ **Linux** - .deb/.AppImage 安装包

### 移动端 (需要额外配置)
- 📱 **Android** - .apk 安装包
- 📱 **iOS** - .ipa 安装包

## 🚀 打包步骤

### 桌面端打包

1. **开发模式测试**
   ```bash
   npm run tauri dev
   ```

2. **生产环境打包**
   ```bash
   npm run tauri build
   ```

3. **查找打包文件**
   - Windows: `src-tauri/target/release/bundle/msi/`
   - macOS: `src-tauri/target/release/bundle/dmg/`
   - Linux: `src-tauri/target/release/bundle/deb/`

### 移动端配置 (可选)

#### Android
```bash
# 初始化Android项目
npm run tauri android init

# 开发模式
npm run tauri android dev

# 打包APK
npm run tauri android build
```

#### iOS (仅macOS)
```bash
# 初始化iOS项目
npm run tauri ios init

# 开发模式
npm run tauri ios dev

# 打包IPA
npm run tauri ios build
```

## ⚙️ 应用特性

### 功能特点
- 📊 客户管理系统
- 📦 产品管理系统
- 📄 销售单生成
- 🚚 送货单生成
- 🖨️ 专业打印格式
- 💾 本地数据存储
- 📱 响应式设计

### 技术特性
- 🔒 原生应用性能
- 💾 离线工作能力
- 🖥️ 跨平台兼容
- 🔄 自动更新支持
- 🛡️ 安全的本地存储

## 🔧 常见问题

### 1. Rust编译错误
```bash
# 更新Rust工具链
rustup update

# 清理缓存
cargo clean
rm -rf src-tauri/target
```

### 2. 依赖问题
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 更新Tauri
npm update @tauri-apps/cli @tauri-apps/api
```

### 3. 权限问题 (macOS)
```bash
# 允许未签名应用运行
sudo spctl --master-disable

# 或者在系统偏好设置中允许
```

### 4. Windows WebView2问题
- 下载并安装 Microsoft Edge WebView2 Runtime
- 链接: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## 📱 移动端额外要求

### Android开发
- Android Studio
- Android SDK (API 24+)
- Java 8+

### iOS开发 (仅macOS)
- Xcode 12+
- iOS 13+
- Apple Developer账号 (发布到App Store)

## 🎯 发布选项

### 1. 直接分发
- 生成安装包后直接分发给用户
- 适合企业内部使用

### 2. 应用商店发布
- **Microsoft Store** (Windows)
- **Mac App Store** (macOS)
- **Google Play Store** (Android)
- **Apple App Store** (iOS)

### 3. 自动更新
- 配置Tauri的自动更新功能
- 用户可以自动获取新版本

## 📞 技术支持

### 遇到问题？
1. 查看终端错误信息
2. 检查 `src-tauri/tauri.conf.json` 配置
3. 确保所有依赖都已安装
4. 参考Tauri官方文档: https://tauri.app/

### 常用命令
```bash
# 查看Tauri版本
npm run tauri --version

# 查看可用命令
npm run tauri --help

# 清理构建缓存
npm run tauri build --debug
```

## 🎉 完成！

打包完成后，您将获得：
- 📦 可分发的安装包
- 🖥️ 原生桌面应用体验
- 📱 (可选) 移动端APP
- 🔄 自动更新能力

您的装饰材料管理系统现在可以作为独立的桌面应用运行，无需浏览器！

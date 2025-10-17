# 仁腾装饰材料管理系统 - APP打包指南

## 📱 支持的平台

- **Windows** - .exe 安装包
- **macOS** - .dmg 安装包  
- **Linux** - .deb/.AppImage 安装包
- **Android** - .apk 安装包 (需要额外配置)
- **iOS** - .ipa 安装包 (需要额外配置)

## 🛠️ 环境准备

### 1. 安装 Rust
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 验证安装
rustc --version
cargo --version
```

### 2. 安装 Tauri CLI
```bash
# 使用 npm 安装
npm install -g @tauri-apps/cli

# 或使用 cargo 安装
cargo install tauri-cli
```

### 3. 平台特定依赖

#### Windows
- 安装 Microsoft Visual Studio C++ Build Tools
- 安装 WebView2 (通常已预装在 Windows 10/11)

#### macOS
- 安装 Xcode Command Line Tools: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## 🚀 打包命令

### 桌面端打包

#### 开发模式运行
```bash
# 启动开发模式
npm run tauri dev
```

#### 生产环境打包
```bash
# 构建生产版本
npm run tauri build
```

#### 特定平台打包
```bash
# 仅打包当前平台
npm run tauri build

# 打包所有支持的平台 (需要在对应系统上运行)
npm run tauri build --target all
```

### 移动端打包 (需要额外配置)

#### Android
```bash
# 添加 Android 平台
npm run tauri android init

# 开发模式
npm run tauri android dev

# 打包 APK
npm run tauri android build
```

#### iOS
```bash
# 添加 iOS 平台
npm run tauri ios init

# 开发模式
npm run tauri ios dev

# 打包 IPA
npm run tauri ios build
```

## 📦 打包输出

打包完成后，文件将生成在以下位置：

### 桌面端
- **Windows**: `src-tauri/target/release/bundle/msi/` 或 `src-tauri/target/release/bundle/nsis/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/deb/` 或 `src-tauri/target/release/bundle/appimage/`

### 移动端
- **Android**: `src-tauri/gen/android/app/build/outputs/apk/`
- **iOS**: `src-tauri/gen/ios/build/`

## ⚙️ 配置说明

### 应用信息
- **应用名称**: 仁腾装饰材料管理系统
- **包标识符**: com.renteng.sales
- **版本**: 1.0.0
- **发布者**: 佛山市仁腾装饰材料有限公司

### 窗口设置
- **默认尺寸**: 1200x800
- **最小尺寸**: 800x600
- **可调整大小**: 是
- **居中显示**: 是

## 🔧 自定义配置

### 修改应用图标
1. 替换 `src-tauri/icons/` 目录下的图标文件
2. 确保包含所有必需的尺寸：32x32, 128x128, icon.ico, icon.icns

### 修改应用信息
编辑 `src-tauri/tauri.conf.json` 文件：
```json
{
  "productName": "您的应用名称",
  "version": "1.0.0",
  "identifier": "com.yourcompany.yourapp"
}
```

## 🚨 常见问题

### 1. Rust 编译错误
```bash
# 更新 Rust
rustup update

# 清理缓存
cargo clean
```

### 2. 依赖问题
```bash
# 重新安装依赖
npm install
cargo update
```

### 3. 权限问题 (macOS)
```bash
# 允许未签名应用运行
sudo spctl --master-disable
```

### 4. WebView2 问题 (Windows)
- 下载并安装最新的 Microsoft Edge WebView2 Runtime

## 📱 移动端额外配置

### Android 配置
1. 安装 Android Studio
2. 配置 Android SDK
3. 设置环境变量：
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### iOS 配置
1. 安装 Xcode (仅 macOS)
2. 配置开发者证书
3. 设置 iOS 模拟器

## 🎯 发布建议

### 1. 代码签名
- **Windows**: 获取代码签名证书
- **macOS**: 使用 Apple Developer 证书
- **Android**: 生成签名密钥

### 2. 应用商店发布
- **Microsoft Store** (Windows)
- **Mac App Store** (macOS)
- **Google Play Store** (Android)
- **Apple App Store** (iOS)

### 3. 自分发
- 创建下载页面
- 提供安装说明
- 设置自动更新机制

## 📞 技术支持

如果在打包过程中遇到问题，请：
1. 检查 Tauri 官方文档: https://tauri.app/
2. 查看错误日志
3. 确保所有依赖都已正确安装
4. 联系技术支持团队

---

**注意**: 首次打包可能需要较长时间，因为需要下载和编译 Rust 依赖。后续打包会更快。

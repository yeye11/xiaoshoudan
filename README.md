# Cypridina Client - 销售管理系统

一个基于 **Tauri + SvelteKit + TypeScript** 构建的跨平台销售管理系统，支持 Windows、macOS、Linux 和 Android 平台。

## 📋 项目概述

Cypridina Client 是一个功能完整的销售管理应用，提供：

- ✅ 客户管理
- ✅ 产品管理
- ✅ 销售单生成
- ✅ 送货单生成
- ✅ 中文大写金额转换
- ✅ 本地数据存储
- ✅ 移动端优化界面
- ✅ PDF 导出功能

## 🛠️ 推荐开发环境

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 📦 系统要求

### 开发环境
- **Node.js**: 18.0 或更高版本
- **Rust**: 1.70 或更高版本
- **Tauri CLI**: 2.0 或更高版本

### 可选（用于 Android 开发）
- **Android Studio**: 4.0 或更高版本
- **Android SDK**: API 24 或更高版本
- **NDK**: 最新版本

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 启动开发服务器

#### 方式一：Web 开发模式（推荐用于前端开发）

```bash
# 启动 Vite 开发服务器
npm run dev

# 访问 http://localhost:1420/
```

#### 方式二：Tauri 桌面应用开发模式

```bash
# 启动 Tauri 开发应用
npm run tauri:dev

# 这会启动一个原生窗口，支持热重载
```

### 3. 代码检查

```bash
# 运行 TypeScript 和 Svelte 检查
npm run check

# 监听模式（自动检查）
npm run check:watch
```

## 🏗️ 构建

### 桌面应用构建

#### 构建前端资源

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

#### 构建 Tauri 应用

```bash
# 构建桌面应用（Windows/macOS/Linux）
npm run tauri:build

# 生成的应用位置：
# - macOS: src-tauri/target/release/bundle/macos/
# - Windows: src-tauri/target/release/
# - Linux: src-tauri/target/release/bundle/deb/
```

### Android APK 构建

详见 [Android 构建指南](#-android-构建指南)

## 📱 Android 开发

### Android 环境配置

#### 1. 安装 Android 开发环境

```bash
# 下载并安装 Android Studio
# https://developer.android.com/studio

# 通过 Android Studio 安装：
# - Android SDK
# - Android SDK Build-Tools
# - Android SDK Platform-Tools
# - Android NDK
```

#### 2. 配置环境变量（macOS/Linux）

编辑 `~/.zshrc` 或 `~/.bash_profile`：

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export NDK_HOME=$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | tail -1)
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

应用配置：

```bash
source ~/.zshrc
```

#### 3. 验证安装

```bash
# 检查 Android SDK
echo $ANDROID_HOME

# 检查 ADB
adb --version

# 运行验证脚本
./verify-android-setup.sh
```

#### 4. 安装 Rust Android 目标

```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

### 初始化 Android 项目

```bash
# 首次需要初始化 Android 支持
npm run android:init
```

### 构建 Android APK

#### 开发版本（推荐用于调试）

```bash
# 构建并自动安装到连接的设备
npm run android:dev

# 或者只构建不安装
npm run tauri android build --debug
```

#### 发布版本

```bash
# 构建发布版本
npm run tauri android build

# 生成的 APK 位置：
# src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk
```

### 安装 APK 到设备

```bash
# 通过 USB 安装调试版本
npm run android:install

# 或手动安装
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔌 手机调试

### 准备工作

#### 1. 启用手机开发者选项

1. 打开手机设置
2. 进入"关于手机"
3. 连续点击"版本号" 7 次
4. 返回设置，进入"开发者选项"

#### 2. 启用 USB 调试

1. 在"开发者选项"中找到"USB 调试"
2. 打开开关
3. 用 USB 数据线连接手机到电脑
4. 在手机上点击"允许 USB 调试"

#### 3. 验证连接

```bash
# 查看连接的设备
adb devices

# 应该显示：
# List of devices attached
# XXXXXXXXXX    device
```

### 远程调试

#### 在 Chrome 中调试

1. 打开 Chrome 浏览器
2. 访问：`chrome://inspect#devices`
3. 确保勾选 **Discover USB devices**
4. 在手机上打开应用
5. 在 Chrome 中会看到应用的 WebView
6. 点击 **inspect** 打开开发者工具

#### 查看应用日志

```bash
# 实时查看应用日志
npm run android:logcat

# 或手动查看
adb logcat | grep -i "cypridina"

# 查看所有日志
adb logcat
```

#### 调试技巧

- 在 Chrome DevTools 中打开 **Console** 标签查看 JavaScript 日志
- 在 **Network** 标签查看网络请求
- 在 **Application** 标签查看 localStorage 和 IndexedDB
- 勾选 "Preserve log" 保留日志（切换页面时不会丢失）

## 📱 模拟器调试

### 创建 Android 虚拟设备

#### 方法一：使用 Android Studio GUI

1. 打开 Android Studio
2. 点击 **Tools** → **Device Manager**
3. 点击 **Create Device**
4. 选择设备类型（推荐 Pixel 系列）
5. 选择 Android 版本（API 24 或更高）
6. 完成创建

#### 方法二：使用命令行

```bash
# 列出可用的系统镜像
sdkmanager --list

# 创建虚拟设备
avdmanager create avd -n "Pixel_4_API_30" -k "system-images;android-30;google_apis;x86_64" -d "pixel_4"
```

### 启动模拟器

```bash
# 列出所有虚拟设备
emulator -list-avds

# 启动虚拟设备
emulator -avd Pixel_4_API_30

# 或从 Android Studio 启动
```

### 在模拟器上调试

```bash
# 等待模拟器启动完成，然后构建并安装
npm run android:dev

# 或手动安装
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk

# 查看日志
npm run android:logcat
```

#### 模拟器调试技巧

- 模拟器启动较慢，请耐心等待
- 可以在 Android Studio 中查看模拟器的性能监控
- 使用 `adb shell` 进入模拟器的 shell 环境
- 模拟器支持所有 adb 命令

## 🐛 常见问题

### 问题 1: `adb` 命令找不到

**解决方案**：

```bash
# 检查 Android SDK 是否安装
ls ~/Library/Android/sdk

# 重新配置环境变量
export PATH=$PATH:~/Library/Android/sdk/platform-tools

# 重新加载配置
source ~/.zshrc
```

### 问题 2: 设备显示 `unauthorized`

**症状**：`adb devices` 显示 `unauthorized`

**解决方案**：
1. 在手机上撤销 USB 调试授权
2. 重新连接 USB 线
3. 在手机上点击"允许"

### 问题 3: 无法安装 APK

**症状**：安装失败或提示"未知来源"

**解决方案**：
1. 设置 → 安全 → 允许未知来源
2. 或在安装时点击"设置" → 允许此来源

### 问题 4: Chrome 中看不到设备

**解决方案**：
1. 确保 USB 调试已启用
2. 重新插拔 USB 线
3. 在 Chrome 中刷新 `chrome://inspect` 页面
4. 确保应用正在运行

### 问题 5: 构建失败

**常见原因**：
- Android SDK 未完整安装
- 磁盘空间不足
- 网络连接不稳定
- Rust 目标未安装

**解决方案**：
```bash
# 检查 Android SDK
ls $ANDROID_HOME

# 检查磁盘空间
df -h

# 重新安装 Rust 目标
rustup target add aarch64-linux-android

# 清理构建缓存
cargo clean
```

## 📝 项目结构

```
.
├── src/                          # 前端源代码
│   ├── routes/                   # SvelteKit 路由
│   ├── lib/                      # 可复用组件和工具
│   └── app.html                  # HTML 入口
├── src-tauri/                    # Tauri 后端代码
│   ├── src/                      # Rust 源代码
│   ├── Cargo.toml                # Rust 依赖配置
│   └── tauri.conf.json           # Tauri 配置
├── static/                       # 静态资源
├── package.json                  # Node.js 依赖配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.js                # Vite 配置
├── svelte.config.js              # SvelteKit 配置
└── tailwind.config.js            # Tailwind CSS 配置
```

## 📚 可用命令

```bash
# 开发
npm run dev                        # 启动 Web 开发服务器
npm run tauri:dev                  # 启动 Tauri 桌面应用开发

# 构建
npm run build                      # 构建前端资源
npm run tauri:build                # 构建桌面应用
npm run preview                    # 预览构建结果

# 代码检查
npm run check                      # 运行 TypeScript 和 Svelte 检查
npm run check:watch                # 监听模式检查

# Android 相关
npm run android:init               # 初始化 Android 项目
npm run android:dev                # 构建并安装到设备
npm run android:build              # 构建 Android APK
npm run android:install            # 安装 APK 到设备
npm run android:logcat             # 查看应用日志

# Tauri 相关
npm run tauri                      # 运行 Tauri CLI
```

## 🔗 相关文档

- [BUILD_AND_DEBUG.md](./BUILD_AND_DEBUG.md) - 详细的 Android 打包和调试指南
- [Android构建指南.md](./Android构建指南.md) - Android 构建步骤
- [docs/SETUP.md](./docs/SETUP.md) - 项目设置指南
- [Tauri 官方文档](https://tauri.app/)
- [SvelteKit 官方文档](https://kit.svelte.dev/)

## 📞 技术支持

遇到问题时，可以：

1. 查看项目中的详细文档
2. 检查 [Tauri 官方文档](https://tauri.app/v1/guides/building/android)
3. 查看 [Android 开发者文档](https://developer.android.com)
4. 检查构建日志获取详细错误信息

## 📄 许可证

MIT License

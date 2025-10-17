# Android APK 构建指南

## 📱 概述

您的销售管理系统可以构建为Android APK安装包！以下是完整的构建步骤。

## ✅ 当前状态

- ✅ Android Studio 已通过 Homebrew 安装完成
- ⏳ 需要启动 Android Studio 并下载 Android SDK
- ⏳ 需要配置环境变量

## 🛠️ 环境准备

### 1. 启动 Android Studio 并下载 SDK

1. **启动 Android Studio**：
   ```bash
   # 通过命令行启动
   open -a "Android Studio"

   # 或者从 Applications 文件夹启动
   ```

2. **完成初始设置**：
   - 首次启动时，Android Studio 会引导您完成设置
   - 选择 "Standard" 安装类型
   - 同意许可协议
   - 等待 SDK 组件下载完成（这可能需要几分钟）

3. **验证 SDK 安装**：
   - 启动后，进入 `Tools > SDK Manager`
   - 确保已安装：
     - Android SDK Platform (API 33 或更高)
     - Android SDK Build-Tools (最新版本)
     - Android SDK Command-line Tools
     - Android SDK Platform-Tools

### 2. 配置环境变量

**方法一：自动配置脚本**
```bash
# 运行自动配置脚本
./setup-android-env.sh
```

**方法二：手动配置**
```bash
# 编辑 shell 配置文件
nano ~/.zshrc  # 如果使用 zsh

# 添加以下内容：
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# 保存并重新加载配置
source ~/.zshrc
```

### 3. 验证安装

```bash
# 检查 Android SDK 是否正确安装
echo $ANDROID_HOME
adb --version

# 或运行验证脚本
./verify-android-setup.sh
```

## 🔧 项目配置

### 1. 重新初始化 Android 支持

```bash
# 在项目根目录运行
npx tauri android init
```

### 2. 配置 Android 项目

初始化成功后，会在 `src-tauri/gen/android` 目录下生成 Android 项目文件。

## 📦 构建 APK

### 1. 构建调试版本

```bash
# 构建调试 APK
npx tauri android build --debug
```

### 2. 构建发布版本

```bash
# 构建发布 APK
npx tauri android build
```

## 📱 生成的文件

构建成功后，APK 文件将位于：

- **调试版本**：`src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk`
- **发布版本**：`src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk`

## 🎯 应用特点

生成的 Android APK 将包含：

- ✅ 完整的销售管理功能
- ✅ 客户管理
- ✅ 产品管理  
- ✅ 销售单和送货单生成
- ✅ 专业的表格格式
- ✅ 中文大写金额转换
- ✅ 本地数据存储
- ✅ 移动端优化界面

## 🔐 签名配置（可选）

如果要发布到 Google Play Store，需要配置应用签名：

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

在 `src-tauri/gen/android/app/build.gradle` 中添加签名配置。

## 📋 系统要求

### 开发环境
- macOS 10.14 或更高版本
- Android Studio 4.0 或更高版本
- Java 8 或更高版本

### 目标设备
- Android 7.0 (API level 24) 或更高版本
- ARM64 或 x86_64 架构

## 🚀 安装和使用

### 1. 安装 APK

```bash
# 通过 ADB 安装到连接的设备
adb install app-release.apk

# 或者直接将 APK 文件传输到 Android 设备上安装
```

### 2. 应用权限

应用可能需要以下权限：
- 存储权限（保存数据）
- 网络权限（如果需要同步功能）

## 🔧 故障排除

### 常见问题

1. **ANDROID_HOME 未设置**：
   - 确保正确设置了环境变量
   - 重启终端或重新加载配置文件

2. **构建失败**：
   - 检查 Android SDK 是否完整安装
   - 确保有足够的磁盘空间
   - 检查网络连接（需要下载依赖）

3. **签名问题**：
   - 确保签名密钥正确配置
   - 检查密钥库文件路径

## 📞 技术支持

如果遇到问题，可以：
1. 检查 Tauri 官方文档：https://tauri.app/v1/guides/building/android
2. 查看 Android 开发者文档：https://developer.android.com
3. 检查项目的构建日志获取详细错误信息

---

**注意**：首次构建可能需要较长时间，因为需要下载 Android 依赖包。请确保网络连接稳定。

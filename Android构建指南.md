# Android 构建指南

## 适用范围
本文档仅针对本项目（Tauri 2 + SvelteKit）Android APK 构建流程。

## 前置条件
- Android Studio（已安装 SDK / Build-Tools / Platform-Tools / NDK）
- JDK 17
- Rust Android targets

## 环境变量（macOS zsh 示例）
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

如果未安装 Rust Android 目标：
```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## 初始化（首次）
```bash
npm run android:init
```

## 构建方式
### 方式一：使用项目脚本（推荐）
```bash
# 构建发布 APK
./build-android.sh

# 构建并安装到指定设备
./build-android.sh <设备IP>:5555

# 查看应用日志
./build-android.sh --logs
```

### 方式二：直接使用 Tauri 命令
```bash
# 调试构建
npm run tauri android build --debug

# 发布构建
npm run tauri android build
```

## APK 产物目录
```text
src-tauri/gen/android/app/build/outputs/apk/
```

## 快速排查
### `adb` 不可用
```bash
adb --version
```

### 设备未连接
```bash
adb devices
adb connect <设备IP>:5555
```

### Gradle 构建失败
```bash
cd src-tauri/gen/android
./gradlew assembleRelease --info
```

## 说明
本文档已删除与项目无关或与当前工程状态不一致的说明。

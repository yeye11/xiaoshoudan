# APP 打包指南

## 项目打包信息
- 应用名称：`靓仔的app`
- 包名：`com.renteng.sales`
- 版本：`1.0.0`
- 配置文件：`src-tauri/tauri.conf.json`

## 环境要求
- Node.js 18+
- Rust（建议通过 `rustup` 安装）
- 桌面打包：对应平台编译环境
- Android 打包：Android SDK / NDK / JDK 17

## 常用命令
### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
npm run tauri:dev
```

### 桌面端打包
```bash
npm run tauri:build
```

### Android 打包
```bash
# 仅构建 APK
./build-android.sh

# 构建并安装到指定设备
./build-android.sh <设备IP>:5555

# 查看日志
./build-android.sh --logs
```

## 产物位置
### 桌面端
- `src-tauri/target/release/bundle/`

### Android
构建产物位于：
- `src-tauri/gen/android/app/build/outputs/apk/`

常见文件包括：
- `app-universal-release.apk`
- `app-release.apk`

## 常见问题
### Android SDK 未找到
确认 `ANDROID_HOME` 指向 SDK 目录，例如：
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### 构建失败
可先清理并重试：
```bash
npm run build
npm run tauri android build
```

### 设备安装失败
检查：
- 设备是否开启开发者模式和无线调试
- `adb devices` 是否显示 `device`

## 说明
本文档已清理模板化和泛化描述，仅保留当前项目打包相关信息。

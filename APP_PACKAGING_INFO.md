# 项目打包信息汇总

本文档用于快速查看当前项目打包关键点，详细步骤请以 `APP打包指南.md` 和 `Android构建指南.md` 为准。

## 基础信息
- 应用名：`靓仔的app`
- 包名：`com.renteng.sales`
- 版本：`1.0.0`
- 配置：`src-tauri/tauri.conf.json`

## Android
### 构建
```bash
./build-android.sh
```

### 构建并安装到指定设备
```bash
./build-android.sh <设备IP>:5555
```

### 查看日志
```bash
./build-android.sh --logs
```

### 产物目录
`src-tauri/gen/android/app/build/outputs/apk/`

## 桌面端
### 构建
```bash
npm run tauri:build
```

### 产物目录
`src-tauri/target/release/bundle/`

## 签名说明
- 使用根目录 `release.keystore`
- 具体签名细节请参考 `SIGNING_INFO.md`

## 说明
旧版中与当前工程状态不一致的描述已清理。

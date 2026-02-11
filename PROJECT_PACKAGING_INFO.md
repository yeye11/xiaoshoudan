# 项目打包信息汇总

本文档为打包信息索引，避免重复维护。

## 推荐阅读顺序
1. `APP打包指南.md`（总览）
2. `Android构建指南.md`（Android 环境与构建）
3. `SIGNING_INFO.md`（签名配置）

## 快速命令
```bash
# 桌面端打包
npm run tauri:build

# Android 打包
./build-android.sh

# Android 打包并安装
./build-android.sh <设备IP>:5555

# 查看 Android 日志
./build-android.sh --logs
```

## 产物路径
- 桌面端：`src-tauri/target/release/bundle/`
- Android：`src-tauri/gen/android/app/build/outputs/apk/`

## 说明
本文档已移除历史重复描述，保留当前项目可用信息。

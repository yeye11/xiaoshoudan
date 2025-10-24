#!/bin/bash

# Android APK 构建脚本
# 仁腾装饰材料管理系统

# 加载共享的构建工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/build-utils.sh"

echo "🚀 开始构建 Android APK..."

# 检查基础环境
if ! check_command "cargo" "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"; then
    exit 1
fi

if ! check_command "npm" "请访问 https://nodejs.org/"; then
    exit 1
fi

# 检查 Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME 环境变量未设置"
    echo "正在尝试设置默认路径..."
    
    # 尝试常见的 Android SDK 路径
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ 找到 Android SDK: $ANDROID_HOME"
    else
        echo "❌ 未找到 Android SDK，请先安装 Android Studio"
        echo "或手动设置 ANDROID_HOME 环境变量"
        exit 1
    fi
fi

# 检查和设置 NDK
if [ -z "$NDK_HOME" ]; then
    echo "⚠️  NDK_HOME 环境变量未设置"
    echo "正在尝试设置默认路径..."

    # 尝试找到 NDK 路径
    if [ -d "$ANDROID_HOME/ndk" ]; then
        # 找到最新版本的 NDK
        NDK_VERSION=$(ls -1 "$ANDROID_HOME/ndk" | sort -V | tail -1)
        if [ -n "$NDK_VERSION" ]; then
            export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
            echo "✅ 找到 NDK: $NDK_HOME"
        else
            echo "❌ 未找到 NDK 版本，请先安装 NDK"
            exit 1
        fi
    else
        echo "❌ 未找到 NDK，请先在 Android Studio 中安装 NDK"
        exit 1
    fi
fi

# 设置 Java 环境
if ! command -v java &> /dev/null; then
    echo "⚠️  Java 未安装或未在 PATH 中"
    echo "正在尝试设置 Java 路径..."

    # 尝试设置 Homebrew 安装的 OpenJDK 17
    if [ -d "/opt/homebrew/opt/openjdk@17/bin" ]; then
        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
        echo "✅ 找到 Java: $(java -version 2>&1 | head -1)"
    else
        echo "❌ 未找到 Java，请先安装 Java JDK"
        echo "可以使用: brew install openjdk@17"
        exit 1
    fi
fi

# 设置 PATH
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"

echo "✅ 环境检查完成"

# 加载 Rust 环境
source "$HOME/.cargo/env"

# 构建前端
if ! build_frontend; then
    exit 1
fi

# 初始化 Android 项目（如果需要）
if [ ! -d "src-tauri/gen/android" ]; then
    echo "🔧 初始化 Android 项目..."
    npx tauri android init
    
    if [ $? -ne 0 ]; then
        echo "❌ Android 项目初始化失败"
        echo "请确保 Android SDK 已正确安装"
        exit 1
    fi
    
    echo "✅ Android 项目初始化完成"
fi

# 构建 Android APK
echo "📱 构建 Android APK..."

# 构建调试版本
echo "🔨 构建调试版本..."
npx tauri android build --debug

if [ $? -eq 0 ]; then
    echo "✅ 调试版本构建成功！"
    echo "📍 APK 位置: src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ 调试版本构建失败"
fi

# 构建发布版本
echo "🔨 构建发布版本..."
npx tauri android build

if [ $? -eq 0 ]; then
    echo "✅ 发布版本构建成功！"
    echo "📍 APK 位置: src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk"
    
    # 显示 APK 信息
    echo ""
    echo "📱 生成的 APK 文件："
    find src-tauri/gen/android/app/build/outputs/apk -name "*.apk" -exec ls -lh {} \;
    
else
    echo "❌ 发布版本构建失败"
fi

echo ""
echo "🎉 Android 构建完成！"
echo ""
echo "📋 使用说明："
echo "1. 将 APK 文件传输到 Android 设备"
echo "2. 在设备上启用"未知来源"应用安装"
echo "3. 点击 APK 文件进行安装"
echo ""
echo "或者使用 ADB 安装："
echo "adb install src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk"

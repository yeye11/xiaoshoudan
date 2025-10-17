#!/bin/bash

# Android 发布版本 APK 构建脚本
# 仁腾装饰材料管理系统 - 发布版本

echo "🚀 开始构建发布版本 Android APK..."

# 检查环境
echo "📋 检查构建环境..."

# 检查 Rust 环境
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    exit 1
fi

# 检查 Node.js 环境
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
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

# 构建前端（生产版本）
echo "🔨 构建前端（生产优化）..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"

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

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf src-tauri/gen/android/app/build/outputs/apk/release/
rm -rf src-tauri/gen/android/app/build/outputs/bundle/release/

# 构建发布版本 APK
echo "📱 构建发布版本 Android APK..."
echo "⚠️  注意：发布版本需要签名密钥，如果没有会生成未签名版本"

# 构建发布版本
npx tauri android build

if [ $? -eq 0 ]; then
    echo "✅ 发布版本构建成功！"
    
    # 查找生成的 APK 文件
    echo ""
    echo "📱 生成的发布版本文件："
    
    # 查找 APK 文件
    if [ -d "src-tauri/gen/android/app/build/outputs/apk" ]; then
        find src-tauri/gen/android/app/build/outputs/apk -name "*.apk" -exec ls -lh {} \;
    fi
    
    # 查找 AAB 文件
    if [ -d "src-tauri/gen/android/app/build/outputs/bundle" ]; then
        find src-tauri/gen/android/app/build/outputs/bundle -name "*.aab" -exec ls -lh {} \;
    fi
    
    echo ""
    echo "🎯 推荐使用的发布版本文件："
    
    # 查找发布版本 APK
    RELEASE_APK=$(find src-tauri/gen/android/app/build/outputs/apk -name "*release*.apk" | head -1)
    if [ -n "$RELEASE_APK" ]; then
        echo "📦 APK: $RELEASE_APK"
        echo "   文件大小: $(ls -lh "$RELEASE_APK" | awk '{print $5}')"
    fi
    
    # 查找 AAB 文件
    RELEASE_AAB=$(find src-tauri/gen/android/app/build/outputs/bundle -name "*release*.aab" | head -1)
    if [ -n "$RELEASE_AAB" ]; then
        echo "📦 AAB: $RELEASE_AAB"
        echo "   文件大小: $(ls -lh "$RELEASE_AAB" | awk '{print $5}')"
    fi
    
else
    echo "❌ 发布版本构建失败"
    echo "请检查错误信息并重试"
    exit 1
fi

echo ""
echo "🎉 发布版本构建完成！"
echo ""
echo "📋 安装说明："
echo "1. 将 APK 文件传输到 Android 设备"
echo "2. 在设备上启用'未知来源'应用安装"
echo "3. 点击 APK 文件进行安装"
echo ""
echo "🔧 或者使用 ADB 安装："
if [ -n "$RELEASE_APK" ]; then
    echo "adb install \"$RELEASE_APK\""
fi
echo ""
echo "📝 发布版本特点："
echo "• 更小的文件大小（优化压缩）"
echo "• 更快的运行速度（代码优化）"
echo "• 移除调试信息（安全性更高）"
echo "• 适合正式发布和分发"
echo ""
echo "⚠️  注意：如果需要上传到应用商店，请使用 AAB 文件"

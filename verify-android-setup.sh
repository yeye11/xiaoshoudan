#!/bin/bash

# Android 环境验证脚本
# 仁腾装饰材料管理系统

echo "🔍 验证 Android 开发环境..."

# 检查 Android Studio
echo "📱 检查 Android Studio..."
if [ -d "/Applications/Android Studio.app" ]; then
    echo "✅ Android Studio 已安装"
else
    echo "❌ Android Studio 未安装"
    echo "请运行: brew install android-studio"
    exit 1
fi

# 检查 Android SDK
echo "📦 检查 Android SDK..."
if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "✅ Android SDK 已安装: $HOME/Library/Android/sdk"
else
    echo "❌ Android SDK 未找到"
    echo "请启动 Android Studio 并完成初始设置"
    exit 1
fi

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
else
    echo "❌ ANDROID_HOME 未设置"
    echo "请运行: ./setup-android-env.sh"
    exit 1
fi

# 检查命令行工具
echo "⚙️  检查命令行工具..."

if command -v adb &> /dev/null; then
    echo "✅ adb: $(adb --version | head -n1)"
else
    echo "❌ adb 命令未找到"
    echo "请检查 PATH 配置"
fi

if command -v aapt &> /dev/null; then
    echo "✅ aapt 可用"
else
    echo "⚠️  aapt 命令未找到（可能需要安装 build-tools）"
fi

# 检查 Rust 环境
echo "🦀 检查 Rust 环境..."
if command -v cargo &> /dev/null; then
    echo "✅ Rust: $(rustc --version)"
else
    echo "❌ Rust 未安装"
    echo "请运行: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# 检查 Node.js 环境
echo "📦 检查 Node.js 环境..."
if command -v npm &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查 Tauri CLI
echo "🚀 检查 Tauri CLI..."
if command -v npx &> /dev/null; then
    if npx tauri --version &> /dev/null; then
        echo "✅ Tauri CLI 可用"
    else
        echo "⚠️  Tauri CLI 未安装，将在构建时自动安装"
    fi
else
    echo "❌ npx 命令未找到"
fi

# 检查项目依赖
echo "📋 检查项目依赖..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules 存在"
    else
        echo "⚠️  node_modules 不存在，请运行: npm install"
    fi
else
    echo "❌ package.json 未找到"
    exit 1
fi

if [ -f "src-tauri/Cargo.toml" ]; then
    echo "✅ Tauri 配置存在"
else
    echo "❌ Tauri 配置未找到"
    exit 1
fi

echo ""
echo "🎉 环境验证完成！"
echo ""
echo "📋 总结："
echo "- Android Studio: ✅"
echo "- Android SDK: ✅"
echo "- 环境变量: ✅"
echo "- Rust: ✅"
echo "- Node.js: ✅"
echo "- 项目配置: ✅"
echo ""
echo "🚀 可以开始构建 Android APK："
echo "   ./build-android.sh"

#!/bin/bash

# Android 环境自动配置脚本
# 靓仔的app

echo "🔧 配置 Android 开发环境..."

# 检查 Android Studio 是否已安装
if [ ! -d "/Applications/Android Studio.app" ]; then
    echo "❌ Android Studio 未安装"
    echo "请先运行: brew install android-studio"
    exit 1
fi

echo "✅ Android Studio 已安装"

# 检查 Android SDK 是否存在
SDK_PATH="$HOME/Library/Android/sdk"
if [ ! -d "$SDK_PATH" ]; then
    echo "⚠️  Android SDK 未找到在默认位置: $SDK_PATH"
    echo ""
    echo "请按照以下步骤操作："
    echo "1. 启动 Android Studio:"
    echo "   open -a 'Android Studio'"
    echo ""
    echo "2. 完成初始设置并下载 SDK"
    echo "3. 重新运行此脚本"
    echo ""
    
    # 尝试启动 Android Studio
    read -p "是否现在启动 Android Studio? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 启动 Android Studio..."
        open -a "Android Studio"
        echo "请完成设置后重新运行此脚本"
    fi
    exit 1
fi

echo "✅ Android SDK 已找到: $SDK_PATH"

# 配置环境变量
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
else
    SHELL_CONFIG="$HOME/.zshrc"  # 默认使用 zsh
fi

echo "📝 配置环境变量到: $SHELL_CONFIG"

# 检查是否已经配置过
if grep -q "ANDROID_HOME" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️  环境变量已存在，跳过配置"
else
    echo "➕ 添加环境变量..."
    
    # 备份配置文件
    cp "$SHELL_CONFIG" "$SHELL_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # 添加环境变量
    cat >> "$SHELL_CONFIG" << EOF

# Android SDK 环境变量 (由 setup-android-env.sh 添加)
export ANDROID_HOME=\$HOME/Library/Android/sdk
export PATH=\$PATH:\$ANDROID_HOME/emulator
export PATH=\$PATH:\$ANDROID_HOME/platform-tools
export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin
EOF
    
    echo "✅ 环境变量已添加"
fi

# 加载环境变量
echo "🔄 加载环境变量..."
source "$SHELL_CONFIG"

# 验证安装
echo "🔍 验证安装..."

if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME 未设置"
    echo "请重新启动终端或运行: source $SHELL_CONFIG"
    exit 1
fi

if ! command -v adb &> /dev/null; then
    echo "❌ adb 命令未找到"
    echo "请检查 Android SDK 安装"
    exit 1
fi

echo "✅ 环境配置完成！"
echo ""
echo "📋 环境信息："
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ADB 版本: $(adb --version | head -n1)"
echo ""
echo "🎉 现在可以构建 Android APK 了！"
echo "运行: ./build-android.sh"

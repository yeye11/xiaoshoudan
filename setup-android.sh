#!/bin/bash

# Android 开发环境自动安装脚本

set -e

echo "🚀 开始安装 Android 开发环境..."

# 检查是否安装了 Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ 未找到 Homebrew，请先安装 Homebrew"
    echo "访问: https://brew.sh"
    exit 1
fi

# 安装 Android SDK 命令行工具
echo "📦 安装 Android SDK 命令行工具..."
brew install --cask android-commandlinetools

# 设置 ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
mkdir -p $ANDROID_HOME

# 安装必要的 SDK 组件
echo "📦 安装 SDK 组件..."
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0" "ndk;25.1.8937393"

# 设置 NDK_HOME
export NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393

# 添加到 shell 配置文件
SHELL_CONFIG="$HOME/.zshrc"
if [ ! -f "$SHELL_CONFIG" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

echo "📝 配置环境变量到 $SHELL_CONFIG..."

# 检查是否已经配置
if ! grep -q "ANDROID_HOME" "$SHELL_CONFIG"; then
    cat >> "$SHELL_CONFIG" << 'EOF'

# Android 开发环境
export ANDROID_HOME=$HOME/Library/Android/sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
EOF
    echo "✅ 环境变量已添加到 $SHELL_CONFIG"
else
    echo "ℹ️  环境变量已存在，跳过"
fi

# 应用配置
source "$SHELL_CONFIG"

# 验证安装
echo ""
echo "🔍 验证安装..."
echo "ANDROID_HOME: $ANDROID_HOME"
echo "NDK_HOME: $NDK_HOME"

if command -v adb &> /dev/null; then
    echo "✅ adb 版本: $(adb --version | head -n 1)"
else
    echo "❌ adb 未找到"
fi

if [ -d "$NDK_HOME" ]; then
    echo "✅ NDK 已安装: $NDK_HOME"
else
    echo "❌ NDK 未找到"
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "⚠️  重要：请执行以下命令使环境变量生效："
echo "source $SHELL_CONFIG"
echo ""
echo "然后重新运行："
echo "npm run android:dev"


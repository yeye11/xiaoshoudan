#!/bin/bash

# Android NDK 安装脚本
# 仁腾装饰材料管理系统

echo "🔧 安装 Android NDK..."

# 设置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# 检查 Android SDK 是否存在
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK 未找到: $ANDROID_HOME"
    echo "请先安装 Android Studio 并配置 SDK"
    exit 1
fi

echo "✅ Android SDK 已找到: $ANDROID_HOME"

# 检查是否已安装 NDK
if [ -d "$ANDROID_HOME/ndk" ]; then
    echo "✅ NDK 已安装"
    NDK_VERSION=$(ls "$ANDROID_HOME/ndk" | head -n1)
    export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
    echo "NDK 版本: $NDK_VERSION"
    echo "NDK 路径: $NDK_HOME"
else
    echo "⚠️  NDK 未安装"
    echo ""
    echo "请按照以下步骤安装 NDK："
    echo "1. 启动 Android Studio"
    echo "2. 进入 Tools → SDK Manager"
    echo "3. 切换到 SDK Tools 标签"
    echo "4. 勾选 'NDK (Side by side)'"
    echo "5. 点击 Apply 安装"
    echo ""
    
    # 尝试启动 Android Studio
    read -p "是否现在启动 Android Studio 安装 NDK? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 启动 Android Studio..."
        open -a "Android Studio"
        echo ""
        echo "请在 Android Studio 中安装 NDK，然后重新运行此脚本"
        echo "或者运行: ./build-android.sh"
    fi
    exit 1
fi

# 更新环境变量配置
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
else
    SHELL_CONFIG="$HOME/.zshrc"
fi

echo "📝 更新环境变量配置: $SHELL_CONFIG"

# 检查是否已经配置过 NDK_HOME
if grep -q "NDK_HOME" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️  NDK_HOME 环境变量已存在"
else
    echo "➕ 添加 NDK_HOME 环境变量..."
    
    # 备份配置文件
    cp "$SHELL_CONFIG" "$SHELL_CONFIG.backup.ndk.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # 添加 NDK_HOME 环境变量
    cat >> "$SHELL_CONFIG" << EOF

# Android NDK 环境变量 (由 install-ndk.sh 添加)
export NDK_HOME=\$ANDROID_HOME/ndk/$NDK_VERSION
EOF
    
    echo "✅ NDK_HOME 环境变量已添加"
fi

# 验证安装
echo "🔍 验证 NDK 安装..."
if [ -n "$NDK_HOME" ] && [ -d "$NDK_HOME" ]; then
    echo "✅ NDK 安装验证成功"
    echo "NDK_HOME: $NDK_HOME"
    echo ""
    echo "🎉 NDK 配置完成！"
    echo "现在可以构建 Android APK："
    echo "   ./build-android.sh"
else
    echo "❌ NDK 验证失败"
    exit 1
fi

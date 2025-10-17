#!/bin/bash

# 自动安装 Android NDK 脚本
# 仁腾装饰材料管理系统

echo "🔧 自动检查和安装 Android NDK..."

# 设置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# 检查 Android SDK 是否存在
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK 未找到: $ANDROID_HOME"
    echo "请先完成 Android Studio 的初始设置"
    exit 1
fi

echo "✅ Android SDK 已找到: $ANDROID_HOME"

# 查找 sdkmanager 工具
SDKMANAGER=""
if [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
elif [ -f "$ANDROID_HOME/tools/bin/sdkmanager" ]; then
    SDKMANAGER="$ANDROID_HOME/tools/bin/sdkmanager"
else
    echo "⚠️  sdkmanager 工具未找到"
    echo "正在尝试通过 Android Studio 安装..."
    
    # 尝试启动 Android Studio 并显示指导
    echo ""
    echo "📋 请在 Android Studio 中手动安装 NDK："
    echo "1. 创建一个新项目（任意名称）"
    echo "2. 在项目中，点击 Tools → SDK Manager"
    echo "3. 切换到 SDK Tools 标签"
    echo "4. 勾选 'NDK (Side by side)'"
    echo "5. 点击 Apply 安装"
    echo ""
    
    read -p "是否现在打开 Android Studio？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open -a "Android Studio"
    fi
    exit 1
fi

echo "✅ 找到 sdkmanager: $SDKMANAGER"

# 检查是否已安装 NDK
echo "🔍 检查 NDK 安装状态..."
NDK_INSTALLED=$($SDKMANAGER --list | grep "ndk" | grep "Installed" | head -n1)

if [ -n "$NDK_INSTALLED" ]; then
    echo "✅ NDK 已安装: $NDK_INSTALLED"
    
    # 查找 NDK 版本
    NDK_VERSION=$(ls "$ANDROID_HOME/ndk" 2>/dev/null | head -n1)
    if [ -n "$NDK_VERSION" ]; then
        export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
        echo "NDK 路径: $NDK_HOME"
        
        # 更新环境变量
        SHELL_CONFIG="$HOME/.zshrc"
        if [ -n "$BASH_VERSION" ]; then
            SHELL_CONFIG="$HOME/.bash_profile"
        fi
        
        if ! grep -q "NDK_HOME" "$SHELL_CONFIG" 2>/dev/null; then
            echo "export NDK_HOME=\$ANDROID_HOME/ndk/$NDK_VERSION" >> "$SHELL_CONFIG"
            echo "✅ NDK_HOME 环境变量已添加到 $SHELL_CONFIG"
        fi
        
        echo ""
        echo "🎉 NDK 配置完成！现在可以构建 Android APK："
        echo "   ./build-android.sh"
        
    else
        echo "⚠️  NDK 目录未找到，可能安装不完整"
    fi
else
    echo "⚠️  NDK 未安装，正在尝试自动安装..."
    
    # 尝试自动安装 NDK
    echo "📦 开始安装 NDK..."
    $SDKMANAGER "ndk;25.1.8937393" --verbose
    
    if [ $? -eq 0 ]; then
        echo "✅ NDK 安装成功！"
        # 重新运行脚本检查安装结果
        exec "$0"
    else
        echo "❌ NDK 自动安装失败"
        echo ""
        echo "请手动在 Android Studio 中安装："
        echo "1. 创建新项目"
        echo "2. Tools → SDK Manager → SDK Tools"
        echo "3. 勾选 'NDK (Side by side)'"
        echo "4. 点击 Apply"
        exit 1
    fi
fi

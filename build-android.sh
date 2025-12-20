#!/bin/bash

# Android APK 构建脚本
# 靓仔的app
# 使用方法：
#   ./build-android.sh                    # 构建发布版 APK
#   ./build-android.sh 192.168.31.14:5555 # 构建并安装到指定设备
#   ./build-android.sh --logs             # 启动日志查看（需先安装）

# /Users/zdp/android-sdk/platform-tools/adb -s 192.168.31.14:5555 install -r src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk 
# /Users/zdp/android-sdk/platform-tools/adb -s 192.168.31.25:5555 install -r src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk 
# 加载共享的构建工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/build-utils.sh"

# 目标设备地址（如果提供）
TARGET_DEVICE="192.168.31.14:5555"

# 如果参数是 --logs，则启动日志查看
if [ "$TARGET_DEVICE" = "--logs" ]; then
    echo "📱 启动应用日志查看..."
    export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
    
    # 获取所有连接的设备
    DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | awk '{print $1}')
    
    if [ -z "$DEVICES" ]; then
        echo "❌ 没有找到连接的设备"
        echo "请先连接设备: adb connect <设备IP>:5555"
        exit 1
    fi
    
    # 如果有多个设备，显示选择
    DEVICE_COUNT=$(echo "$DEVICES" | wc -l | xargs)
    if [ "$DEVICE_COUNT" -gt 1 ]; then
        echo "发现多个设备："
        echo "$DEVICES"
        echo ""
        read -p "请输入要查看日志的设备地址: " SELECTED_DEVICE
    else
        SELECTED_DEVICE="$DEVICES"
    fi
    
    echo "📋 查看设备 $SELECTED_DEVICE 的应用日志（仅显示 com.renteng.sales）..."
    echo "按 Ctrl+C 退出"
    echo ""
    
    # 过滤应用日志：只显示包名相关的日志
    adb -s "$SELECTED_DEVICE" logcat | grep --line-buffered "com.renteng.sales"
    exit 0
fi

echo "🚀 开始构建 Android 发布版 APK..."

# 检查基础环境
if ! check_command "npm" "请访问 https://nodejs.org/"; then
    exit 1
fi

# 设置 Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ 设置 Android SDK: $ANDROID_HOME"
    else
        echo "❌ 未找到 Android SDK"
        exit 1
    fi
fi

export ANDROID_SDK_ROOT="$ANDROID_HOME"

# 设置 NDK（使用最新版本）
if [ -d "$ANDROID_HOME/ndk" ]; then
    NDK_VERSION=$(ls -1 "$ANDROID_HOME/ndk" | sort -V | tail -1)
    export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
    echo "✅ 设置 NDK: $NDK_HOME"
else
    echo "❌ 未找到 NDK"
    exit 1
fi

# 设置 Java 环境（查找 JDK 17）
if [ -z "$JAVA_HOME" ]; then
    # macOS 系统使用 java_home
    if command -v /usr/libexec/java_home &> /dev/null; then
        JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)
        if [ -n "$JAVA_HOME" ]; then
            export JAVA_HOME
            echo "✅ 设置 Java: $JAVA_HOME"
        fi
    fi
    
    # 如果还没找到，尝试 Homebrew 安装路径
    if [ -z "$JAVA_HOME" ] && [ -d "/opt/homebrew/opt/openjdk@17" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
        echo "✅ 设置 Java (Homebrew): $JAVA_HOME"
    fi
fi

# 设置 PATH
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
export PATH="$HOME/Library/Android/sdk/emulator:$PATH"
export PATH="$HOME/Library/Android/sdk/cmdline-tools/latest/bin:$PATH"

# 加载 Rust 环境
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

echo "✅ 环境检查完成"

# 构建前端
echo "📦 构建前端..."
if ! build_frontend; then
    exit 1
fi

# 构建发布版 APK（使用项目根目录的 release.keystore 签名）
echo "🔨 构建发布版 APK（使用正式签名）..."
echo "📝 签名文件: release.keystore (cypridina/123456)"

# 使用 npx pnpm 避免 pnpm 未全局安装的问题
npx pnpm tauri android build --apk true

if [ $? -ne 0 ]; then
    echo "❌ 发布版本构建失败"
    exit 1
fi

echo "✅ 发布版本构建成功！"

# 查找生成的 APK 文件
APK_PATH=$(find src-tauri/gen/android/app/build/outputs/apk -name "*.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
    echo "❌ 未找到生成的 APK 文件"
    exit 1
fi

echo "📍 APK 位置: $APK_PATH"
ls -lh "$APK_PATH"

# 如果提供了设备地址，则安装到设备
if [ -n "$TARGET_DEVICE" ]; then
    echo ""
    echo "📱 安装到设备: $TARGET_DEVICE"
    
    # 确保设备已连接
    if ! echo "$TARGET_DEVICE" | grep -q ":"; then
        # 如果没有端口，默认使用 5555
        TARGET_DEVICE="${TARGET_DEVICE}:5555"
    fi
    
    # 连接设备
    echo "🔌 连接设备..."
    adb connect "$TARGET_DEVICE"
    
    # 等待连接
    sleep 2
    
    # 检查设备是否在线
    DEVICE_STATUS=$(adb devices | grep "$TARGET_DEVICE" | awk '{print $2}')
    
    if [ "$DEVICE_STATUS" != "device" ]; then
        echo "❌ 设备未连接或离线"
        echo "请确保："
        echo "  1. 设备已开启无线调试"
        echo "  2. 设备与电脑在同一网络"
        echo "  3. 设备 IP 地址正确"
        exit 1
    fi
    
    echo "✅ 设备已连接"
    
    # 覆盖安装
    echo "📲 覆盖安装应用..."
    adb -s "$TARGET_DEVICE" install -r "$APK_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ 应用安装成功！"
        echo ""
        echo "📋 后续操作："
        echo "  查看日志: ./build-android.sh --logs"
        echo "  卸载应用: adb -s $TARGET_DEVICE uninstall com.renteng.sales"
    else
        echo "❌ 应用安装失败"
        exit 1
    fi
else


    echo ""
    echo "🎉 构建完成！"
    echo ""
    echo "📋 安装方法："
    echo "  1. 手动安装: 将 APK 传输到设备并安装"
    echo "  2. ADB 安装: /Users/zdp/android-sdk/platform-tools/adb install -r \"$APK_PATH\""
    echo "  3. 指定设备: ./build-android.sh 192.168.31.14:5555"
    echo ""
    echo "📋 查看日志: ./build-android.sh --logs"
fi

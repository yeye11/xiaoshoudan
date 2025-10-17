#!/bin/bash

# 仁腾装饰材料管理系统 - 自动打包脚本

echo "🚀 开始打包仁腾装饰材料管理系统..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    echo "安装命令: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# 检查 Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "📦 安装 Tauri CLI..."
    npm install -g @tauri-apps/cli
fi

echo "✅ 环境检查完成"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建前端
echo "🔨 构建前端应用..."
npm run build

# 检查构建是否成功
if [ ! -d "build" ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"

# 打包应用
echo "📱 开始打包桌面应用..."
npm run tauri build

# 检查打包结果
if [ $? -eq 0 ]; then
    echo "🎉 打包成功！"
    echo ""
    echo "📦 打包文件位置:"
    
    # 根据操作系统显示不同的路径
    case "$(uname -s)" in
        Darwin*)
            echo "  macOS: src-tauri/target/release/bundle/dmg/"
            ;;
        Linux*)
            echo "  Linux: src-tauri/target/release/bundle/deb/"
            echo "         src-tauri/target/release/bundle/appimage/"
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            echo "  Windows: src-tauri/target/release/bundle/msi/"
            echo "           src-tauri/target/release/bundle/nsis/"
            ;;
        *)
            echo "  检查 src-tauri/target/release/bundle/ 目录"
            ;;
    esac
    
    echo ""
    echo "🚀 应用打包完成，可以分发安装包了！"
else
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi

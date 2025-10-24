#!/bin/bash

# 仁腾装饰材料管理系统 - 桌面应用打包脚本

# 加载共享的构建工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/build-utils.sh"

echo "🚀 开始打包仁腾装饰材料管理系统..."

# 检查环境
if ! check_environment; then
    exit 1
fi

# 安装依赖
if ! install_dependencies; then
    exit 1
fi

# 构建前端
if ! build_frontend; then
    exit 1
fi

# 打包应用
echo "📱 开始打包桌面应用..."
npm run tauri build

if [ $? -eq 0 ]; then
    echo "🎉 打包成功！"
    echo ""
    show_bundle_location
    echo ""
    echo "🚀 应用打包完成，可以分发安装包了！"
else
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi

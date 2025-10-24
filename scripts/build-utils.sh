#!/bin/bash

# 构建工具函数库 - 共享的构建逻辑

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查命令是否存在
check_command() {
  local cmd=$1
  local install_msg=$2
  
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}❌ $cmd 未安装，请先安装 $cmd${NC}"
    if [ -n "$install_msg" ]; then
      echo -e "${YELLOW}安装命令: $install_msg${NC}"
    fi
    return 1
  fi
  return 0
}

# 检查环境
check_environment() {
  echo -e "${BLUE}📋 检查构建环境...${NC}"
  
  local all_ok=true
  
  # 检查 Node.js
  if ! check_command "node" "请访问 https://nodejs.org/"; then
    all_ok=false
  fi
  
  # 检查 Rust
  if ! check_command "rustc" "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"; then
    all_ok=false
  fi
  
  if [ "$all_ok" = false ]; then
    return 1
  fi
  
  echo -e "${GREEN}✅ 环境检查完成${NC}"
  return 0
}

# 安装依赖
install_dependencies() {
  echo -e "${BLUE}📦 安装项目依赖...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    return 1
  fi
  echo -e "${GREEN}✅ 依赖安装完成${NC}"
  return 0
}

# 构建前端
build_frontend() {
  echo -e "${BLUE}🔨 构建前端应用...${NC}"
  npm run build
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 前端构建失败${NC}"
    return 1
  fi
  
  if [ ! -d "build" ]; then
    echo -e "${RED}❌ 构建输出目录不存在${NC}"
    return 1
  fi
  
  echo -e "${GREEN}✅ 前端构建完成${NC}"
  return 0
}

# 获取操作系统类型
get_os_type() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      echo "linux"
      ;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*)
      echo "windows"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# 显示打包文件位置
show_bundle_location() {
  local os_type=$(get_os_type)
  
  echo -e "${BLUE}📦 打包文件位置:${NC}"
  
  case "$os_type" in
    macos)
      echo "  macOS: src-tauri/target/release/bundle/dmg/"
      ;;
    linux)
      echo "  Linux: src-tauri/target/release/bundle/deb/"
      echo "         src-tauri/target/release/bundle/appimage/"
      ;;
    windows)
      echo "  Windows: src-tauri/target/release/bundle/msi/"
      echo "           src-tauri/target/release/bundle/nsis/"
      ;;
    *)
      echo "  检查 src-tauri/target/release/bundle/ 目录"
      ;;
  esac
}

# 导出函数
export -f check_command
export -f check_environment
export -f install_dependencies
export -f build_frontend
export -f get_os_type
export -f show_bundle_location


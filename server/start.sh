#!/bin/bash

# 服务端启动脚本
# 用于快速启动服务端

set -e

echo "=========================================="
echo "🚀 Cypridina 服务端启动脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js 未安装${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js 已安装: $(node --version)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm 未安装${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm 已安装: $(npm --version)${NC}"

# 检查 Docker (可选)
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✅ Docker 已安装${NC}"
  DOCKER_AVAILABLE=true
else
  echo -e "${YELLOW}⚠️  Docker 未安装 (可选)${NC}"
  DOCKER_AVAILABLE=false
fi

echo ""

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
  echo "📥 安装依赖..."
  npm install --legacy-peer-deps
  echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
  echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

echo ""

# 启动数据库
echo "🗄️  启动数据库..."

if [ "$DOCKER_AVAILABLE" = true ]; then
  # 检查容器是否已运行
  if docker ps | grep -q cypridina-db; then
    echo -e "${GREEN}✅ 数据库容器已运行${NC}"
  else
    # 检查容器是否存在但未运行
    if docker ps -a | grep -q cypridina-db; then
      echo "🔄 启动现有数据库容器..."
      docker start cypridina-db
      echo -e "${GREEN}✅ 数据库容器已启动${NC}"
    else
      echo "🆕 创建新的数据库容器..."
      docker-compose up -d postgres
      echo -e "${GREEN}✅ 数据库容器已创建并启动${NC}"
    fi
  fi
  
  # 等待数据库就绪
  echo "⏳ 等待数据库就绪..."
  sleep 3
else
  echo -e "${YELLOW}⚠️  请确保 PostgreSQL 已在 localhost:5432 运行${NC}"
  echo "   用户: postgres"
  echo "   密码: postgres"
  echo "   数据库: cypridina"
fi

echo ""

# 初始化数据库
echo "🔧 初始化数据库..."
if npm run db:migrate; then
  echo -e "${GREEN}✅ 数据库迁移完成${NC}"
else
  echo -e "${RED}❌ 数据库迁移失败${NC}"
  exit 1
fi

echo ""

# 种子数据 (可选)
read -p "是否要导入测试数据? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 导入测试数据..."
  if npm run db:seed; then
    echo -e "${GREEN}✅ 测试数据导入完成${NC}"
  else
    echo -e "${YELLOW}⚠️  测试数据导入失败 (可忽略)${NC}"
  fi
fi

echo ""

# 启动服务
echo "🚀 启动服务..."
echo -e "${GREEN}服务将在 http://localhost:3000 运行${NC}"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev


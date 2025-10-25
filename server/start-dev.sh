#!/bin/bash

# 快速开发启动脚本 (使用 SQLite)

set -e

echo "=========================================="
echo "🚀 Cypridina 服务端 - 快速开发启动"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 使用开发环境配置
export NODE_ENV=development
export PRISMA_SCHEMA_ENGINE_BINARY=./node_modules/.bin/schema-engine

echo "📋 使用开发环境配置..."
echo "   数据库: SQLite (dev.db)"
echo "   端口: 3000"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "📥 安装依赖..."
  npm install --legacy-peer-deps
fi

echo ""
echo "🔧 初始化数据库..."

# 使用开发 schema
cp prisma/schema.dev.prisma prisma/schema.prisma

# 初始化数据库
if npm run db:migrate; then
  echo -e "${GREEN}✅ 数据库初始化完成${NC}"
else
  echo -e "${RED}❌ 数据库初始化失败${NC}"
  exit 1
fi

echo ""
echo "🌱 导入测试数据..."
if npm run db:seed 2>/dev/null; then
  echo -e "${GREEN}✅ 测试数据导入完成${NC}"
else
  echo -e "${YELLOW}⚠️  测试数据导入失败 (可忽略)${NC}"
fi

echo ""
echo "🚀 启动服务..."
echo -e "${GREEN}服务将在 http://localhost:3000 运行${NC}"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev


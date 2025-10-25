#!/bin/bash

# 服务端测试脚本
# 用于检查服务端是否有问题

echo "=========================================="
echo "🧪 Cypridina 服务端测试脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
test_command() {
  local test_name=$1
  local command=$2
  
  echo -n "测试: $test_name ... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 通过${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ 失败${NC}"
    ((TESTS_FAILED++))
  fi
}

# 1. 检查 Node.js
echo "📋 检查环境..."
test_command "Node.js 已安装" "node --version"
test_command "npm 已安装" "npm --version"
echo ""

# 2. 检查依赖
echo "📦 检查依赖..."
test_command "package.json 存在" "test -f package.json"
test_command "node_modules 存在" "test -d node_modules"
echo ""

# 3. 检查配置文件
echo "⚙️  检查配置文件..."
test_command ".env 文件存在" "test -f .env"
test_command "tsconfig.json 存在" "test -f tsconfig.json"
test_command "jest.config.js 存在" "test -f jest.config.js"
echo ""

# 4. 检查源代码
echo "📝 检查源代码..."
test_command "src/app.ts 存在" "test -f src/app.ts"
test_command "src/config 目录存在" "test -d src/config"
test_command "src/controllers 目录存在" "test -d src/controllers"
test_command "src/services 目录存在" "test -d src/services"
test_command "src/routes 目录存在" "test -d src/routes"
test_command "src/middleware 目录存在" "test -d src/middleware"
test_command "src/utils 目录存在" "test -d src/utils"
test_command "src/types 目录存在" "test -d src/types"
echo ""

# 5. 检查数据库配置
echo "🗄️  检查数据库配置..."
test_command "prisma/schema.prisma 存在" "test -f prisma/schema.prisma"
test_command "prisma/seed.ts 存在" "test -f prisma/seed.ts"
echo ""

# 6. 检查测试文件
echo "🧪 检查测试文件..."
test_command "tests 目录存在" "test -d tests"
test_command "tests/unit 目录存在" "test -d tests/unit"
echo ""

# 7. 检查文档
echo "📚 检查文档..."
test_command "README.md 存在" "test -f README.md"
test_command "DEVELOPMENT.md 存在" "test -f DEVELOPMENT.md"
test_command "API_TESTING.md 存在" "test -f API_TESTING.md"
echo ""

# 8. TypeScript 编译检查
echo "🔨 检查 TypeScript 编译..."
if npm run build > /dev/null 2>&1; then
  echo -e "编译: ${GREEN}✅ 通过${NC}"
  ((TESTS_PASSED++))
else
  echo -e "编译: ${RED}❌ 失败${NC}"
  ((TESTS_FAILED++))
fi
echo ""

# 总结
echo "=========================================="
echo "📊 测试结果"
echo "=========================================="
echo -e "通过: ${GREEN}$TESTS_PASSED${NC}"
echo -e "失败: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ 所有测试通过！${NC}"
  echo ""
  echo "下一步:"
  echo "1. 安装依赖: npm install"
  echo "2. 初始化数据库: npm run db:migrate"
  echo "3. 种子数据: npm run db:seed"
  echo "4. 启动服务: npm run dev"
  exit 0
else
  echo -e "${RED}❌ 有测试失败，请检查上面的错误信息${NC}"
  exit 1
fi


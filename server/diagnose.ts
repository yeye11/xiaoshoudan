/**
 * 服务端诊断脚本
 * 用于检查服务端是否有问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// 测试结果
let passedTests = 0;
let failedTests = 0;

/**
 * 打印标题
 */
function printTitle(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
}

/**
 * 打印测试结果
 */
function printTest(testName: string, passed: boolean, message?: string) {
  const status = passed ? `${colors.green}✅ 通过${colors.reset}` : `${colors.red}❌ 失败${colors.reset}`;
  console.log(`测试: ${testName} ... ${status}`);
  if (message) {
    console.log(`  ${colors.yellow}${message}${colors.reset}`);
  }
  
  if (passed) {
    passedTests++;
  } else {
    failedTests++;
  }
}

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath: string, description: string) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  printTest(`${description} (${filePath})`, exists);
  return exists;
}

/**
 * 检查目录是否存在
 */
function checkDirExists(dirPath: string, description: string) {
  const fullPath = path.join(__dirname, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  printTest(`${description} (${dirPath})`, exists);
  return exists;
}

/**
 * 检查文件内容
 */
function checkFileContent(filePath: string, searchString: string, description: string) {
  const fullPath = path.join(__dirname, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const found = content.includes(searchString);
    printTest(description, found);
    return found;
  } catch (error) {
    printTest(description, false, `无法读取文件: ${error}`);
    return false;
  }
}

/**
 * 主诊断函数
 */
async function diagnose() {
  console.log(`${colors.blue}🧪 Cypridina 服务端诊断工具${colors.reset}`);
  console.log(`${colors.blue}诊断时间: ${new Date().toLocaleString()}${colors.reset}\n`);

  // 1. 检查配置文件
  printTitle('📋 配置文件检查');
  checkFileExists('.env', '环境变量文件');
  checkFileExists('package.json', 'package.json');
  checkFileExists('tsconfig.json', 'TypeScript 配置');
  checkFileExists('jest.config.js', 'Jest 配置');
  checkFileExists('prisma/schema.prisma', 'Prisma Schema');

  // 2. 检查源代码目录
  printTitle('📁 源代码目录检查');
  checkDirExists('src', '源代码目录');
  checkDirExists('src/config', '配置目录');
  checkDirExists('src/controllers', '控制器目录');
  checkDirExists('src/services', '服务目录');
  checkDirExists('src/routes', '路由目录');
  checkDirExists('src/middleware', '中间件目录');
  checkDirExists('src/utils', '工具目录');
  checkDirExists('src/types', '类型目录');

  // 3. 检查关键源文件
  printTitle('📝 关键源文件检查');
  checkFileExists('src/app.ts', '应用入口');
  checkFileExists('src/config/env.ts', '环境变量配置');
  checkFileExists('src/config/database.ts', '数据库配置');
  checkFileExists('src/config/logger.ts', '日志配置');
  checkFileExists('src/utils/errors.ts', '错误处理');
  checkFileExists('src/utils/response.ts', '响应格式');
  checkFileExists('src/middleware/auth.middleware.ts', '认证中间件');

  // 4. 检查路由文件
  printTitle('🛣️  路由文件检查');
  checkFileExists('src/routes/auth.routes.ts', '认证路由');
  checkFileExists('src/routes/sales.routes.ts', '销售单路由');
  checkFileExists('src/routes/customer.routes.ts', '客户路由');
  checkFileExists('src/routes/product.routes.ts', '产品路由');
  checkFileExists('src/routes/inventory.routes.ts', '库存路由');
  checkFileExists('src/routes/report.routes.ts', '报表路由');

  // 5. 检查服务文件
  printTitle('⚙️  服务文件检查');
  checkFileExists('src/services/auth.service.ts', '认证服务');
  checkFileExists('src/services/sales.service.ts', '销售单服务');
  checkFileExists('src/services/customer.service.ts', '客户服务');
  checkFileExists('src/services/product.service.ts', '产品服务');
  checkFileExists('src/services/inventory.service.ts', '库存服务');
  checkFileExists('src/services/report.service.ts', '报表服务');

  // 6. 检查数据库文件
  printTitle('🗄️  数据库文件检查');
  checkFileExists('prisma/schema.prisma', 'Prisma Schema');
  checkFileExists('prisma/seed.ts', '数据库种子');
  checkDirExists('prisma/migrations', '数据库迁移目录');

  // 7. 检查测试文件
  printTitle('🧪 测试文件检查');
  checkDirExists('tests', '测试目录');
  checkDirExists('tests/unit', '单元测试目录');
  checkFileExists('tests/unit/auth.service.test.ts', '认证服务测试');

  // 8. 检查文件内容
  printTitle('📄 文件内容检查');
  checkFileContent('package.json', '"name": "cypridina-server"', 'package.json 名称');
  checkFileContent('package.json', '"express"', 'Express 依赖');
  checkFileContent('package.json', '"@prisma/client"', 'Prisma 依赖');
  checkFileContent('src/app.ts', 'express()', 'Express 应用创建');
  checkFileContent('src/app.ts', 'cors()', 'CORS 中间件');
  checkFileContent('prisma/schema.prisma', 'model Company', 'Company 模型');
  checkFileContent('prisma/schema.prisma', 'model User', 'User 模型');

  // 9. 检查文档
  printTitle('📚 文档检查');
  checkFileExists('README.md', 'README 文档');
  checkFileExists('DEVELOPMENT.md', '开发指南');
  checkFileExists('API_TESTING.md', 'API 测试指南');

  // 10. 总结
  printTitle('📊 诊断结果');
  console.log(`${colors.green}通过: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}失败: ${failedTests}${colors.reset}`);
  console.log('');

  if (failedTests === 0) {
    console.log(`${colors.green}✅ 所有检查通过！${colors.reset}`);
    console.log('\n下一步:');
    console.log('1. npm install - 安装依赖');
    console.log('2. npm run db:migrate - 初始化数据库');
    console.log('3. npm run db:seed - 种子数据');
    console.log('4. npm run dev - 启动服务');
  } else {
    console.log(`${colors.red}❌ 有 ${failedTests} 个检查失败${colors.reset}`);
    console.log('\n请检查上面的错误信息');
  }

  console.log('');
}

// 运行诊断
diagnose().catch(console.error);


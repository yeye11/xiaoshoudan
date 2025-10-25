# 服务端开发指南

## 📋 项目概述

这是 Cypridina 销售管理系统的服务端实现，使用 Node.js + Express + PostgreSQL + Prisma 构建。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接和其他必需的环境变量。

### 3. 初始化数据库

```bash
npm run db:migrate
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 📁 项目结构

```
server/
├── src/
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制层
│   ├── services/         # 业务层
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   └── app.ts            # 应用入口
├── prisma/
│   ├── schema.prisma     # 数据库 schema
│   ├── seed.ts           # 数据库种子
│   └── migrations/       # 数据库迁移
├── tests/                # 测试文件
├── jest.config.js        # Jest 配置
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 开发工作流

### 添加新的 API 端点

1. **创建服务** (`src/services/xxx.service.ts`)
   - 实现业务逻辑
   - 使用 Prisma 进行数据库操作
   - 抛出自定义错误

2. **创建控制器** (`src/controllers/xxx.controller.ts`)
   - 处理请求和响应
   - 调用服务层
   - 使用 `asyncHandler` 包装异步函数

3. **创建路由** (`src/routes/xxx.routes.ts`)
   - 定义 API 端点
   - 添加认证中间件
   - 使用 `asyncHandler` 包装控制器

4. **在 app.ts 中注册路由**
   - 导入路由
   - 使用 `app.use()` 注册

### 错误处理

使用自定义错误类：

```typescript
import { ValidationError, NotFoundError, AuthenticationError } from '@utils/errors';

// 验证错误
throw new ValidationError('验证失败', [{ field: 'email', message: '邮箱格式不正确' }]);

// 资源不存在
throw new NotFoundError('用户不存在');

// 认证错误
throw new AuthenticationError('邮箱或密码错误');
```

### 响应格式

所有 API 响应都使用统一的格式：

```typescript
// 成功响应
res.json(successResponse(data, '操作成功'));

// 分页响应
res.json(successResponse(paginatedResponse(items, total, page, limit), '获取列表成功'));

// 错误响应（由全局错误处理中间件自动处理）
throw new AppError(code, message, statusCode, errors);
```

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 监听模式

```bash
npm run test:watch
```

### 覆盖率报告

```bash
npm run test:coverage
```

## 📝 代码规范

### 命名规范

- 文件名: `kebab-case` (例: `auth.service.ts`)
- 函数名: `camelCase` (例: `getUserById`)
- 常量: `UPPER_SNAKE_CASE` (例: `MAX_LIMIT`)
- 类名: `PascalCase` (例: `ValidationError`)

### 注释规范

所有代码都应该有中文注释：

```typescript
/**
 * 获取用户信息
 */
export const getUser = async (userId: string) => {
  // 查询数据库
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  return user;
};
```

### 日志规范

使用 Winston 记录日志：

```typescript
import { logger } from '@config/logger';

logger.info('用户登录成功', { userId: user.id });
logger.warn('登录失败: 密码错误', { email });
logger.error('数据库连接失败', error);
```

## 🔐 安全性

- 所有密码都使用 bcryptjs 加密
- 所有 API 都使用 JWT 认证
- 使用 Helmet 保护 HTTP 头
- 使用 CORS 限制跨域请求
- 使用 Joi 验证输入数据

## 📊 数据库

### 创建新的迁移

```bash
npm run db:migrate
```

### 查看数据库

```bash
npm run db:studio
```

### 推送 schema 到数据库

```bash
npm run db:push
```

## 🚢 部署

### 构建

```bash
npm run build
```

### 生产环境启动

```bash
npm run start
```

### Docker 部署

```bash
docker build -t cypridina-server .
docker run -p 3000:3000 --env-file .env cypridina-server
```

## 📚 API 文档

详见 [API 接口设计文档](../API接口设计文档.md)

## 🤝 贡献指南

1. 创建新分支
2. 提交更改
3. 创建 Pull Request

## 📞 常见问题

### 如何添加新的数据库表？

1. 在 `prisma/schema.prisma` 中定义表
2. 运行 `npm run db:migrate` 创建迁移
3. 运行 `npm run db:push` 推送到数据库

### 如何修改现有的 API？

1. 修改服务层的业务逻辑
2. 如果需要修改请求/响应格式，更新控制器
3. 如果需要修改路由，更新路由文件
4. 更新 API 文档

### 如何调试？

使用 VS Code 的调试功能：

1. 在代码中设置断点
2. 按 F5 启动调试
3. 使用调试控制台查看变量值

## 📖 参考资源

- [Express.js 文档](https://expressjs.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [JWT 文档](https://jwt.io/)


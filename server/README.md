# Cypridina 销售管理系统 - 服务端

## 📋 项目描述

这是 Cypridina 销售管理系统的服务端实现，使用 Node.js + Express + PostgreSQL + Prisma 构建。

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

### 安装步骤

#### 1. 安装依赖

```bash
cd server
npm install
```

#### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cypridina
```

#### 3. 初始化数据库

创建数据库迁移：

```bash
npm run db:migrate
```

#### 4. 初始化测试数据（可选）

```bash
npm run db:seed
```

### 开发

启动开发服务器：

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 构建

编译 TypeScript：

```bash
npm run build
```

### 生产环境

启动生产服务器：

```bash
npm run start
```

## 📁 项目结构

```
server/
├── src/
│   ├── config/           # 配置文件
│   │   ├── env.ts        # 环境变量
│   │   ├── database.ts   # 数据库配置
│   │   ├── logger.ts     # 日志配置
│   │   └── constants.ts  # 常量定义
│   ├── controllers/      # 控制层
│   ├── services/         # 业务层
│   ├── models/           # 数据模型
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由
│   ├── utils/            # 工具函数
│   │   ├── response.ts   # 响应格式
│   │   ├── errors.ts     # 错误处理
│   │   └── validators.ts # 验证工具
│   ├── types/            # TypeScript 类型
│   └── app.ts            # 应用入口
├── prisma/
│   ├── schema.prisma     # 数据库 schema
│   ├── seed.ts           # 数据库种子
│   └── migrations/       # 数据库迁移
├── tests/                # 测试文件
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## 🔌 API 端点

### 健康检查

```
GET /health
```

### 认证相关（待实现）

```
POST /api/v1/auth/register    # 注册
POST /api/v1/auth/login       # 登录
POST /api/v1/auth/refresh     # 刷新 Token
POST /api/v1/auth/logout      # 登出
```

### 销售单相关（待实现）

```
GET    /api/v1/sales          # 获取销售单列表
POST   /api/v1/sales          # 创建销售单
GET    /api/v1/sales/:id      # 获取销售单详情
PUT    /api/v1/sales/:id      # 更新销售单
DELETE /api/v1/sales/:id      # 删除销售单
```

### 客户相关（待实现）

```
GET    /api/v1/customers      # 获取客户列表
POST   /api/v1/customers      # 创建客户
GET    /api/v1/customers/:id  # 获取客户详情
PUT    /api/v1/customers/:id  # 更新客户
DELETE /api/v1/customers/:id  # 删除客户
```

### 产品相关（待实现）

```
GET    /api/v1/products       # 获取产品列表
POST   /api/v1/products       # 创建产品
GET    /api/v1/products/:id   # 获取产品详情
PUT    /api/v1/products/:id   # 更新产品
DELETE /api/v1/products/:id   # 删除产品
```

## 🗄️ 数据库

### 核心表

- `companies` - 公司表（多租户）
- `users` - 用户表
- `customers` - 客户表
- `products` - 产品表
- `sales_invoices` - 销售单表
- `sales_items` - 销售单明细表
- `inventory` - 库存表
- `inventory_logs` - 库存日志表
- `payments` - 收款记录表
- `audit_logs` - 操作日志表

### 数据库管理

查看数据库：

```bash
npm run db:studio
```

创建新的迁移：

```bash
npm run db:migrate
```

推送 schema 到数据库：

```bash
npm run db:push
```

## 🧪 测试

运行测试：

```bash
npm run test
```

监听模式：

```bash
npm run test:watch
```

覆盖率报告：

```bash
npm run test:coverage
```

## 📝 代码风格

检查代码风格：

```bash
npm run lint
```

格式化代码：

```bash
npm run format
```

## 🔐 安全性

- 使用 Helmet 保护 HTTP 头
- 使用 CORS 限制跨域请求
- 使用 JWT 进行身份验证
- 使用 bcryptjs 加密密码
- 使用 Joi 验证输入数据

## 📊 日志

日志文件位置：

- `logs/error.log` - 错误日志
- `logs/combined.log` - 所有日志

## 🚢 部署

### Docker 部署

构建 Docker 镜像：

```bash
docker build -t cypridina-server .
```

运行容器：

```bash
docker run -p 3000:3000 --env-file .env cypridina-server
```

### 环境变量

生产环境需要配置以下环境变量：

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## 📚 文档

- [API 接口设计文档](../API接口设计文档.md)
- [数据库设计文档](../数据库设计文档.md)
- [服务端架构设计文档](../服务端架构设计文档.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

## 📄 许可证

MIT


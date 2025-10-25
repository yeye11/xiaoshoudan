/**
 * 应用入口文件
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnv } from './config/env';
import { logger } from './config/logger';
import { initializeDatabase, closeDatabase } from './config/database';
import { AppError, isAppError, getErrorMessage, getErrorStatusCode } from './utils/errors';
import { errorResponse } from './utils/response';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import reportRoutes from './routes/report.routes';
import { asyncHandler } from './utils/asyncHandler';

// 验证环境变量
validateEnv();

// 创建 Express 应用
const app: Express = express();

// ============ 中间件 ============

// 安全中间件
app.use(helmet());

// CORS 中间件
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// 请求体解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 请求日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
});

// ============ 路由 ============

// 健康检查路由
app.get('/health', (req: Request, res: Response) => {
  res.json({
    code: 0,
    message: '服务正常运行',
    timestamp: new Date().toISOString(),
  });
});

// API 版本路由
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    code: 0,
    message: 'Cypridina 销售管理系统 API v1',
    version: '0.1.0',
  });
});

// 认证路由
app.use('/api/v1/auth', authRoutes);

// 销售单路由
app.use('/api/v1/sales', salesRoutes);

// 客户路由
app.use('/api/v1/customers', customerRoutes);

// 产品路由
app.use('/api/v1/products', productRoutes);

// 库存路由
app.use('/api/v1/inventory', inventoryRoutes);

// 报表路由
app.use('/api/v1/reports', reportRoutes);

// ============ 错误处理 ============

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json(
    errorResponse(404, `路由不存在: ${req.method} ${req.path}`)
  );
});

// 全局错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('请求处理错误', err);

  if (isAppError(err)) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.errors)
    );
  }

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(
      errorResponse(400, '请求体格式错误')
    );
  }

  // 处理其他错误
  res.status(500).json(
    errorResponse(500, '服务器内部错误')
  );
});

// ============ 服务器启动 ============

/**
 * 启动服务器
 */
const startServer = async (): Promise<void> => {
  try {
    // 初始化数据库
    await initializeDatabase();

    // 启动 HTTP 服务器
    const server = app.listen(env.PORT, () => {
      logger.info(`服务器启动成功`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        apiUrl: env.API_URL,
      });
    });

    // 优雅关闭
    const gracefulShutdown = async (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
      
      server.close(async () => {
        logger.info('HTTP 服务器已关闭');
        await closeDatabase();
        logger.info('数据库连接已关闭');
        process.exit(0);
      });

      // 如果 30 秒后还没关闭，强制退出
      setTimeout(() => {
        logger.error('无法优雅关闭，强制退出');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('服务器启动失败', error);
    process.exit(1);
  }
};

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  startServer();
}

export default app;


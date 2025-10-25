/**
 * 数据库配置
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// 创建 Prisma 客户端实例
let prisma: PrismaClient;

/**
 * 获取 Prisma 客户端实例
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // 注意: Prisma 的事件监听需要在 schema 中启用 query 日志
    // 这里暂时注释掉，因为 Prisma 5.x 的 $on 方法有限制
  }

  return prisma;
};

/**
 * 初始化数据库连接
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败', error);
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
export const closeDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('数据库连接已关闭');
  }
};

/**
 * 导出 Prisma 客户端
 */
export const db = getPrismaClient();


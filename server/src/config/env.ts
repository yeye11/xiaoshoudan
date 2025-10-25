/**
 * 环境变量配置
 */

import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

export const env = {
  // 服务器配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  JWT_REFRESH_EXPIRES_IN: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),

  // 日志配置
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  // CORS 配置
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],

  // 文件上传配置
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  // 邮件配置
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
} as const;

/**
 * 验证必需的环境变量
 */
export const validateEnv = (): void => {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missingEnvVars.join(', ')}`
    );
  }
};

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return env.NODE_ENV === 'production';
};

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return env.NODE_ENV === 'development';
};

/**
 * 检查是否为测试环境
 */
export const isTest = (): boolean => {
  return env.NODE_ENV === 'test';
};


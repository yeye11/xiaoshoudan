/**
 * 认证服务
 */

import bcryptjs from 'bcryptjs';
import { db } from '../config/database';
import { logger } from '../config/logger';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { validateWithJoi, registerSchema, loginSchema } from '../utils/validators';
import { AuthUser, LoginResponse, RefreshTokenResponse } from '../types/index';

/**
 * 用户注册
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  companyName?: string
): Promise<LoginResponse> => {
  // 验证输入
  const validatedData = await validateWithJoi(
    { email, password, name, company: companyName },
    registerSchema
  );

  // 检查邮箱是否已存在
  const existingUser = await db.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    logger.warn('用户注册失败: 邮箱已存在', { email: validatedData.email });
    throw new ConflictError('邮箱已被注册');
  }

  try {
    // 创建公司
    const company = await db.company.create({
      data: {
        name: validatedData.company || `${validatedData.name}的公司`,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天试用
      },
    });

    // 加密密码
    const passwordHash = await bcryptjs.hash(validatedData.password, 10);

    // 创建用户
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        companyId: company.id,
        role: 'admin', // 第一个用户是管理员
        status: 'active',
      },
    });

    logger.info('用户注册成功', { userId: user.id, email: user.email });

    // 生成 Token
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };

    const token = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
      refreshToken,
      expiresIn: 3600,
    };
  } catch (error) {
    logger.error('用户注册失败', error);
    throw error;
  }
};

/**
 * 用户登录
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // 验证输入
  const validatedData = await validateWithJoi(
    { email, password },
    loginSchema
  );

  // 查找用户
  const user = await db.user.findUnique({
    where: { email: validatedData.email },
  });

  if (!user) {
    logger.warn('登录失败: 用户不存在', { email: validatedData.email });
    throw new AuthenticationError('邮箱或密码错误');
  }

  // 检查用户状态
  if (user.status !== 'active') {
    logger.warn('登录失败: 用户已被禁用', { userId: user.id });
    throw new AuthenticationError('用户已被禁用');
  }

  // 验证密码
  const isPasswordValid = await bcryptjs.compare(
    validatedData.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    logger.warn('登录失败: 密码错误', { email: validatedData.email });
    throw new AuthenticationError('邮箱或密码错误');
  }

  // 更新最后登录时间
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info('用户登录成功', { userId: user.id, email: user.email });

  // 生成 Token
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  };

  const token = generateAccessToken(authUser);
  const refreshToken = generateRefreshToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
    refreshToken,
    expiresIn: 3600,
  };
};

/**
 * 刷新 Token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  // 验证刷新 Token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    logger.warn('Token 刷新失败: 刷新 Token 无效');
    throw new AuthenticationError('刷新 Token 无效或已过期');
  }

  // 查找用户
  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.status !== 'active') {
    logger.warn('Token 刷新失败: 用户不存在或已被禁用', { userId: decoded.userId });
    throw new AuthenticationError('用户不存在或已被禁用');
  }

  logger.info('Token 刷新成功', { userId: user.id });

  // 生成新的访问 Token
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  };

  const token = generateAccessToken(authUser);

  return {
    token,
    expiresIn: 3600,
  };
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (userId: string): Promise<AuthUser> => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  };
};


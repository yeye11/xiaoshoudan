/**
 * JWT 工具函数
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types/index';

/**
 * 生成访问 Token
 */
export const generateAccessToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};

/**
 * 生成刷新 Token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

/**
 * 验证访问 Token
 */
export const verifyAccessToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * 验证刷新 Token
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * 从 Token 中提取用户信息
 */
export const extractUserFromToken = (token: string): AuthUser | null => {
  return verifyAccessToken(token);
};

/**
 * 获取 Token 过期时间
 */
export const getTokenExpiresIn = (): number => {
  return env.JWT_EXPIRES_IN;
};


/**
 * 认证中间件
 */

import { Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest, AuthUser } from '../types/index';
import { USER_ROLES } from '../config/constants';

/**
 * 验证 Token 中间件
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从请求头获取 Token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      logger.warn('认证失败: 缺少 Token', { path: req.path });
      throw new AuthenticationError('缺少认证 Token');
    }

    // 验证 Token
    const user = verifyAccessToken(token);

    if (!user) {
      logger.warn('认证失败: Token 无效或已过期', { path: req.path });
      throw new AuthenticationError('Token 无效或已过期');
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.companyId = user.companyId;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    logger.error('认证中间件错误', error);
    throw new AuthenticationError('认证失败');
  }
};

/**
 * 检查用户角色中间件
 */
export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('角色检查失败: 用户未认证', { path: req.path });
      throw new AuthenticationError('用户未认证');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('角色检查失败: 权限不足', {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
        path: req.path,
      });
      throw new AuthorizationError('权限不足');
    }

    next();
  };
};

/**
 * 检查管理员权限中间件
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    logger.warn('管理员检查失败: 用户未认证', { path: req.path });
    throw new AuthenticationError('用户未认证');
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    logger.warn('管理员检查失败: 权限不足', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
    });
    throw new AuthorizationError('需要管理员权限');
  }

  next();
};

/**
 * 检查经理权限中间件
 */
export const requireManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    logger.warn('经理检查失败: 用户未认证', { path: req.path });
    throw new AuthenticationError('用户未认证');
  }

  if (![USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(req.user.role as any)) {
    logger.warn('经理检查失败: 权限不足', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
    });
    throw new AuthorizationError('需要经理或管理员权限');
  }

  next();
};

/**
 * 可选的认证中间件（不强制要求 Token）
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const user = verifyAccessToken(token);
      if (user) {
        req.user = user;
        req.companyId = user.companyId;
      }
    }

    next();
  } catch (error) {
    logger.debug('可选认证中间件错误', error);
    next();
  }
};


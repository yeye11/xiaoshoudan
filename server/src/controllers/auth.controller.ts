/**
 * 认证控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse } from '../utils/response';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
} from '../services/auth.service';
import { AuthRequest } from '../types/index';

/**
 * 用户注册
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name, company } = req.body;

    logger.info('处理注册请求', { email, name });

    const result = await registerUser(email, password, name, company);

    res.status(201).json(successResponse(result, '注册成功'));
  } catch (error) {
    logger.error('注册处理失败', error);
    throw error;
  }
};

/**
 * 用户登录
 */
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.info('处理登录请求', { email });

    const result = await loginUser(email, password);

    res.json(successResponse(result, '登录成功'));
  } catch (error) {
    logger.error('登录处理失败', error);
    throw error;
  }
};

/**
 * 刷新 Token
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error('缺少刷新 Token');
    }

    logger.info('处理 Token 刷新请求');

    const result = await refreshAccessToken(refreshToken);

    res.json(successResponse(result, 'Token 刷新成功'));
  } catch (error) {
    logger.error('Token 刷新处理失败', error);
    throw error;
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUserInfo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('用户未认证');
    }

    logger.info('处理获取当前用户信息请求', { userId: req.user.id });

    const user = await getCurrentUser(req.user.id);

    res.json(successResponse(user, '获取用户信息成功'));
  } catch (error) {
    logger.error('获取用户信息处理失败', error);
    throw error;
  }
};

/**
 * 用户登出
 */
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('用户未认证');
    }

    logger.info('处理登出请求', { userId: req.user.id });

    // 这里可以添加额外的登出逻辑，比如将 Token 加入黑名单
    // 目前只是返回成功响应

    res.json(successResponse(null, '登出成功'));
  } catch (error) {
    logger.error('登出处理失败', error);
    throw error;
  }
};


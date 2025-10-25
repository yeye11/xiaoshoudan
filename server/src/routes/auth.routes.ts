/**
 * 认证路由
 */

import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getCurrentUserInfo,
  logout,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * 注册
 * POST /api/v1/auth/register
 */
router.post('/register', asyncHandler(register));

/**
 * 登录
 * POST /api/v1/auth/login
 */
router.post('/login', asyncHandler(login));

/**
 * 刷新 Token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 */
router.get('/me', authenticateToken, asyncHandler(getCurrentUserInfo));

/**
 * 登出
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticateToken, asyncHandler(logout));

export default router;


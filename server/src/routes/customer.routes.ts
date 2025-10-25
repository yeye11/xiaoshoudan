/**
 * 客户路由
 */

import { Router } from 'express';
import {
  create,
  list,
  getById,
  update,
  remove,
  getStats,
} from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// 所有客户路由都需要认证
router.use(authenticateToken);

/**
 * 创建客户
 * POST /api/v1/customers
 */
router.post('/', asyncHandler(create));

/**
 * 获取客户列表
 * GET /api/v1/customers
 */
router.get('/', asyncHandler(list));

/**
 * 获取客户详情
 * GET /api/v1/customers/:id
 */
router.get('/:id', asyncHandler(getById));

/**
 * 更新客户
 * PUT /api/v1/customers/:id
 */
router.put('/:id', asyncHandler(update));

/**
 * 删除客户
 * DELETE /api/v1/customers/:id
 */
router.delete('/:id', asyncHandler(remove));

/**
 * 获取客户统计信息
 * GET /api/v1/customers/:id/stats
 */
router.get('/:id/stats', asyncHandler(getStats));

export default router;


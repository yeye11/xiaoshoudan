/**
 * 销售单路由
 */

import { Router } from 'express';
import {
  create,
  list,
  getById,
  update,
  remove,
  submit,
} from '../controllers/sales.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// 所有销售单路由都需要认证
router.use(authenticateToken);

/**
 * 创建销售单
 * POST /api/v1/sales
 */
router.post('/', asyncHandler(create));

/**
 * 获取销售单列表
 * GET /api/v1/sales
 */
router.get('/', asyncHandler(list));

/**
 * 获取销售单详情
 * GET /api/v1/sales/:id
 */
router.get('/:id', asyncHandler(getById));

/**
 * 更新销售单
 * PUT /api/v1/sales/:id
 */
router.put('/:id', asyncHandler(update));

/**
 * 删除销售单
 * DELETE /api/v1/sales/:id
 */
router.delete('/:id', asyncHandler(remove));

/**
 * 提交销售单
 * POST /api/v1/sales/:id/submit
 */
router.post('/:id/submit', asyncHandler(submit));

export default router;


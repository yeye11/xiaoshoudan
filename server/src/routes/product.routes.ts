/**
 * 产品路由
 */

import { Router } from 'express';
import {
  create,
  list,
  getById,
  update,
  remove,
  getInventory,
  getStats,
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// 所有产品路由都需要认证
router.use(authenticateToken);

/**
 * 创建产品
 * POST /api/v1/products
 */
router.post('/', asyncHandler(create));

/**
 * 获取产品列表
 * GET /api/v1/products
 */
router.get('/', asyncHandler(list));

/**
 * 获取产品详情
 * GET /api/v1/products/:id
 */
router.get('/:id', asyncHandler(getById));

/**
 * 更新产品
 * PUT /api/v1/products/:id
 */
router.put('/:id', asyncHandler(update));

/**
 * 删除产品
 * DELETE /api/v1/products/:id
 */
router.delete('/:id', asyncHandler(remove));

/**
 * 获取产品库存
 * GET /api/v1/products/:id/inventory
 */
router.get('/:id/inventory', asyncHandler(getInventory));

/**
 * 获取产品统计信息
 * GET /api/v1/products/:id/stats
 */
router.get('/:id/stats', asyncHandler(getStats));

export default router;


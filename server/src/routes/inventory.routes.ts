/**
 * 库存路由
 */

import { Router } from 'express';
import {
  get,
  list,
  adjust,
  getLogs,
  setWarning,
  getLowStock,
} from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// 所有库存路由都需要认证
router.use(authenticateToken);

/**
 * 获取所有库存
 * GET /api/v1/inventory
 */
router.get('/', asyncHandler(list));

/**
 * 获取库存
 * GET /api/v1/inventory/:productId
 */
router.get('/:productId', asyncHandler(get));

/**
 * 调整库存
 * POST /api/v1/inventory/:productId/adjust
 */
router.post('/:productId/adjust', asyncHandler(adjust));

/**
 * 设置库存预警级别
 * PUT /api/v1/inventory/:productId/warning
 */
router.put('/:productId/warning', asyncHandler(setWarning));

/**
 * 获取库存日志
 * GET /api/v1/inventory/logs
 */
router.get('/logs', asyncHandler(getLogs));

/**
 * 获取低库存产品
 * GET /api/v1/inventory/low-stock
 */
router.get('/low-stock', asyncHandler(getLowStock));

export default router;


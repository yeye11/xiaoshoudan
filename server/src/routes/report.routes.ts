/**
 * 报表路由
 */

import { Router } from 'express';
import {
  getSales,
  getCustomers,
  getProducts,
  getDashboard,
} from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// 所有报表路由都需要认证
router.use(authenticateToken);

/**
 * 获取销售报表
 * GET /api/v1/reports/sales?startDate=2025-01-01&endDate=2025-01-31
 */
router.get('/sales', asyncHandler(getSales));

/**
 * 获取客户分析
 * GET /api/v1/reports/customers
 */
router.get('/customers', asyncHandler(getCustomers));

/**
 * 获取产品分析
 * GET /api/v1/reports/products
 */
router.get('/products', asyncHandler(getProducts));

/**
 * 获取仪表板数据
 * GET /api/v1/reports/dashboard
 */
router.get('/dashboard', asyncHandler(getDashboard));

export default router;


/**
 * 库存控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse } from '../utils/response';
import {
  getInventory,
  getAllInventories,
  adjustInventory,
  getInventoryLogs,
  setWarningLevel,
  getLowStockProducts,
} from '../services/inventory.service';
import { AuthRequest } from '../types/index';

/**
 * 获取库存
 */
export const get = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取库存请求', { productId });

    const inventory = await getInventory(req.companyId, productId);

    res.json(successResponse(inventory, '获取库存成功'));
  } catch (error) {
    logger.error('获取库存失败', error);
    throw error;
  }
};

/**
 * 获取所有库存
 */
export const list = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取库存列表请求');

    const result = await getAllInventories(req.companyId, req.query as any);

    res.json(successResponse(result, '获取库存列表成功'));
  } catch (error) {
    logger.error('获取库存列表失败', error);
    throw error;
  }
};

/**
 * 调整库存
 */
export const adjust = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { type, quantity, reason } = req.body;

    if (!req.user || !req.companyId) {
      throw new Error('用户未认证');
    }

    logger.info('处理调整库存请求', { productId, type, quantity });

    const inventory = await adjustInventory(
      req.companyId,
      productId,
      req.user.id,
      type,
      quantity,
      reason
    );

    res.json(successResponse(inventory, '库存调整成功'));
  } catch (error) {
    logger.error('调整库存失败', error);
    throw error;
  }
};

/**
 * 获取库存日志
 */
export const getLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取库存日志请求');

    const result = await getInventoryLogs(req.companyId, req.query as any);

    res.json(successResponse(result, '获取库存日志成功'));
  } catch (error) {
    logger.error('获取库存日志失败', error);
    throw error;
  }
};

/**
 * 设置库存预警级别
 */
export const setWarning = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { warningLevel } = req.body;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理设置库存预警级别请求', { productId, warningLevel });

    const inventory = await setWarningLevel(req.companyId, productId, warningLevel);

    res.json(successResponse(inventory, '库存预警级别设置成功'));
  } catch (error) {
    logger.error('设置库存预警级别失败', error);
    throw error;
  }
};

/**
 * 获取低库存产品
 */
export const getLowStock = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取低库存产品请求');

    const items = await getLowStockProducts(req.companyId);

    res.json(successResponse(items, '获取低库存产品成功'));
  } catch (error) {
    logger.error('获取低库存产品失败', error);
    throw error;
  }
};


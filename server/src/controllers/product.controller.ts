/**
 * 产品控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductInventory,
  getProductStats,
} from '../services/product.service';
import { AuthRequest } from '../types/index';

/**
 * 创建产品
 */
export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, sku, category, unit, unitPrice, costPrice, specs, description } = req.body;

    if (!req.user || !req.companyId) {
      throw new Error('用户未认证');
    }

    logger.info('处理创建产品请求', { sku });

    const product = await createProduct(req.companyId, req.user.id, {
      name,
      sku,
      category,
      unit,
      unitPrice,
      costPrice,
      specs,
      description,
    });

    res.status(201).json(successResponse(product, '产品创建成功'));
  } catch (error) {
    logger.error('创建产品失败', error);
    throw error;
  }
};

/**
 * 获取产品列表
 */
export const list = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取产品列表请求');

    const result = await getProducts(req.companyId, req.query as any);

    res.json(
      successResponse(
        paginatedResponse(result.items, result.total, result.page, result.limit),
        '获取产品列表成功'
      )
    );
  } catch (error) {
    logger.error('获取产品列表失败', error);
    throw error;
  }
};

/**
 * 获取产品详情
 */
export const getById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取产品详情请求', { productId: id });

    const product = await getProductById(req.companyId, id);

    res.json(successResponse(product, '获取产品详情成功'));
  } catch (error) {
    logger.error('获取产品详情失败', error);
    throw error;
  }
};

/**
 * 更新产品
 */
export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, unit, unitPrice, costPrice, specs, description } = req.body;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理更新产品请求', { productId: id });

    const product = await updateProduct(req.companyId, id, {
      name,
      category,
      unit,
      unitPrice,
      costPrice,
      specs,
      description,
    });

    res.json(successResponse(product, '产品更新成功'));
  } catch (error) {
    logger.error('更新产品失败', error);
    throw error;
  }
};

/**
 * 删除产品
 */
export const remove = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理删除产品请求', { productId: id });

    await deleteProduct(req.companyId, id);

    res.json(successResponse(null, '产品删除成功'));
  } catch (error) {
    logger.error('删除产品失败', error);
    throw error;
  }
};

/**
 * 获取产品库存
 */
export const getInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取产品库存请求', { productId: id });

    const inventory = await getProductInventory(req.companyId, id);

    res.json(successResponse(inventory, '获取产品库存成功'));
  } catch (error) {
    logger.error('获取产品库存失败', error);
    throw error;
  }
};

/**
 * 获取产品统计信息
 */
export const getStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取产品统计请求', { productId: id });

    const stats = await getProductStats(req.companyId, id);

    res.json(successResponse(stats, '获取产品统计成功'));
  } catch (error) {
    logger.error('获取产品统计失败', error);
    throw error;
  }
};


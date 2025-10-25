/**
 * 客户控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from '../services/customer.service';
import { AuthRequest } from '../types/index';

/**
 * 创建客户
 */
export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, phone, email, category, creditLimit, address, remark } = req.body;

    if (!req.user || !req.companyId) {
      throw new Error('用户未认证');
    }

    logger.info('处理创建客户请求', { name });

    const customer = await createCustomer(req.companyId, req.user.id, {
      name,
      phone,
      email,
      category,
      creditLimit,
      address,
      remark,
    });

    res.status(201).json(successResponse(customer, '客户创建成功'));
  } catch (error) {
    logger.error('创建客户失败', error);
    throw error;
  }
};

/**
 * 获取客户列表
 */
export const list = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取客户列表请求');

    const result = await getCustomers(req.companyId, req.query as any);

    res.json(
      successResponse(
        paginatedResponse(result.items, result.total, result.page, result.limit),
        '获取客户列表成功'
      )
    );
  } catch (error) {
    logger.error('获取客户列表失败', error);
    throw error;
  }
};

/**
 * 获取客户详情
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

    logger.info('处理获取客户详情请求', { customerId: id });

    const customer = await getCustomerById(req.companyId, id);

    res.json(successResponse(customer, '获取客户详情成功'));
  } catch (error) {
    logger.error('获取客户详情失败', error);
    throw error;
  }
};

/**
 * 更新客户
 */
export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, email, category, creditLimit, address, remark } = req.body;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理更新客户请求', { customerId: id });

    const customer = await updateCustomer(req.companyId, id, {
      name,
      phone,
      email,
      category,
      creditLimit,
      address,
      remark,
    });

    res.json(successResponse(customer, '客户更新成功'));
  } catch (error) {
    logger.error('更新客户失败', error);
    throw error;
  }
};

/**
 * 删除客户
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

    logger.info('处理删除客户请求', { customerId: id });

    await deleteCustomer(req.companyId, id);

    res.json(successResponse(null, '客户删除成功'));
  } catch (error) {
    logger.error('删除客户失败', error);
    throw error;
  }
};

/**
 * 获取客户统计信息
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

    logger.info('处理获取客户统计请求', { customerId: id });

    const stats = await getCustomerStats(req.companyId, id);

    res.json(successResponse(stats, '获取客户统计成功'));
  } catch (error) {
    logger.error('获取客户统计失败', error);
    throw error;
  }
};


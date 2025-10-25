/**
 * 销售单控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  createSalesInvoice,
  getSalesInvoices,
  getSalesInvoiceById,
  updateSalesInvoice,
  deleteSalesInvoice,
  submitSalesInvoice,
} from '../services/sales.service';
import { AuthRequest } from '../types/index';

/**
 * 创建销售单
 */
export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { customerId, invoiceDate, items, notes } = req.body;

    if (!req.user || !req.companyId) {
      throw new Error('用户未认证');
    }

    logger.info('处理创建销售单请求', { customerId });

    const invoice = await createSalesInvoice(
      req.companyId,
      customerId,
      req.user.id,
      new Date(invoiceDate),
      items,
      notes
    );

    res.status(201).json(successResponse(invoice, '销售单创建成功'));
  } catch (error) {
    logger.error('创建销售单失败', error);
    throw error;
  }
};

/**
 * 获取销售单列表
 */
export const list = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取销售单列表请求');

    const result = await getSalesInvoices(req.companyId, req.query as any);

    res.json(
      successResponse(
        paginatedResponse(result.items, result.total, result.page, result.limit),
        '获取销售单列表成功'
      )
    );
  } catch (error) {
    logger.error('获取销售单列表失败', error);
    throw error;
  }
};

/**
 * 获取销售单详情
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

    logger.info('处理获取销售单详情请求', { invoiceId: id });

    const invoice = await getSalesInvoiceById(req.companyId, id);

    res.json(successResponse(invoice, '获取销售单详情成功'));
  } catch (error) {
    logger.error('获取销售单详情失败', error);
    throw error;
  }
};

/**
 * 更新销售单
 */
export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { customerId, invoiceDate, notes } = req.body;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理更新销售单请求', { invoiceId: id });

    const invoice = await updateSalesInvoice(req.companyId, id, {
      customerId,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
      notes,
    });

    res.json(successResponse(invoice, '销售单更新成功'));
  } catch (error) {
    logger.error('更新销售单失败', error);
    throw error;
  }
};

/**
 * 删除销售单
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

    logger.info('处理删除销售单请求', { invoiceId: id });

    await deleteSalesInvoice(req.companyId, id);

    res.json(successResponse(null, '销售单删除成功'));
  } catch (error) {
    logger.error('删除销售单失败', error);
    throw error;
  }
};

/**
 * 提交销售单
 */
export const submit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理提交销售单请求', { invoiceId: id });

    const invoice = await submitSalesInvoice(req.companyId, id);

    res.json(successResponse(invoice, '销售单提交成功'));
  } catch (error) {
    logger.error('提交销售单失败', error);
    throw error;
  }
};


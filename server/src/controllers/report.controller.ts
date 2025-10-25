/**
 * 报表控制器
 */

import { Response } from 'express';
import { logger } from '../config/logger';
import { successResponse } from '../utils/response';
import {
  getSalesReport,
  getCustomerAnalysis,
  getProductAnalysis,
  getDashboardData,
} from '../services/report.service';
import { AuthRequest } from '../types/index';

/**
 * 获取销售报表
 */
export const getSales = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    if (!startDate || !endDate) {
      throw new Error('缺少开始日期或结束日期');
    }

    logger.info('处理获取销售报表请求', { startDate, endDate });

    const report = await getSalesReport(
      req.companyId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(successResponse(report, '获取销售报表成功'));
  } catch (error) {
    logger.error('获取销售报表失败', error);
    throw error;
  }
};

/**
 * 获取客户分析
 */
export const getCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取客户分析请求');

    const analysis = await getCustomerAnalysis(req.companyId);

    res.json(successResponse(analysis, '获取客户分析成功'));
  } catch (error) {
    logger.error('获取客户分析失败', error);
    throw error;
  }
};

/**
 * 获取产品分析
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取产品分析请求');

    const analysis = await getProductAnalysis(req.companyId);

    res.json(successResponse(analysis, '获取产品分析成功'));
  } catch (error) {
    logger.error('获取产品分析失败', error);
    throw error;
  }
};

/**
 * 获取仪表板数据
 */
export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.companyId) {
      throw new Error('公司 ID 缺失');
    }

    logger.info('处理获取仪表板数据请求');

    const data = await getDashboardData(req.companyId);

    res.json(successResponse(data, '获取仪表板数据成功'));
  } catch (error) {
    logger.error('获取仪表板数据失败', error);
    throw error;
  }
};


/**
 * 客户服务
 */

import { db } from '../config/database';
import { logger } from '../config/logger';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PaginatedResult, QueryOptions } from '../types/index';
import { PAGINATION } from '../config/constants';

/**
 * 创建客户
 */
export const createCustomer = async (
  companyId: string,
  userId: string,
  data: {
    name: string;
    phone?: string;
    email?: string;
    category?: string;
    creditLimit?: number;
    address?: string;
    remark?: string;
  }
) => {
  // 检查客户名称是否已存在
  const existing = await db.customer.findFirst({
    where: {
      companyId,
      name: data.name,
      deletedAt: null,
    },
  });

  if (existing) {
    throw new ConflictError('客户名称已存在');
  }

  const customer = await db.customer.create({
    data: {
      companyId,
      createdBy: userId,
      ...data,
    },
  });

  logger.info('客户创建成功', { customerId: customer.id, name: customer.name });

  return customer;
};

/**
 * 获取客户列表
 */
export const getCustomers = async (
  companyId: string,
  options: QueryOptions
): Promise<PaginatedResult<any>> => {
  const page = options.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  // 构建查询条件
  const where: any = {
    companyId,
    deletedAt: null,
  };

  if (options.search) {
    where.OR = [
      { name: { contains: options.search } },
      { phone: { contains: options.search } },
      { email: { contains: options.search } },
    ];
  }

  if (options.category) {
    where.category = options.category;
  }

  if (options.status) {
    where.status = options.status;
  }

  // 获取总数
  const total = await db.customer.count({ where });

  // 获取数据
  const items = await db.customer.findMany({
    where,
    orderBy: {
      createdAt: options.sortOrder === 'asc' ? 'asc' : 'desc',
    },
    skip,
    take: limit,
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * 获取客户详情
 */
export const getCustomerById = async (
  companyId: string,
  customerId: string
) => {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { deletedAt: null },
        orderBy: { invoiceDate: 'desc' },
        take: 10,
      },
    },
  });

  if (!customer || customer.companyId !== companyId || customer.deletedAt) {
    throw new NotFoundError('客户不存在');
  }

  return customer;
};

/**
 * 更新客户
 */
export const updateCustomer = async (
  companyId: string,
  customerId: string,
  data: any
) => {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.companyId !== companyId || customer.deletedAt) {
    throw new NotFoundError('客户不存在');
  }

  const updated = await db.customer.update({
    where: { id: customerId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  logger.info('客户更新成功', { customerId });

  return updated;
};

/**
 * 删除客户（软删除）
 */
export const deleteCustomer = async (
  companyId: string,
  customerId: string
) => {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.companyId !== companyId || customer.deletedAt) {
    throw new NotFoundError('客户不存在');
  }

  await db.customer.update({
    where: { id: customerId },
    data: {
      deletedAt: new Date(),
    },
  });

  logger.info('客户删除成功', { customerId });
};

/**
 * 获取客户销售统计
 */
export const getCustomerStats = async (
  companyId: string,
  customerId: string
) => {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.companyId !== companyId || customer.deletedAt) {
    throw new NotFoundError('客户不存在');
  }

  // 获取销售单统计
  const invoices = await db.salesInvoice.findMany({
    where: {
      companyId,
      customerId,
      deletedAt: null,
    },
  });

  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.finalAmount), 0);
  const totalInvoices = invoices.length;
  const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

  return {
    customerId,
    totalSales,
    totalInvoices,
    averageOrderValue,
    creditLimit: customer.creditLimit,
    creditUsed: customer.creditUsed,
    creditAvailable: Number(customer.creditLimit) - Number(customer.creditUsed),
  };
};


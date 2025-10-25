/**
 * 销售单服务
 */

import { db } from '../config/database';
import { logger } from '../config/logger';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PaginatedResult, QueryOptions } from '../types/index';
import { PAGINATION } from '../config/constants';

/**
 * 创建销售单
 */
export const createSalesInvoice = async (
  companyId: string,
  customerId: string,
  userId: string,
  invoiceDate: Date,
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountRate?: number;
  }>,
  notes?: string
) => {
  // 验证客户是否存在
  const customer = await db.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.companyId !== companyId) {
    throw new NotFoundError('客户不存在');
  }

  // 验证产品并计算总金额
  let totalAmount = 0;
  const salesItems = [];

  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || product.companyId !== companyId) {
      throw new NotFoundError(`产品不存在: ${item.productId}`);
    }

    const lineAmount = item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100);
    totalAmount += lineAmount;

    salesItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: item.discountRate || 0,
      lineAmount,
    });
  }

  // 生成销售单号
  const invoiceNo = `INV-${Date.now()}`;

  // 创建销售单
  const invoice = await db.salesInvoice.create({
    data: {
      companyId,
      invoiceNo,
      customerId,
      userId,
      invoiceDate,
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      status: 'draft',
      paymentStatus: 'unpaid',
      notes,
      items: {
        create: salesItems,
      },
    },
    include: {
      items: true,
      customer: true,
    },
  });

  logger.info('销售单创建成功', { invoiceId: invoice.id, invoiceNo });

  return invoice;
};

/**
 * 获取销售单列表
 */
export const getSalesInvoices = async (
  companyId: string,
  options: QueryOptions
): Promise<PaginatedResult<any>> => {
  const page = options.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  // 构建查询条件
  const where: any = { companyId };

  if (options.search) {
    where.OR = [
      { invoiceNo: { contains: options.search } },
      { customer: { name: { contains: options.search } } },
    ];
  }

  if (options.status) {
    where.status = options.status;
  }

  if (options.customerId) {
    where.customerId = options.customerId;
  }

  // 获取总数
  const total = await db.salesInvoice.count({ where });

  // 获取数据
  const items = await db.salesInvoice.findMany({
    where,
    include: {
      customer: true,
      items: true,
    },
    orderBy: {
      invoiceDate: options.sortOrder === 'asc' ? 'asc' : 'desc',
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
 * 获取销售单详情
 */
export const getSalesInvoiceById = async (
  companyId: string,
  invoiceId: string
) => {
  const invoice = await db.salesInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  if (!invoice || invoice.companyId !== companyId) {
    throw new NotFoundError('销售单不存在');
  }

  return invoice;
};

/**
 * 更新销售单
 */
export const updateSalesInvoice = async (
  companyId: string,
  invoiceId: string,
  data: any
) => {
  const invoice = await db.salesInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice || invoice.companyId !== companyId) {
    throw new NotFoundError('销售单不存在');
  }

  if (invoice.status !== 'draft') {
    throw new ValidationError('只能编辑草稿状态的销售单');
  }

  const updated = await db.salesInvoice.update({
    where: { id: invoiceId },
    data,
    include: {
      customer: true,
      items: true,
    },
  });

  logger.info('销售单更新成功', { invoiceId });

  return updated;
};

/**
 * 删除销售单
 */
export const deleteSalesInvoice = async (
  companyId: string,
  invoiceId: string
) => {
  const invoice = await db.salesInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice || invoice.companyId !== companyId) {
    throw new NotFoundError('销售单不存在');
  }

  if (invoice.status !== 'draft') {
    throw new ValidationError('只能删除草稿状态的销售单');
  }

  await db.salesInvoice.delete({
    where: { id: invoiceId },
  });

  logger.info('销售单删除成功', { invoiceId });
};

/**
 * 提交销售单
 */
export const submitSalesInvoice = async (
  companyId: string,
  invoiceId: string
) => {
  const invoice = await db.salesInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice || invoice.companyId !== companyId) {
    throw new NotFoundError('销售单不存在');
  }

  if (invoice.status !== 'draft') {
    throw new ValidationError('只能提交草稿状态的销售单');
  }

  const updated = await db.salesInvoice.update({
    where: { id: invoiceId },
    data: { status: 'submitted' },
    include: {
      customer: true,
      items: true,
    },
  });

  logger.info('销售单提交成功', { invoiceId });

  return updated;
};


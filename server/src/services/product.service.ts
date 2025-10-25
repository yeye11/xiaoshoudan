/**
 * 产品服务
 */

import { db } from '../config/database';
import { logger } from '../config/logger';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PaginatedResult, QueryOptions } from '../types/index';
import { PAGINATION } from '../config/constants';

/**
 * 创建产品
 */
export const createProduct = async (
  companyId: string,
  userId: string,
  data: {
    name: string;
    sku: string;
    category?: string;
    unit?: string;
    unitPrice: number;
    costPrice?: number;
    specs?: string;
    description?: string;
  }
) => {
  // 检查 SKU 是否已存在
  const existing = await db.product.findFirst({
    where: {
      companyId,
      sku: data.sku,
      deletedAt: null,
    },
  });

  if (existing) {
    throw new ConflictError('产品 SKU 已存在');
  }

  const product = await db.product.create({
    data: {
      companyId,
      createdBy: userId,
      ...data,
    },
  });

  // 创建库存记录
  await db.inventory.create({
    data: {
      companyId,
      productId: product.id,
      quantity: 0,
      reserved: 0,
      warningLevel: 0,
    },
  });

  logger.info('产品创建成功', { productId: product.id, sku: product.sku });

  return product;
};

/**
 * 获取产品列表
 */
export const getProducts = async (
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
      { sku: { contains: options.search } },
    ];
  }

  if (options.category) {
    where.category = options.category;
  }

  if (options.status) {
    where.status = options.status;
  }

  // 获取总数
  const total = await db.product.count({ where });

  // 获取数据
  const items = await db.product.findMany({
    where,
    include: {
      inventory: true,
    },
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
 * 获取产品详情
 */
export const getProductById = async (
  companyId: string,
  productId: string
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      inventory: true,
    },
  });

  if (!product || product.companyId !== companyId || product.deletedAt) {
    throw new NotFoundError('产品不存在');
  }

  return product;
};

/**
 * 更新产品
 */
export const updateProduct = async (
  companyId: string,
  productId: string,
  data: any
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.companyId !== companyId || product.deletedAt) {
    throw new NotFoundError('产品不存在');
  }

  const updated = await db.product.update({
    where: { id: productId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      inventory: true,
    },
  });

  logger.info('产品更新成功', { productId });

  return updated;
};

/**
 * 删除产品（软删除）
 */
export const deleteProduct = async (
  companyId: string,
  productId: string
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.companyId !== companyId || product.deletedAt) {
    throw new NotFoundError('产品不存在');
  }

  await db.product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
    },
  });

  logger.info('产品删除成功', { productId });
};

/**
 * 获取产品库存
 */
export const getProductInventory = async (
  companyId: string,
  productId: string
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      inventory: true,
    },
  });

  if (!product || product.companyId !== companyId || product.deletedAt) {
    throw new NotFoundError('产品不存在');
  }

  return product.inventory;
};

/**
 * 获取产品销售统计
 */
export const getProductStats = async (
  companyId: string,
  productId: string
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      inventory: true,
    },
  });

  if (!product || product.companyId !== companyId || product.deletedAt) {
    throw new NotFoundError('产品不存在');
  }

  // 获取销售统计
  const items = await db.salesItem.findMany({
    where: {
      productId,
      invoice: {
        companyId,
        deletedAt: null,
      },
    },
  });

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalSales = items.reduce((sum, item) => sum + Number(item.lineAmount), 0);

  return {
    productId,
    name: product.name,
    sku: product.sku,
    unitPrice: product.unitPrice,
    costPrice: product.costPrice,
    inventory: product.inventory,
    totalQuantitySold: totalQuantity,
    totalSales,
    profit: totalSales - (Number(product.costPrice || 0) * totalQuantity),
  };
};


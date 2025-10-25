/**
 * 库存服务
 */

import { db } from '../config/database';
import { logger } from '../config/logger';
import { NotFoundError, ValidationError } from '../utils/errors';
import { INVENTORY_TYPE } from '../config/constants';

/**
 * 获取库存
 */
export const getInventory = async (
  companyId: string,
  productId: string
) => {
  const inventory = await db.inventory.findFirst({
    where: {
      companyId,
      productId,
    },
    include: {
      product: true,
    },
  });

  if (!inventory) {
    throw new NotFoundError('库存不存在');
  }

  return inventory;
};

/**
 * 获取所有库存
 */
export const getAllInventories = async (
  companyId: string,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { companyId };

  if (options?.search) {
    where.product = {
      OR: [
        { name: { contains: options.search } },
        { sku: { contains: options.search } },
      ],
    };
  }

  const total = await db.inventory.count({ where });

  const items = await db.inventory.findMany({
    where,
    include: {
      product: true,
    },
    skip,
    take: limit,
    orderBy: {
      updatedAt: 'desc',
    },
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
 * 调整库存
 */
export const adjustInventory = async (
  companyId: string,
  productId: string,
  userId: string,
  type: string,
  quantity: number,
  reason?: string
) => {
  // 验证库存操作类型
  if (!Object.values(INVENTORY_TYPE).includes(type as any)) {
    throw new ValidationError('无效的库存操作类型');
  }

  // 验证数量
  if (quantity <= 0) {
    throw new ValidationError('库存数量必须大于 0');
  }

  // 获取库存
  const inventory = await db.inventory.findFirst({
    where: {
      companyId,
      productId,
    },
  });

  if (!inventory) {
    throw new NotFoundError('库存不存在');
  }

  let newQuantity = Number(inventory.quantity);

  // 根据操作类型调整库存
  switch (type) {
    case INVENTORY_TYPE.IN:
      newQuantity += quantity;
      break;
    case INVENTORY_TYPE.OUT:
      if (newQuantity < quantity) {
        throw new ValidationError('库存不足');
      }
      newQuantity -= quantity;
      break;
    case INVENTORY_TYPE.ADJUST:
      newQuantity = quantity;
      break;
    case INVENTORY_TYPE.RETURN:
      newQuantity += quantity;
      break;
  }

  // 更新库存
  const updated = await db.inventory.update({
    where: { id: inventory.id },
    data: {
      quantity: newQuantity,
      updatedAt: new Date(),
    },
    include: {
      product: true,
    },
  });

  // 记录库存日志
  await db.inventoryLog.create({
    data: {
      companyId,
      productId,
      type,
      quantity,
      reason,
      createdBy: userId,
    },
  });

  logger.info('库存调整成功', {
    productId,
    type,
    quantity,
    newQuantity,
  });

  return updated;
};

/**
 * 获取库存日志
 */
export const getInventoryLogs = async (
  companyId: string,
  options?: {
    productId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }
) => {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { companyId };

  if (options?.productId) {
    where.productId = options.productId;
  }

  if (options?.type) {
    where.type = options.type;
  }

  const total = await db.inventoryLog.count({ where });

  const items = await db.inventoryLog.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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
 * 设置库存预警级别
 */
export const setWarningLevel = async (
  companyId: string,
  productId: string,
  warningLevel: number
) => {
  if (warningLevel < 0) {
    throw new ValidationError('预警级别不能为负数');
  }

  const inventory = await db.inventory.findFirst({
    where: {
      companyId,
      productId,
    },
  });

  if (!inventory) {
    throw new NotFoundError('库存不存在');
  }

  const updated = await db.inventory.update({
    where: { id: inventory.id },
    data: {
      warningLevel,
      updatedAt: new Date(),
    },
    include: {
      product: true,
    },
  });

  logger.info('库存预警级别设置成功', { productId, warningLevel });

  return updated;
};

/**
 * 获取低库存产品
 */
export const getLowStockProducts = async (companyId: string) => {
  const items = await db.inventory.findMany({
    where: {
      companyId,
      product: {
        deletedAt: null,
      },
    },
    include: {
      product: true,
    },
  });

  // 过滤出库存低于预警级别的产品
  const lowStockItems = items.filter(
    (item) => Number(item.quantity) <= Number(item.warningLevel)
  );

  return lowStockItems;
};


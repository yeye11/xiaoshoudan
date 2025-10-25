/**
 * 报表服务
 */

import { db } from '../config/database';
import { logger } from '../config/logger';

/**
 * 获取销售报表
 */
export const getSalesReport = async (
  companyId: string,
  startDate: Date,
  endDate: Date
) => {
  // 获取销售单数据
  const invoices = await db.salesInvoice.findMany({
    where: {
      companyId,
      invoiceDate: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    include: {
      items: true,
    },
  });

  // 计算统计数据
  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.finalAmount), 0);
  const totalInvoices = invoices.length;
  const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

  // 按日期分组
  const dailyData: Record<string, number> = {};
  invoices.forEach((inv) => {
    const date = inv.invoiceDate.toISOString().split('T')[0];
    dailyData[date] = (dailyData[date] || 0) + Number(inv.finalAmount);
  });

  logger.info('销售报表生成成功', { companyId, totalSales, totalInvoices });

  return {
    totalSales,
    totalInvoices,
    averageOrderValue,
    startDate,
    endDate,
    dailyData: Object.entries(dailyData).map(([date, value]) => ({
      date,
      value,
    })),
  };
};

/**
 * 获取客户分析
 */
export const getCustomerAnalysis = async (companyId: string) => {
  // 获取所有客户
  const customers = await db.customer.findMany({
    where: {
      companyId,
      deletedAt: null,
    },
    include: {
      invoices: {
        where: {
          deletedAt: null,
        },
      },
    },
  });

  // 计算总客户数
  const totalCustomers = customers.length;

  // 计算新客户数（最近 30 天）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newCustomers = customers.filter(
    (c) => c.createdAt >= thirtyDaysAgo
  ).length;

  // 获取销售额最高的客户
  const topCustomers = customers
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalSales: c.invoices.reduce((sum, inv) => sum + Number(inv.finalAmount), 0),
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 10);

  logger.info('客户分析生成成功', { companyId, totalCustomers });

  return {
    totalCustomers,
    newCustomers,
    topCustomers,
  };
};

/**
 * 获取产品分析
 */
export const getProductAnalysis = async (companyId: string) => {
  // 获取所有销售项
  const items = await db.salesItem.findMany({
    where: {
      invoice: {
        companyId,
        deletedAt: null,
      },
    },
    include: {
      product: true,
    },
  });

  // 按产品分组
  const productMap: Record<string, any> = {};
  items.forEach((item) => {
    if (!productMap[item.productId]) {
      productMap[item.productId] = {
        id: item.productId,
        name: item.product.name,
        sku: item.product.sku,
        salesCount: 0,
        totalSales: 0,
      };
    }
    productMap[item.productId].salesCount += Number(item.quantity);
    productMap[item.productId].totalSales += Number(item.lineAmount);
  });

  // 获取销售额最高的产品
  const topProducts = Object.values(productMap)
    .sort((a: any, b: any) => b.totalSales - a.totalSales)
    .slice(0, 10);

  logger.info('产品分析生成成功', { companyId, topProductsCount: topProducts.length });

  return {
    topProducts,
  };
};

/**
 * 获取仪表板数据
 */
export const getDashboardData = async (companyId: string) => {
  // 获取今天的销售数据
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayInvoices = await db.salesInvoice.findMany({
    where: {
      companyId,
      invoiceDate: {
        gte: today,
        lt: tomorrow,
      },
      deletedAt: null,
    },
  });

  const todaySales = todayInvoices.reduce((sum, inv) => sum + Number(inv.finalAmount), 0);

  // 获取本月的销售数据
  const monthStart = new Date(today);
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const monthInvoices = await db.salesInvoice.findMany({
    where: {
      companyId,
      invoiceDate: {
        gte: monthStart,
        lt: monthEnd,
      },
      deletedAt: null,
    },
  });

  const monthSales = monthInvoices.reduce((sum, inv) => sum + Number(inv.finalAmount), 0);

  // 获取客户总数
  const totalCustomers = await db.customer.count({
    where: {
      companyId,
      deletedAt: null,
    },
  });

  // 获取产品总数
  const totalProducts = await db.product.count({
    where: {
      companyId,
      deletedAt: null,
    },
  });

  // 获取低库存产品数
  const lowStockProducts = await db.inventory.findMany({
    where: {
      companyId,
      product: {
        deletedAt: null,
      },
    },
  });

  const lowStockCount = lowStockProducts.filter(
    (inv) => Number(inv.quantity) <= Number(inv.warningLevel)
  ).length;

  logger.info('仪表板数据生成成功', { companyId });

  return {
    todaySales,
    monthSales,
    totalCustomers,
    totalProducts,
    lowStockCount,
  };
};


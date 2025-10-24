/**
 * StatisticsCalculator - 数据统计计算工具
 * 
 * 功能：
 * - 统一数据统计相关的计算逻辑
 * - 提供一致的统计方法
 * - 减少重复的统计代码
 */

import type { Invoice, Customer, Product } from '$lib/types/invoice';

export interface Statistics {
  totalInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  totalSales: number;
  totalPaid: number;
  totalUnpaid: number;
  averageOrderValue: number;
  todaySales: number;
  monthlySales: number;
  unpaidInvoiceCount: number;
}

export class StatisticsCalculator {
  /**
   * 计算总销售额
   * @param invoices 销售单列表
   * @returns 总销售额
   */
  static calculateTotalSales(invoices: Invoice[]): number {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  /**
   * 计算今日销售额
   * @param invoices 销售单列表
   * @returns 今日销售额
   */
  static calculateTodaySales(invoices: Invoice[]): number {
    const today = new Date().toISOString().split('T')[0];
    return invoices
      .filter(inv => inv.date === today)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  /**
   * 计算本月销售额
   * @param invoices 销售单列表
   * @returns 本月销售额
   */
  static calculateMonthlySales(invoices: Invoice[]): number {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return invoices
      .filter(inv => inv.date.startsWith(currentMonth))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  /**
   * 计算本年销售额
   * @param invoices 销售单列表
   * @returns 本年销售额
   */
  static calculateYearlySales(invoices: Invoice[]): number {
    const currentYear = new Date().getFullYear();
    return invoices
      .filter(inv => inv.date.startsWith(String(currentYear)))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  /**
   * 计算平均订单金额
   * @param invoices 销售单列表
   * @returns 平均订单金额
   */
  static calculateAverageOrderValue(invoices: Invoice[]): number {
    if (invoices.length === 0) return 0;
    const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return Number((total / invoices.length).toFixed(2));
  }

  /**
   * 计算未付款金额
   * @param invoices 销售单列表
   * @returns 未付款金额
   */
  static calculateTotalUnpaid(invoices: Invoice[]): number {
    return invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  }

  /**
   * 计算已付款金额
   * @param invoices 销售单列表
   * @returns 已付款金额
   */
  static calculateTotalPaid(invoices: Invoice[]): number {
    return invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  }

  /**
   * 计算未付款销售单数量
   * @param invoices 销售单列表
   * @returns 未付款销售单数量
   */
  static countUnpaidInvoices(invoices: Invoice[]): number {
    return invoices.filter(inv => inv.paidAmount < inv.totalAmount).length;
  }

  /**
   * 获取销售额最高的客户
   * @param invoices 销售单列表
   * @param customers 客户列表
   * @param limit 返回数量
   * @returns 客户及其销售额列表
   */
  static getTopCustomers(
    invoices: Invoice[],
    customers: Customer[],
    limit: number = 10
  ): Array<{ customer: Customer; totalSales: number }> {
    const customerSales: Record<string, number> = {};

    // 计算每个客户的销售额
    invoices.forEach(inv => {
      if (inv.customerId) {
        customerSales[inv.customerId] = (customerSales[inv.customerId] || 0) + inv.totalAmount;
      }
    });

    // 获取客户信息并排序
    return Object.entries(customerSales)
      .map(([customerId, totalSales]) => ({
        customer: customers.find(c => c.id === customerId)!,
        totalSales
      }))
      .filter(item => item.customer) // 过滤掉已删除的客户
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
  }

  /**
   * 获取销售量最高的产品
   * @param invoices 销售单列表
   * @param products 产品列表
   * @param limit 返回数量
   * @returns 产品及其销售量列表
   */
  static getTopProducts(
    invoices: Invoice[],
    products: Product[],
    limit: number = 10
  ): Array<{ product: Product; totalQuantity: number; totalSales: number }> {
    const productStats: Record<string, { quantity: number; sales: number }> = {};

    // 计算每个产品的销售量和销售额
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.productId) {
          if (!productStats[item.productId]) {
            productStats[item.productId] = { quantity: 0, sales: 0 };
          }
          productStats[item.productId].quantity += item.quantity;
          productStats[item.productId].sales += item.amount;
        }
      });
    });

    // 获取产品信息并排序
    return Object.entries(productStats)
      .map(([productId, stats]) => ({
        product: products.find(p => p.id === productId)!,
        totalQuantity: stats.quantity,
        totalSales: stats.sales
      }))
      .filter(item => item.product) // 过滤掉已删除的产品
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
  }

  /**
   * 获取销售趋势（按日期）
   * @param invoices 销售单列表
   * @param days 天数
   * @returns 销售趋势数据
   */
  static getSalesTrend(
    invoices: Invoice[],
    days: number = 30
  ): Array<{ date: string; sales: number; count: number }> {
    const trend: Record<string, { sales: number; count: number }> = {};

    // 初始化最近 N 天的数据
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = { sales: 0, count: 0 };
    }

    // 统计销售数据
    invoices.forEach(inv => {
      if (trend[inv.date]) {
        trend[inv.date].sales += inv.totalAmount;
        trend[inv.date].count += 1;
      }
    });

    return Object.entries(trend).map(([date, data]) => ({
      date,
      sales: Number(data.sales.toFixed(2)),
      count: data.count
    }));
  }

  /**
   * 计算完整的统计数据
   * @param invoices 销售单列表
   * @param customers 客户列表
   * @param products 产品列表
   * @returns 统计数据对象
   */
  static calculateStatistics(
    invoices: Invoice[],
    customers: Customer[],
    products: Product[]
  ): Statistics {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    return {
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalSales: Number(totalSales.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalUnpaid: Number((totalSales - totalPaid).toFixed(2)),
      averageOrderValue: this.calculateAverageOrderValue(invoices),
      todaySales: Number(this.calculateTodaySales(invoices).toFixed(2)),
      monthlySales: Number(this.calculateMonthlySales(invoices).toFixed(2)),
      unpaidInvoiceCount: this.countUnpaidInvoices(invoices)
    };
  }

  /**
   * 格式化金额为人民币
   * @param amount 金额
   * @returns 格式化后的金额字符串
   */
  static formatCurrency(amount: number): string {
    return `¥${amount.toFixed(2)}`;
  }

  /**
   * 格式化百分比
   * @param value 值
   * @param total 总值
   * @returns 格式化后的百分比字符串
   */
  static formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }
}


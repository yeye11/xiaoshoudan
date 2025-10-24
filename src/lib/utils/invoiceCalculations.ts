/**
 * InvoiceCalculator - 销售单计算工具
 * 
 * 功能：
 * - 统一销售单相关的计算逻辑
 * - 提供一致的计算方法
 * - 减少重复的计算代码
 */

import type { Invoice, InvoiceItem } from '$lib/types/invoice';

export class InvoiceCalculator {
  /**
   * 计算单个项目的金额
   * @param quantity 数量
   * @param unitPrice 单价
   * @returns 金额
   */
  static calculateItemAmount(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
  }

  /**
   * 计算销售单总金额
   * @param items 销售单项目列表
   * @returns 总金额
   */
  static calculateTotalAmount(items: InvoiceItem[]): number {
    return Number(
      items
        .reduce((sum, item) => sum + this.calculateItemAmount(item.quantity, item.unitPrice), 0)
        .toFixed(2)
    );
  }

  /**
   * 计算销售单的未付款金额
   * @param invoice 销售单
   * @returns 未付款金额
   */
  static calculateUnpaidAmount(invoice: Invoice): number {
    return Number((invoice.totalAmount - invoice.paidAmount).toFixed(2));
  }

  /**
   * 计算销售单的付款比例
   * @param invoice 销售单
   * @returns 付款比例（0-100）
   */
  static calculatePaymentPercentage(invoice: Invoice): number {
    if (invoice.totalAmount === 0) return 0;
    return Math.round((invoice.paidAmount / invoice.totalAmount) * 100);
  }

  /**
   * 检查销售单是否已完全付款
   * @param invoice 销售单
   * @returns 是否已完全付款
   */
  static isFullyPaid(invoice: Invoice): boolean {
    return invoice.paidAmount >= invoice.totalAmount;
  }

  /**
   * 检查销售单是否部分付款
   * @param invoice 销售单
   * @returns 是否部分付款
   */
  static isPartiallyPaid(invoice: Invoice): boolean {
    return invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount;
  }

  /**
   * 检查销售单是否未付款
   * @param invoice 销售单
   * @returns 是否未付款
   */
  static isUnpaid(invoice: Invoice): boolean {
    return invoice.paidAmount === 0;
  }

  /**
   * 获取销售单的付款状态文本
   * @param invoice 销售单
   * @returns 付款状态文本
   */
  static getPaymentStatusText(invoice: Invoice): string {
    if (this.isFullyPaid(invoice)) {
      return '已付款';
    } else if (this.isPartiallyPaid(invoice)) {
      return '部分付款';
    } else {
      return '未付款';
    }
  }

  /**
   * 获取销售单的付款状态颜色
   * @param invoice 销售单
   * @returns 付款状态颜色（Tailwind CSS 类）
   */
  static getPaymentStatusColor(invoice: Invoice): string {
    if (this.isFullyPaid(invoice)) {
      return 'text-green-600 bg-green-50';
    } else if (this.isPartiallyPaid(invoice)) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  }

  /**
   * 计算多个销售单的总金额
   * @param invoices 销售单列表
   * @returns 总金额
   */
  static calculateTotalSales(invoices: Invoice[]): number {
    return Number(
      invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0).toFixed(2)
    );
  }

  /**
   * 计算多个销售单的已付款总额
   * @param invoices 销售单列表
   * @returns 已付款总额
   */
  static calculateTotalPaid(invoices: Invoice[]): number {
    return Number(
      invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0).toFixed(2)
    );
  }

  /**
   * 计算多个销售单的未付款总额
   * @param invoices 销售单列表
   * @returns 未付款总额
   */
  static calculateTotalUnpaid(invoices: Invoice[]): number {
    return Number(
      invoices
        .reduce((sum, invoice) => sum + this.calculateUnpaidAmount(invoice), 0)
        .toFixed(2)
    );
  }

  /**
   * 获取指定日期范围内的销售单
   * @param invoices 销售单列表
   * @param startDate 开始日期（YYYY-MM-DD）
   * @param endDate 结束日期（YYYY-MM-DD）
   * @returns 符合条件的销售单列表
   */
  static getInvoicesByDateRange(
    invoices: Invoice[],
    startDate: string,
    endDate: string
  ): Invoice[] {
    return invoices.filter(inv => inv.date >= startDate && inv.date <= endDate);
  }

  /**
   * 获取指定日期的销售单
   * @param invoices 销售单列表
   * @param date 日期（YYYY-MM-DD）
   * @returns 符合条件的销售单列表
   */
  static getInvoicesByDate(invoices: Invoice[], date: string): Invoice[] {
    return invoices.filter(inv => inv.date === date);
  }

  /**
   * 获取指定月份的销售单
   * @param invoices 销售单列表
   * @param year 年份
   * @param month 月份（1-12）
   * @returns 符合条件的销售单列表
   */
  static getInvoicesByMonth(invoices: Invoice[], year: number, month: number): Invoice[] {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    return invoices.filter(inv => inv.date.startsWith(monthStr));
  }

  /**
   * 获取指定年份的销售单
   * @param invoices 销售单列表
   * @param year 年份
   * @returns 符合条件的销售单列表
   */
  static getInvoicesByYear(invoices: Invoice[], year: number): Invoice[] {
    return invoices.filter(inv => inv.date.startsWith(String(year)));
  }

  /**
   * 获取未付款的销售单
   * @param invoices 销售单列表
   * @returns 未付款的销售单列表
   */
  static getUnpaidInvoices(invoices: Invoice[]): Invoice[] {
    return invoices.filter(inv => !this.isFullyPaid(inv));
  }

  /**
   * 获取已付款的销售单
   * @param invoices 销售单列表
   * @returns 已付款的销售单列表
   */
  static getPaidInvoices(invoices: Invoice[]): Invoice[] {
    return invoices.filter(inv => this.isFullyPaid(inv));
  }

  /**
   * 按日期排序销售单
   * @param invoices 销售单列表
   * @param order 排序顺序（'asc' 或 'desc'）
   * @returns 排序后的销售单列表
   */
  static sortByDate(invoices: Invoice[], order: 'asc' | 'desc' = 'desc'): Invoice[] {
    return [...invoices].sort((a, b) => {
      const comparison = a.date.localeCompare(b.date);
      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * 按金额排序销售单
   * @param invoices 销售单列表
   * @param order 排序顺序（'asc' 或 'desc'）
   * @returns 排序后的销售单列表
   */
  static sortByAmount(invoices: Invoice[], order: 'asc' | 'desc' = 'desc'): Invoice[] {
    return [...invoices].sort((a, b) => {
      const comparison = a.totalAmount - b.totalAmount;
      return order === 'asc' ? comparison : -comparison;
    });
  }
}


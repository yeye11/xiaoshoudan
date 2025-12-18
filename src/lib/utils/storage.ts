/**
 * StorageManager - 统一的数据存储管理层
 *
 * 功能：
 * - 统一 localStorage 操作
 * - 统一错误处理
 * - 统一数据类型转换
 * - 提供一致的 API 接口
 * - 集成缓存策略，减少 localStorage 读取
 */

import type {
  Invoice,
  Customer,
  Product,
  CustomerCategory,
  ExpenseIncome,
  CompanyInfo,
  Quotation,
  QuotationProduct
} from '$lib/types/invoice';
import { globalCache } from './cache';

/**
 * 通用 CRUD 操作基类
 */
class CRUDManager<T extends { id: string }> {
  constructor(
    private storageKey: string,
    private cacheKey: string,
    private cacheDuration: number = 5 * 60 * 1000
  ) {}

  /**
   * 获取所有数据（使用缓存）
   */
  getAll(): T[] {
    return globalCache.getOrSet(this.cacheKey, () => {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error(`获取 ${this.storageKey} 失败:`, error);
        return [];
      }
    }, this.cacheDuration);
  }

  /**
   * 保存所有数据（并清除缓存）
   */
  saveAll(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      globalCache.delete(this.cacheKey);
    } catch (error) {
      const msg = (error as any)?.message || '';
      const name = (error as any)?.name || '';
      const isQuota = /quota/i.test(msg) || /QuotaExceededError/i.test(name);
      console.error(`保存 ${this.storageKey} 失败:`, error);
      if (isQuota) {
        throw new Error(`保存失败：存储空间不足。请删除过大的图片（如二维码）或清理部分历史数据后重试。`);
      }
      throw new Error(`保存 ${this.storageKey} 失败`);
    }
  }

  /**
   * 获取单个数据
   */
  getById(id: string): T | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  /**
   * 添加数据
   */
  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.saveAll(items);
  }

  /**
   * 更新数据
   */
  update(id: string, updates: Partial<T>): void {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...updates };
      this.saveAll(items);
    }
  }

  /**
   * 删除数据
   */
  delete(id: string): void {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    this.saveAll(filtered);
  }
}

export class StorageManager {
  // ==================== 初始化 CRUD 管理器 ====================

  private static invoiceManager = new CRUDManager<Invoice>('invoice_history', 'invoices', 5 * 60 * 1000);
  private static customerManager = new CRUDManager<Customer>('customers', 'customers', 5 * 60 * 1000);
  private static productManager = new CRUDManager<Product>('products', 'products', 5 * 60 * 1000);
  private static quotationManager = new CRUDManager<Quotation>('quotations', 'quotations', 5 * 60 * 1000);
  private static quotationProductManager = new CRUDManager<QuotationProduct>('quotation_products', 'quotation_products', 5 * 60 * 1000);

  // ==================== 销售单相关 ====================

  /**
   * 获取所有销售单（使用缓存）
   */
  static getInvoices(): Invoice[] {
    return this.invoiceManager.getAll();
  }

  /**
   * 保存销售单列表（并清除缓存）
   */
  static saveInvoices(invoices: Invoice[]): void {
    this.invoiceManager.saveAll(invoices);
  }

  /**
   * 获取单个销售单
   */
  static getInvoice(id: string): Invoice | null {
    return this.invoiceManager.getById(id);
  }

  /**
   * 添加销售单
   */
  static addInvoice(invoice: Invoice): void {
    this.invoiceManager.add(invoice);
  }

  /**
   * 更新销售单
   */
  static updateInvoice(id: string, updates: Partial<Invoice>): void {
    this.invoiceManager.update(id, updates);
  }

  /**
   * 删除销售单
   */
  static deleteInvoice(id: string): void {
    this.invoiceManager.delete(id);
  }

  // ==================== 客户相关 ====================

  /**
   * 获取所有客户（使用缓存）
   */
  static getCustomers(): Customer[] {
    return this.customerManager.getAll();
  }

  /**
   * 保存客户列表（并清除缓存）
   */
  static saveCustomers(customers: Customer[]): void {
    this.customerManager.saveAll(customers);
  }

  /**
   * 获取单个客户
   */
  static getCustomer(id: string): Customer | null {
    return this.customerManager.getById(id);
  }

  /**
   * 添加客户
   */
  static addCustomer(customer: Customer): void {
    this.customerManager.add(customer);
  }

  /**
   * 更新客户
   */
  static updateCustomer(id: string, updates: Partial<Customer>): void {
    this.customerManager.update(id, updates);
  }

  /**
   * 删除客户
   */
  static deleteCustomer(id: string): void {
    this.customerManager.delete(id);
  }

  // ==================== 产品相关 ====================

  /**
   * 获取所有产品（使用缓存）
   */
  static getProducts(): Product[] {
    return this.productManager.getAll();
  }

  /**
   * 保存产品列表（并清除缓存）
   */
  static saveProducts(products: Product[]): void {
    this.productManager.saveAll(products);
  }

  /**
   * 获取单个产品
   */
  static getProduct(id: string): Product | null {
    return this.productManager.getById(id);
  }

  /**
   * 添加产品
   */
  static addProduct(product: Product): void {
    this.productManager.add(product);
  }

  /**
   * 更新产品
   */
  static updateProduct(id: string, updates: Partial<Product>): void {
    this.productManager.update(id, updates);
  }

  /**
   * 删除产品
   */
  static deleteProduct(id: string): void {
    this.productManager.delete(id);
  }

  // ==================== 报价单相关 ====================
  static getQuotations(): Quotation[] {
    return this.quotationManager.getAll();
  }
  static saveQuotations(quotations: Quotation[]): void {
    this.quotationManager.saveAll(quotations);
  }
  static getQuotation(id: string): Quotation | null {
    return this.quotationManager.getById(id);
  }
  static addQuotation(quotation: Quotation): void {
    this.quotationManager.add(quotation);
  }
  static updateQuotation(id: string, updates: Partial<Quotation>): void {
    this.quotationManager.update(id, updates);
  }
  static deleteQuotation(id: string): void {
    this.quotationManager.delete(id);
  }

  // ==================== 报价产品相关 ====================
  static getQuotationProducts(): QuotationProduct[] {
    return this.quotationProductManager.getAll();
  }
  static saveQuotationProducts(items: QuotationProduct[]): void {
    this.quotationProductManager.saveAll(items);
  }
  static getQuotationProduct(id: string): QuotationProduct | null {
    return this.quotationProductManager.getById(id);
  }
  static addQuotationProduct(item: QuotationProduct): void {
    this.quotationProductManager.add(item);
  }
  static updateQuotationProduct(id: string, updates: Partial<QuotationProduct>): void {
    this.quotationProductManager.update(id, updates);
  }
  static deleteQuotationProduct(id: string): void {
    this.quotationProductManager.delete(id);
  }

  // ==================== 分类相关 ====================

  /**
   * 获取客户分类
   */
  static getCustomerCategories(): string[] {
    try {
      const stored = localStorage.getItem('customer_categories');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('获取客户分类失败:', error);
      return [];
    }
  }

  /**
   * 保存客户分类
   */
  static saveCustomerCategories(categories: string[]): void {
    try {
      localStorage.setItem('customer_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('保存客户分类失败:', error);
    }
  }

  /**
   * 获取产品分类
   */
  static getProductCategories(): string[] {
    try {
      const stored = localStorage.getItem('product_categories');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('获取产品分类失败:', error);
      return [];
    }
  }

  /**
   * 保存产品分类
   */
  static saveProductCategories(categories: string[]): void {
    try {
      localStorage.setItem('product_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('保存产品分类失败:', error);
    }
  }

  // ==================== 用户信息相关 ====================

  /**
   * 获取用户信息（使用缓存）
   */
  static getUserInfo(): Record<string, any> {
    return globalCache.getOrSet('userInfo', () => {
      try {
        const stored = localStorage.getItem('user_info');
        return stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return {};
      }
    }, 10 * 60 * 1000); // 10 分钟缓存
  }

  /**
   * 保存用户信息（并清除缓存）
   */
  static saveUserInfo(userInfo: Record<string, any>): void {
    try {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      globalCache.delete('userInfo');
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }

  // ==================== 应用设置相关 ====================

  /**
   * 获取应用设置（使用缓存）
   */
  static getSettings(): Record<string, any> {
    return globalCache.getOrSet('settings', () => {
      try {
        const stored = localStorage.getItem('app_settings');
        return stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.error('获取应用设置失败:', error);
        return {};
      }
    }, 10 * 60 * 1000); // 10 分钟缓存
  }

  /**
   * 保存应用设置（并清除缓存）
   */
  static saveSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      globalCache.delete('settings');
    } catch (error) {
      console.error('保存应用设置失败:', error);
    }
  }

  // ==================== 清除数据 ====================

  /**
   * 清除所有数据
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem('customers');
      localStorage.removeItem('products');
      localStorage.removeItem('invoice_history');
      localStorage.removeItem('quotations');
      localStorage.removeItem('quotation_products');
      localStorage.removeItem('customer_categories');
      localStorage.removeItem('product_categories');
      localStorage.removeItem('product_units');
      localStorage.removeItem('global_tags');
      localStorage.removeItem('global_specifications');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  /**
   * 获取存储数据大小（字节）
   */
  static getStorageSize(): number {
    let size = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('计算存储大小失败:', error);
    }
    return size;
  }
}


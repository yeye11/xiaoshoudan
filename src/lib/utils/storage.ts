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
  CompanyInfo
} from '$lib/types/invoice';
import { globalCache } from './cache';

export class StorageManager {
  // ==================== 销售单相关 ====================
  
  /**
   * 获取所有销售单（使用缓存）
   */
  static getInvoices(): Invoice[] {
    return globalCache.getOrSet('invoices', () => {
      try {
        const stored = localStorage.getItem('invoice_history');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('获取销售单失败:', error);
        return [];
      }
    }, 5 * 60 * 1000); // 5 分钟缓存
  }

  /**
   * 保存销售单列表（并清除缓存）
   */
  static saveInvoices(invoices: Invoice[]): void {
    try {
      localStorage.setItem('invoice_history', JSON.stringify(invoices));
      // 清除缓存，下次读取时会重新加载
      globalCache.delete('invoices');
    } catch (error) {
      console.error('保存销售单失败:', error);
      throw new Error('保存销售单失败');
    }
  }

  /**
   * 获取单个销售单
   */
  static getInvoice(id: string): Invoice | null {
    const invoices = this.getInvoices();
    return invoices.find(inv => inv.id === id) || null;
  }

  /**
   * 添加销售单
   */
  static addInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    invoices.push(invoice);
    this.saveInvoices(invoices);
  }

  /**
   * 更新销售单
   */
  static updateInvoice(id: string, updates: Partial<Invoice>): void {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index >= 0) {
      invoices[index] = { ...invoices[index], ...updates };
      this.saveInvoices(invoices);
    }
  }

  /**
   * 删除销售单
   */
  static deleteInvoice(id: string): void {
    const invoices = this.getInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    this.saveInvoices(filtered);
  }

  // ==================== 客户相关 ====================

  /**
   * 获取所有客户（使用缓存）
   */
  static getCustomers(): Customer[] {
    return globalCache.getOrSet('customers', () => {
      try {
        const stored = localStorage.getItem('customers');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('获取客户失败:', error);
        return [];
      }
    }, 5 * 60 * 1000); // 5 分钟缓存
  }

  /**
   * 保存客户列表（并清除缓存）
   */
  static saveCustomers(customers: Customer[]): void {
    try {
      localStorage.setItem('customers', JSON.stringify(customers));
      // 清除缓存，下次读取时会重新加载
      globalCache.delete('customers');
    } catch (error) {
      console.error('保存客户失败:', error);
      throw new Error('保存客户失败');
    }
  }

  /**
   * 获取单个客户
   */
  static getCustomer(id: string): Customer | null {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id) || null;
  }

  /**
   * 添加客户
   */
  static addCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    customers.push(customer);
    this.saveCustomers(customers);
  }

  /**
   * 更新客户
   */
  static updateCustomer(id: string, updates: Partial<Customer>): void {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index >= 0) {
      customers[index] = { ...customers[index], ...updates };
      this.saveCustomers(customers);
    }
  }

  /**
   * 删除客户
   */
  static deleteCustomer(id: string): void {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    this.saveCustomers(filtered);
  }

  // ==================== 产品相关 ====================

  /**
   * 获取所有产品（使用缓存）
   */
  static getProducts(): Product[] {
    return globalCache.getOrSet('products', () => {
      try {
        const stored = localStorage.getItem('products');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('获取产品失败:', error);
        return [];
      }
    }, 5 * 60 * 1000); // 5 分钟缓存
  }

  /**
   * 保存产品列表（并清除缓存）
   */
  static saveProducts(products: Product[]): void {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      // 清除缓存，下次读取时会重新加载
      globalCache.delete('products');
    } catch (error) {
      console.error('保存产品失败:', error);
      throw new Error('保存产品失败');
    }
  }

  /**
   * 获取单个产品
   */
  static getProduct(id: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  /**
   * 添加产品
   */
  static addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  /**
   * 更新产品
   */
  static updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index] = { ...products[index], ...updates };
      this.saveProducts(products);
    }
  }

  /**
   * 删除产品
   */
  static deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
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


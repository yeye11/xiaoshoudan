/**
 * Svelte Store - 响应式数据管理
 * 
 * 功能：
 * - 提供响应式的数据存储
 * - 自动同步到 localStorage
 * - 支持组件间数据共享
 * - 简化组件中的数据管理
 */

import { writable, derived } from 'svelte/store';
import type { Invoice, Customer, Product } from '$lib/types/invoice';
import { StorageManager } from '$lib/utils/storage';

// ==================== 基础 Store ====================

/**
 * 销售单 Store
 */
export const invoices = writable<Invoice[]>(StorageManager.getInvoices());

/**
 * 客户 Store
 */
export const customers = writable<Customer[]>(StorageManager.getCustomers());

/**
 * 产品 Store
 */
export const products = writable<Product[]>(StorageManager.getProducts());

/**
 * 客户分类 Store
 */
export const customerCategories = writable<string[]>(
  StorageManager.getCustomerCategories()
);

/**
 * 产品分类 Store
 */
export const productCategories = writable<string[]>(
  StorageManager.getProductCategories()
);

/**
 * 用户信息 Store
 */
export const userInfo = writable<Record<string, any>>(
  StorageManager.getUserInfo()
);

/**
 * 应用设置 Store
 */
export const appSettings = writable<Record<string, any>>(
  StorageManager.getSettings()
);

// ==================== 自动同步到 localStorage ====================

/**
 * 订阅销售单变化，自动保存到 localStorage
 */
invoices.subscribe(value => {
  StorageManager.saveInvoices(value);
});

/**
 * 订阅客户变化，自动保存到 localStorage
 */
customers.subscribe(value => {
  StorageManager.saveCustomers(value);
});

/**
 * 订阅产品变化，自动保存到 localStorage
 */
products.subscribe(value => {
  StorageManager.saveProducts(value);
});

/**
 * 订阅客户分类变化，自动保存到 localStorage
 */
customerCategories.subscribe(value => {
  StorageManager.saveCustomerCategories(value);
});

/**
 * 订阅产品分类变化，自动保存到 localStorage
 */
productCategories.subscribe(value => {
  StorageManager.saveProductCategories(value);
});

/**
 * 订阅用户信息变化，自动保存到 localStorage
 */
userInfo.subscribe(value => {
  StorageManager.saveUserInfo(value);
});

/**
 * 订阅应用设置变化，自动保存到 localStorage
 */
appSettings.subscribe(value => {
  StorageManager.saveSettings(value);
});

// ==================== 派生 Store ====================

/**
 * 销售单数量
 */
export const invoiceCount = derived(invoices, $invoices => $invoices.length);

/**
 * 客户数量
 */
export const customerCount = derived(customers, $customers => $customers.length);

/**
 * 产品数量
 */
export const productCount = derived(products, $products => $products.length);

/**
 * 今日销售额
 */
export const todaySales = derived(invoices, $invoices => {
  const today = new Date().toISOString().split('T')[0];
  return $invoices
    .filter(inv => inv.date === today)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
});

/**
 * 本月销售额
 */
export const monthlySales = derived(invoices, $invoices => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return $invoices
    .filter(inv => inv.date.startsWith(currentMonth))
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
});

/**
 * 未付款销售单
 */
export const unpaidInvoices = derived(invoices, $invoices =>
  $invoices.filter(inv => inv.paymentStatus !== 'paid')
);

/**
 * 未付款金额
 */
export const unpaidAmount = derived(unpaidInvoices, $unpaidInvoices =>
  $unpaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
);

// ==================== 辅助函数 ====================

/**
 * 添加销售单
 */
export function addInvoice(invoice: Invoice): void {
  invoices.update(list => [...list, invoice]);
}

/**
 * 更新销售单
 */
export function updateInvoice(id: string, updates: Partial<Invoice>): void {
  invoices.update(list =>
    list.map(inv => (inv.id === id ? { ...inv, ...updates } : inv))
  );
}

/**
 * 删除销售单
 */
export function deleteInvoice(id: string): void {
  invoices.update(list => list.filter(inv => inv.id !== id));
}

/**
 * 添加客户
 */
export function addCustomer(customer: Customer): void {
  customers.update(list => [...list, customer]);
}

/**
 * 更新客户
 */
export function updateCustomer(id: string, updates: Partial<Customer>): void {
  customers.update(list =>
    list.map(c => (c.id === id ? { ...c, ...updates } : c))
  );
}

/**
 * 删除客户
 */
export function deleteCustomer(id: string): void {
  customers.update(list => list.filter(c => c.id !== id));
}

/**
 * 添加产品
 */
export function addProduct(product: Product): void {
  products.update(list => [...list, product]);
}

/**
 * 更新产品
 */
export function updateProduct(id: string, updates: Partial<Product>): void {
  products.update(list =>
    list.map(p => (p.id === id ? { ...p, ...updates } : p))
  );
}

/**
 * 删除产品
 */
export function deleteProduct(id: string): void {
  products.update(list => list.filter(p => p.id !== id));
}

/**
 * 添加客户分类
 */
export function addCustomerCategory(category: string): void {
  customerCategories.update(list => {
    if (!list.includes(category)) {
      return [...list, category];
    }
    return list;
  });
}

/**
 * 添加产品分类
 */
export function addProductCategory(category: string): void {
  productCategories.update(list => {
    if (!list.includes(category)) {
      return [...list, category];
    }
    return list;
  });
}

/**
 * 清除所有数据
 */
export function clearAllData(): void {
  invoices.set([]);
  customers.set([]);
  products.set([]);
  customerCategories.set([]);
  productCategories.set([]);
  StorageManager.clearAllData();
}


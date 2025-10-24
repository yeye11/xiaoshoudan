/**
 * 分类管理 Store
 * 
 * 功能：
 * - 统一的分类加载逻辑
 * - 统一的分类保存逻辑
 * - 统一的分类添加逻辑
 * - 支持多种分类类型
 */

import { writable, type Writable } from 'svelte/store';

export interface CategoryStoreConfig {
  /** 存储键名 */
  storageKey: string;
  /** 默认分类 */
  defaultCategories?: string[];
}

export interface CategoryStore {
  subscribe: (callback: (categories: string[]) => void) => () => void;
  load: () => void;
  save: (categories: string[]) => void;
  add: (category: string) => void;
  remove: (category: string) => void;
  reset: () => void;
}

/**
 * 创建分类管理 Store
 */
export function createCategoryStore(config: CategoryStoreConfig): CategoryStore {
  const defaultCategories = config.defaultCategories || [];
  const store = writable<string[]>(defaultCategories);

  /**
   * 从 localStorage 加载分类
   */
  const load = (): void => {
    try {
      const stored = localStorage.getItem(config.storageKey);
      if (stored) {
        const categories = JSON.parse(stored);
        if (Array.isArray(categories)) {
          store.set(categories);
          return;
        }
      }
    } catch (error) {
      console.error(`加载 ${config.storageKey} 失败:`, error);
    }
    store.set(defaultCategories);
  };

  /**
   * 保存分类到 localStorage
   */
  const save = (categories: string[]): void => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(categories));
      store.set(categories);
    } catch (error) {
      console.error(`保存 ${config.storageKey} 失败:`, error);
    }
  };

  /**
   * 添加分类
   */
  const add = (category: string): void => {
    store.update(categories => {
      const trimmed = category.trim();
      if (trimmed && !categories.includes(trimmed)) {
        const updated = [...categories, trimmed];
        save(updated);
        return updated;
      }
      return categories;
    });
  };

  /**
   * 移除分类
   */
  const remove = (category: string): void => {
    store.update(categories => {
      const updated = categories.filter(c => c !== category);
      save(updated);
      return updated;
    });
  };

  /**
   * 重置为默认分类
   */
  const reset = (): void => {
    save(defaultCategories);
  };

  return {
    subscribe: store.subscribe,
    load,
    save,
    add,
    remove,
    reset
  };
}

// ==================== 预定义的分类 Store ====================

/**
 * 客户分类 Store
 */
export const customerCategoryStore = createCategoryStore({
  storageKey: 'customer_categories',
  defaultCategories: ['未分类', '重要客户', '普通客户', '潜在客户']
});

/**
 * 产品分类 Store
 */
export const productCategoryStore = createCategoryStore({
  storageKey: 'product_categories',
  defaultCategories: ['未分类', '装饰板材', '五金配件', '其他']
});

/**
 * 产品单位 Store
 */
export const productUnitStore = createCategoryStore({
  storageKey: 'product_units',
  defaultCategories: ['件', '个', '套', '米', '平方米', '盒', '卷']
});

/**
 * 初始化所有分类 Store
 */
export function initializeCategoryStores(): void {
  customerCategoryStore.load();
  productCategoryStore.load();
  productUnitStore.load();
}


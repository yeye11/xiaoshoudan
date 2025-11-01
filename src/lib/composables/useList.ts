/**
 * 通用列表管理组合函数
 * 
 * 功能：
 * - 统一的列表加载逻辑
 * - 统一的搜索/过滤逻辑
 * - 统一的排序逻辑
 * - 统一的删除逻辑
 * - 统一的分页逻辑
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store';

export interface ListConfig<T> {
  /** 初始数据 */
  initialData: T[];
  /** 搜索字段 */
  searchFields?: (keyof T)[];
  /** 排序字段 */
  sortFields?: (keyof T)[];
  /** 删除回调 */
  onDelete?: (item: T) => Promise<void>;
  /** 加载回调 */
  onLoad?: () => Promise<T[]>;
}

export interface ListState<T> {
  items: Writable<T[]>;
  filteredItems: Readable<T[]>;
  searchQuery: Writable<string>;
  sortField: Writable<keyof T | null>;
  sortOrder: Writable<'asc' | 'desc'>;
  isLoading: Writable<boolean>;
  isDeleting: Writable<boolean>;
  currentPage: Writable<number>;
  pageSize: Writable<number>;
  paginatedItems: Readable<T[]>;
  totalCount: Readable<number>;
  totalPages: Readable<number>;
  
  // 方法
  load: () => Promise<void>;
  search: (query: string) => void;
  sort: (field: keyof T) => void;
  delete: (item: T) => Promise<void>;
  deleteMultiple: (items: T[]) => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}

/**
 * 创建列表状态管理
 */
export function useList<T extends { id: string }>(config: ListConfig<T>): ListState<T> {
  const items = writable<T[]>(config.initialData);
  const searchQuery = writable<string>('');
  const sortField = writable<keyof T | null>(null);
  const sortOrder = writable<'asc' | 'desc'>('asc');
  const isLoading = writable(false);
  const isDeleting = writable(false);
  const currentPage = writable(1);
  const pageSize = writable(10);

  /**
   * 过滤和排序后的项目
   */
  const filteredItems = derived(
    [items, searchQuery, sortField, sortOrder],
    ([$items, $searchQuery, $sortField, $sortOrder]) => {
      let result = [...$items];

      // 搜索过滤
      if ($searchQuery.trim() && config.searchFields && config.searchFields.length > 0) {
        const query = $searchQuery.toLowerCase();
        result = result.filter(item =>
          config.searchFields!.some(field => {
            const value = String(item[field] || '').toLowerCase();
            return value.includes(query);
          })
        );
      }

      // 排序
      if ($sortField) {
        result.sort((a, b) => {
          const aVal = a[$sortField];
          const bVal = b[$sortField];

          if (aVal === bVal) {
            // 当主排序字段相同时，使用 id 作为稳定的二次排序
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
          }
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          const comparison = aVal < bVal ? -1 : 1;
          return $sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      return result;
    }
  );

  /**
   * 分页后的项目
   */
  const paginatedItems = derived(
    [filteredItems, currentPage, pageSize],
    ([$filteredItems, $currentPage, $pageSize]) => {
      const start = ($currentPage - 1) * $pageSize;
      const end = start + $pageSize;
      return $filteredItems.slice(start, end);
    }
  );

  /**
   * 总数
   */
  const totalCount = derived(filteredItems, $filteredItems => $filteredItems.length);

  /**
   * 总页数
   */
  const totalPages = derived(
    [totalCount, pageSize],
    ([$totalCount, $pageSize]) => Math.ceil($totalCount / $pageSize)
  );

  /**
   * 加载数据
   */
  const load = async (): Promise<void> => {
    if (!config.onLoad) return;

    isLoading.set(true);
    try {
      const data = await config.onLoad();
      items.set(data);
      currentPage.set(1);
    } finally {
      isLoading.set(false);
    }
  };

  /**
   * 搜索
   */
  const search = (query: string): void => {
    searchQuery.set(query);
    currentPage.set(1);
  };

  /**
   * 排序
   */
  const sort = (field: keyof T): void => {
    sortField.update(current => {
      if (current === field) {
        sortOrder.update(order => (order === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      sortOrder.set('asc');
      return field;
    });
  };

  /**
   * 删除单个项目
   */
  const deleteItem = async (item: T): Promise<void> => {
    if (!config.onDelete) return;

    isDeleting.set(true);
    try {
      await config.onDelete(item);
      items.update(list => list.filter(i => i.id !== item.id));
    } finally {
      isDeleting.set(false);
    }
  };

  /**
   * 删除多个项目
   */
  const deleteMultiple = async (itemsToDelete: T[]): Promise<void> => {
    if (!config.onDelete) return;

    isDeleting.set(true);
    try {
      await Promise.all(itemsToDelete.map(item => config.onDelete!(item)));
      const idsToDelete = new Set(itemsToDelete.map(i => i.id));
      items.update(list => list.filter(i => !idsToDelete.has(i.id)));
    } finally {
      isDeleting.set(false);
    }
  };

  /**
   * 跳转到指定页
   */
  const goToPage = (page: number): void => {
    currentPage.set(Math.max(1, page));
  };

  /**
   * 下一页
   */
  const nextPage = (): void => {
    currentPage.update(page => page + 1);
  };

  /**
   * 上一页
   */
  const prevPage = (): void => {
    currentPage.update(page => Math.max(1, page - 1));
  };

  /**
   * 重置
   */
  const reset = (): void => {
    items.set(config.initialData);
    searchQuery.set('');
    sortField.set(null);
    sortOrder.set('asc');
    currentPage.set(1);
  };

  return {
    items,
    filteredItems,
    searchQuery,
    sortField,
    sortOrder,
    isLoading,
    isDeleting,
    currentPage,
    pageSize,
    paginatedItems,
    totalCount,
    totalPages,
    load,
    search,
    sort,
    delete: deleteItem,
    deleteMultiple,
    goToPage,
    nextPage,
    prevPage,
    reset
  };
}


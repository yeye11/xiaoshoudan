/**
 * ListManager - 通用列表管理工具
 * 
 * 功能：
 * - 统一的列表搜索、排序、过滤
 * - 减少重复的列表管理代码
 * - 支持泛型，适用于任何数据类型
 */

export interface ListManagerOptions<T> {
  items: T[];
  searchFields?: (keyof T)[];
  sortField?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

export class ListManager<T> {
  items: T[] = [];
  filteredItems: T[] = [];
  searchTerm: string = '';
  sortBy: keyof T | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  searchFields: (keyof T)[] = [];

  constructor(options?: ListManagerOptions<T>) {
    if (options) {
      this.items = options.items || [];
      this.searchFields = options.searchFields || [];
      this.sortBy = options.sortField || null;
      this.sortOrder = options.sortOrder || 'asc';
      this.filteredItems = [...this.items];
    }
  }

  /**
   * 设置数据项
   */
  setItems(items: T[]): void {
    this.items = items;
    this.applyFilters();
  }

  /**
   * 搜索
   */
  search(term: string, fields?: (keyof T)[]): T[] {
    this.searchTerm = term.toLowerCase();
    if (fields) {
      this.searchFields = fields;
    }
    this.applyFilters();
    return this.filteredItems;
  }

  /**
   * 排序
   */
  sort(field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    this.sortBy = field;
    this.sortOrder = order;
    this.applyFilters();
    return this.filteredItems;
  }

  /**
   * 过滤
   */
  filter(predicate: (item: T) => boolean): T[] {
    this.filteredItems = this.items.filter(predicate);
    this.applySort();
    return this.filteredItems;
  }

  /**
   * 应用所有过滤和排序
   */
  private applyFilters(): void {
    let result = [...this.items];

    // 应用搜索
    if (this.searchTerm && this.searchFields.length > 0) {
      result = result.filter(item => {
        return this.searchFields.some(field => {
          const value = String(item[field] || '').toLowerCase();
          return value.includes(this.searchTerm);
        });
      });
    }

    // 应用排序
    if (this.sortBy) {
      result.sort((a, b) => {
        const aVal = a[this.sortBy as keyof T];
        const bVal = b[this.sortBy as keyof T];

        if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredItems = result;
  }

  /**
   * 应用排序
   */
  private applySort(): void {
    if (this.sortBy) {
      this.filteredItems.sort((a, b) => {
        const aVal = a[this.sortBy as keyof T];
        const bVal = b[this.sortBy as keyof T];

        if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  /**
   * 获取过滤后的项目
   */
  getFiltered(): T[] {
    return this.filteredItems;
  }

  /**
   * 获取所有项目
   */
  getAll(): T[] {
    return this.items;
  }

  /**
   * 获取项目数量
   */
  count(): number {
    return this.filteredItems.length;
  }

  /**
   * 获取总项目数
   */
  totalCount(): number {
    return this.items.length;
  }

  /**
   * 清空
   */
  clear(): void {
    this.items = [];
    this.filteredItems = [];
    this.searchTerm = '';
    this.sortBy = null;
  }

  /**
   * 重置过滤和排序
   */
  reset(): void {
    this.searchTerm = '';
    this.sortBy = null;
    this.filteredItems = [...this.items];
  }

  /**
   * 分页
   */
  paginate(page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return this.filteredItems.slice(start, end);
  }

  /**
   * 获取分页信息
   */
  getPaginationInfo(page: number, pageSize: number): {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const total = this.filteredItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const items = this.paginate(page, pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}


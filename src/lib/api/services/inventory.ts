/**
 * 库存 API 服务
 */

import { apiClient } from '../client';

export interface Inventory {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseLocation?: string;
  lastRestockDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface InventoryLog {
  id: string;
  companyId: string;
  inventoryId: string;
  type: string;
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface UpdateInventoryRequest {
  quantity: number;
  warehouseLocation?: string;
}

export interface AdjustInventoryRequest {
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 库存服务
 */
export const inventoryService = {
  /**
   * 获取库存列表
   */
  async getInventories(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Inventory>> {
    const response = await apiClient.get<PaginatedResponse<Inventory>>(
      `/api/v1/inventory?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * 获取单个库存
   */
  async getInventory(id: string): Promise<Inventory> {
    const response = await apiClient.get<Inventory>(`/api/v1/inventory/${id}`);
    return response.data!;
  },

  /**
   * 获取库存日志
   */
  async getInventoryLogs(inventoryId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<InventoryLog>> {
    const response = await apiClient.get<PaginatedResponse<InventoryLog>>(
      `/api/v1/inventory/${inventoryId}/logs?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * 更新库存
   */
  async updateInventory(id: string, request: UpdateInventoryRequest): Promise<Inventory> {
    const response = await apiClient.put<Inventory>(`/api/v1/inventory/${id}`, request);
    return response.data!;
  },

  /**
   * 调整库存
   */
  async adjustInventory(id: string, request: AdjustInventoryRequest): Promise<Inventory> {
    const response = await apiClient.post<Inventory>(`/api/v1/inventory/${id}/adjust`, request);
    return response.data!;
  },

  /**
   * 搜索库存
   */
  async searchInventories(keyword: string): Promise<Inventory[]> {
    const response = await apiClient.get<Inventory[]>(
      `/api/v1/inventory/search?keyword=${encodeURIComponent(keyword)}`
    );
    return response.data || [];
  },

  /**
   * 获取库存统计
   */
  async getInventoryStats(): Promise<any> {
    const response = await apiClient.get<any>('/api/v1/inventory/stats');
    return response.data!;
  },
};


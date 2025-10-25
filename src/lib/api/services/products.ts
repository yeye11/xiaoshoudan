/**
 * 产品 API 服务
 */

import { apiClient } from '../client';

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  unitPrice: number;
  costPrice?: number;
  specs?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  unitPrice: number;
  costPrice?: number;
  specs?: string;
  description?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 产品服务
 */
export const productService = {
  /**
   * 获取产品列表
   */
  async getProducts(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      `/api/v1/products?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * 获取单个产品
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/v1/products/${id}`);
    return response.data!;
  },

  /**
   * 创建产品
   */
  async createProduct(request: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/api/v1/products', request);
    return response.data!;
  },

  /**
   * 更新产品
   */
  async updateProduct(id: string, request: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/api/v1/products/${id}`, request);
    return response.data!;
  },

  /**
   * 删除产品
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/products/${id}`);
  },

  /**
   * 搜索产品
   */
  async searchProducts(keyword: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `/api/v1/products/search?keyword=${encodeURIComponent(keyword)}`
    );
    return response.data || [];
  },
};


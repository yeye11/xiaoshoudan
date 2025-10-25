/**
 * 客户 API 服务
 */

import { apiClient } from '../client';

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 客户服务
 */
export const customerService = {
  /**
   * 获取客户列表
   */
  async getCustomers(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<PaginatedResponse<Customer>>(
      `/api/v1/customers?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * 获取单个客户
   */
  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/api/v1/customers/${id}`);
    return response.data!;
  },

  /**
   * 创建客户
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/api/v1/customers', request);
    return response.data!;
  },

  /**
   * 更新客户
   */
  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/api/v1/customers/${id}`, request);
    return response.data!;
  },

  /**
   * 删除客户
   */
  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/customers/${id}`);
  },

  /**
   * 搜索客户
   */
  async searchCustomers(keyword: string): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>(
      `/api/v1/customers/search?keyword=${encodeURIComponent(keyword)}`
    );
    return response.data || [];
  },
};


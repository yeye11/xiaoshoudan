/**
 * 销售单 API 服务
 */

import { apiClient } from '../client';

export interface SalesItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
}

export interface SalesInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  notes?: string;
  items: SalesItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: string;
}

export interface CreateSalesItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesInvoiceRequest {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  items: CreateSalesItemRequest[];
}

export interface UpdateSalesInvoiceRequest extends Partial<CreateSalesInvoiceRequest> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 销售单服务
 */
export const salesService = {
  /**
   * 获取销售单列表
   */
  async getSalesInvoices(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<SalesInvoice>> {
    const response = await apiClient.get<PaginatedResponse<SalesInvoice>>(
      `/api/v1/sales?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * 获取单个销售单
   */
  async getSalesInvoice(id: string): Promise<SalesInvoice> {
    const response = await apiClient.get<SalesInvoice>(`/api/v1/sales/${id}`);
    return response.data!;
  },

  /**
   * 创建销售单
   */
  async createSalesInvoice(request: CreateSalesInvoiceRequest): Promise<SalesInvoice> {
    const response = await apiClient.post<SalesInvoice>('/api/v1/sales', request);
    return response.data!;
  },

  /**
   * 更新销售单
   */
  async updateSalesInvoice(id: string, request: UpdateSalesInvoiceRequest): Promise<SalesInvoice> {
    const response = await apiClient.put<SalesInvoice>(`/api/v1/sales/${id}`, request);
    return response.data!;
  },

  /**
   * 删除销售单
   */
  async deleteSalesInvoice(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/sales/${id}`);
  },

  /**
   * 提交销售单
   */
  async submitSalesInvoice(id: string): Promise<SalesInvoice> {
    const response = await apiClient.post<SalesInvoice>(`/api/v1/sales/${id}/submit`, {});
    return response.data!;
  },

  /**
   * 搜索销售单
   */
  async searchSalesInvoices(keyword: string): Promise<SalesInvoice[]> {
    const response = await apiClient.get<SalesInvoice[]>(
      `/api/v1/sales/search?keyword=${encodeURIComponent(keyword)}`
    );
    return response.data || [];
  },
};


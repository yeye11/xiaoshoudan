/**
 * TypeScript 类型定义
 */

import { Request } from 'express';

/**
 * 认证用户信息
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

/**
 * 扩展的 Express Request
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
  companyId?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 创建销售单请求
 */
export interface CreateSalesInvoiceRequest {
  customerId: string;
  date: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

/**
 * 创建客户请求
 */
export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  creditLimit?: number;
  address?: string;
}

/**
 * 创建产品请求
 */
export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  unit?: string;
  specs?: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company?: string;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token 刷新请求
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token 刷新响应
 */
export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

/**
 * 查询选项
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * 更新选项
 */
export interface UpdateOptions {
  where: Record<string, any>;
  data: Record<string, any>;
}

/**
 * 删除选项
 */
export interface DeleteOptions {
  where: Record<string, any>;
}

/**
 * 报表数据
 */
export interface ReportData {
  date: string;
  value: number;
  [key: string]: any;
}

/**
 * 销售报表
 */
export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  averageOrderValue: number;
  dailyData: ReportData[];
}

/**
 * 客户分析
 */
export interface CustomerAnalysis {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSales: number;
  }>;
}

/**
 * 产品分析
 */
export interface ProductAnalysis {
  topProducts: Array<{
    id: string;
    name: string;
    salesCount: number;
    totalSales: number;
  }>;
}


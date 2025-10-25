/**
 * API 客户端 - 统一的 HTTP 请求管理
 * 
 * 功能：
 * - HTTP 请求管理（GET、POST、PUT、DELETE）
 * - Token 管理（设置、获取、清除）
 * - 错误处理
 * - 请求拦截
 * - 响应拦截
 */

import { writable } from 'svelte/store';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// 错误类型
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: number,
    public message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API 客户端类
 */
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  public isLoading = writable(false);
  public error = writable<ApiError | null>(null);

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // 从 localStorage 恢复 token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * 设置 Token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * 清除 Token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * 发送请求
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 添加认证 Token
    if (this.token && !options?.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData: ApiResponse<T> = await response.json();

      if (!response.ok) {
        const apiError = new ApiError(
          response.status,
          responseData.code || response.status,
          responseData.message || response.statusText,
          responseData.errors
        );
        this.error.set(apiError);
        throw apiError;
      }

      return responseData;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      const apiError = new ApiError(500, 500, err instanceof Error ? err.message : '未知错误');
      this.error.set(apiError);
      throw apiError;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(endpoint: string, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(endpoint: string, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
}

// 导出全局 API 客户端实例
export const apiClient = new ApiClient();


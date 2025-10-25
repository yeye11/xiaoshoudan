/**
 * 认证服务 - 用户认证相关 API
 * 
 * 功能：
 * - 用户注册
 * - 用户登录
 * - 获取当前用户信息
 * - 刷新 Token
 * - 用户登出
 */

import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户注册
   */
  async register(request: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/register',
      request,
      { skipAuth: true }
    );

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response.data!;
  },

  /**
   * 用户登录
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      request,
      { skipAuth: true }
    );

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response.data!;
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data!;
  },

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response.data!;
  },

  /**
   * 用户登出
   */
  logout(): void {
    apiClient.clearToken();
  },

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return apiClient.getToken();
  },
};


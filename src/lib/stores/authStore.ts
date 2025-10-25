/**
 * 认证 Store - 管理用户认证状态
 * 
 * 功能：
 * - 用户登录状态
 * - 用户信息
 * - Token 管理
 * - 加载状态
 * - 错误状态
 */

import { writable, derived } from 'svelte/store';
import { authService, type User, type LoginResponse } from '$lib/api/auth';

// 用户信息 Store
export const user = writable<User | null>(null);

// 登录状态 Store
export const isLoggedIn = derived(user, $user => $user !== null);

// 加载状态 Store
export const isLoading = writable(false);

// 错误信息 Store
export const error = writable<string | null>(null);

/**
 * 初始化认证状态
 * 在应用启动时调用，检查是否有有效的 Token
 */
export async function initializeAuth(): Promise<void> {
  try {
    isLoading.set(true);
    error.set(null);

    if (authService.isAuthenticated()) {
      const currentUser = await authService.getCurrentUser();
      user.set(currentUser);
    }
  } catch (err) {
    error.set(err instanceof Error ? err.message : '初始化认证失败');
    authService.logout();
    user.set(null);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 用户注册
 */
export async function register(
  email: string,
  password: string,
  name: string,
  company?: string
): Promise<LoginResponse> {
  try {
    isLoading.set(true);
    error.set(null);

    const response = await authService.register({
      email,
      password,
      name,
      company,
    });

    // 获取用户信息
    const currentUser = await authService.getCurrentUser();
    user.set(currentUser);

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : '注册失败';
    error.set(message);
    throw err;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 用户登录
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    isLoading.set(true);
    error.set(null);

    const response = await authService.login({
      email,
      password,
    });

    // 获取用户信息
    const currentUser = await authService.getCurrentUser();
    user.set(currentUser);

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    error.set(message);
    throw err;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 用户登出
 */
export function logout(): void {
  authService.logout();
  user.set(null);
  error.set(null);
}

/**
 * 清除错误信息
 */
export function clearError(): void {
  error.set(null);
}


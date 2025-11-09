/**
 * 移动端导航辅助工具
 * 跟踪导航历史，避免循环
 */

import { writable } from 'svelte/store';

/**
 * 导航历史栈
 * 记录最近访问的页面路径
 */
const navigationHistory = writable<string[]>([]);

/**
 * 添加页面到导航历史
 */
export function pushNavigationHistory(path: string) {
  navigationHistory.update(history => {
    // 避免连续重复的路径
    if (history.length > 0 && history[history.length - 1] === path) {
      return history;
    }
    // 保留最近的10个页面
    const newHistory = [...history, path];
    return newHistory.slice(-10);
  });
}

/**
 * 获取上一个页面路径（避免循环）
 */
export function getPreviousPage(currentPath: string): string | null {
  let history: string[] = [];
  navigationHistory.subscribe(h => history = h)();

  // 从历史记录中找到上一个不同的页面
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] !== currentPath) {
      return history[i];
    }
  }

  return null;
}

/**
 * 获取默认的返回路径
 * 如果没有上一个页面，返回主页
 */
export function getDefaultBackPath(currentPath: string): string {
  // 移除末尾的斜杠
  const path = currentPath.replace(/\/$/, '');

  // 定义默认的父级关系（当没有历史记录时使用）
  const defaultParents: Record<string, string> = {
    // 产品相关
    '/mobile/sales-management/products/new': '/mobile/sales-management/products',
    '/mobile/sales-management/products/select': '/mobile/sales-management/sales/new',
    '/mobile/sales-management/products': '/mobile',

    // 客户相关
    '/mobile/sales-management/customers/new': '/mobile/sales-management/customers',
    '/mobile/sales-management/customers': '/mobile',

    // 销售单相关
    '/mobile/sales-management/sales/new': '/mobile/sales-management/sales',
    '/mobile/sales-management/sales': '/mobile',

    // 数据、服务、个人资料
    '/mobile/sales-management/data': '/mobile',
    '/mobile/service': '/mobile',
    '/mobile/profile': '/mobile',

    // 设置相关
    '/mobile/settings/tags-specs': '/mobile/sales-management/products',

    // 管理相关
    '/mobile/admin/clean-default-specs': '/mobile/sales-management/products',
    '/mobile/admin/cleanup': '/mobile/sales-management/products',
    '/mobile/admin/remove-default-specs': '/mobile/sales-management/products',

    // 视频工具
    '/mobile/video-tools/tools': '/mobile',
  };

  // 检查是否有特殊定义的父级
  if (defaultParents[path]) {
    return defaultParents[path];
  }

  // 处理动态路由（包含 UUID 的路径）
  // 匹配 /mobile/sales-management/products/[uuid]
  if (/^\/mobile\/sales-management\/products\/[a-f0-9-]{36}$/.test(path)) {
    return '/mobile/sales-management/products';
  }

  // 匹配 /mobile/sales-management/customers/[uuid]
  if (/^\/mobile\/sales-management\/customers\/[a-f0-9-]{36}$/.test(path)) {
    return '/mobile/sales-management/customers';
  }

  // 匹配 /mobile/sales-management/customers/[uuid]/edit
  if (/^\/mobile\/sales-management\/customers\/[a-f0-9-]{36}\/edit$/.test(path)) {
    const uuid = path.match(/\/mobile\/sales-management\/customers\/([a-f0-9-]{36})\/edit/)?.[1];
    return `/mobile/sales-management/customers/${uuid}`;
  }

  // 匹配 /mobile/sales-management/sales/[uuid]
  if (/^\/mobile\/sales-management\/sales\/[a-f0-9-]{36}$/.test(path)) {
    return '/mobile/sales-management/sales';
  }

  // 匹配 /mobile/sales-management/sales/[uuid]/edit
  if (/^\/mobile\/sales-management\/sales\/[a-f0-9-]{36}\/edit$/.test(path)) {
    const uuid = path.match(/\/mobile\/sales-management\/sales\/([a-f0-9-]{36})\/edit/)?.[1];
    return `/mobile/sales-management/sales/${uuid}`;
  }

  // 匹配 /mobile/sales-management/delivery/[uuid]
  if (/^\/mobile\/sales-management\/delivery\/[a-f0-9-]{36}$/.test(path)) {
    return '/mobile/sales-management/sales';
  }

  // 默认：返回主页
  return '/mobile';
}


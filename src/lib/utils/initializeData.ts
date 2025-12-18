/**
 * 初始化默认数据（禁用）
 * 根据需求：不再自动创建“默认客户”和“默认产品”。
 */
export function initializeDefaultData() {
  // 已按需求禁用默认数据初始化，避免清空数据后再次出现默认项。
}

/**
 * 获取当前登录用户名称
 * 从“我的资料”(localStorage.user_info) 读取 name；若无则返回空字符串（不再使用“经理”兜底）
 */
export function getCurrentUserName(): string {
  try {
    const stored = localStorage.getItem('user_info');
    if (stored) {
      const u = JSON.parse(stored);
      return (u?.name && String(u.name).trim()) || '';
    }
  } catch (e) {
    console.warn('读取 user_info 失败', e);
  }
  return '';
}


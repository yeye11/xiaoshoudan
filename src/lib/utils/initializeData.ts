/**
 * 初始化默认数据（禁用）
 * 根据需求：不再自动创建“默认客户”和“默认产品”。
 */
import { StorageManager } from '$lib/utils/storage';

const DEFAULT_USER_INFO = {
  name: '张总',
  company: '佛山市仁腾装饰材料有限公司',
  companies: ['佛山市仁腾装饰材料有限公司'],
  phone: '18575852698',
  address: '佛山市南海盐步大转弯夹板装饰第五期C1座12号',
  addresses: ['佛山市南海盐步大转弯夹板装饰第五期C1座12号'],
  email: '',
  avatar: ''
};

const normalizeAddressList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const normalizeUserInfo = (raw: Record<string, any>) => {
  const companiesFromRaw = normalizeAddressList(raw?.companies);
  const companyFromRaw = normalizeAddressList(raw?.company);
  const normalizedCompanies = [...new Set([...companiesFromRaw, ...companyFromRaw])];
  const finalCompanies = normalizedCompanies.length > 0
    ? normalizedCompanies
    : DEFAULT_USER_INFO.companies;

  const addressesFromRaw = normalizeAddressList(raw?.addresses);
  const addressFromRaw = normalizeAddressList(raw?.address);
  const normalizedAddresses = [...new Set([...addressesFromRaw, ...addressFromRaw])];
  const finalAddresses = normalizedAddresses.length > 0
    ? normalizedAddresses
    : DEFAULT_USER_INFO.addresses;

  return {
    ...DEFAULT_USER_INFO,
    ...raw,
    companies: finalCompanies,
    company: finalCompanies[0] || '',
    addresses: finalAddresses,
    address: finalAddresses[0] || ''
  };
};

export function initializeDefaultData() {
  // 已按需求禁用默认客户/产品初始化，仅兜底用户资料，避免销售单页拿不到地址。
  try {
    const existingUserInfo = StorageManager.getUserInfo() || {};
    const nextUserInfo = normalizeUserInfo(existingUserInfo);
    const isChanged = JSON.stringify(existingUserInfo) !== JSON.stringify(nextUserInfo);
    if (isChanged) {
      StorageManager.saveUserInfo(nextUserInfo);
    }
  } catch (error) {
    console.warn('初始化默认用户资料失败:', error);
  }
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

/**
 * 客户购买历史管理工具
 * 用于记录和获取每个客户对每个产品的最后购买信息
 */

export interface CustomerProductHistory {
  customerId: string;
  productId: string;
  lastPurchase: {
    unitPrice: number;
    unit: string;
    specification: string;
    quantity: number;
    date: string; // ISO 8601 格式
  };
}

const STORAGE_KEY = 'customer_product_history';

/**
 * 获取所有客户购买历史
 */
function getAllHistory(): CustomerProductHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('读取客户购买历史失败:', e);
    return [];
  }
}

/**
 * 保存所有客户购买历史
 */
function saveAllHistory(history: CustomerProductHistory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('保存客户购买历史失败:', e);
  }
}

/**
 * 获取特定客户对特定产品的最后购买信息
 */
export function getCustomerProductHistory(
  customerId: string,
  productId: string
): CustomerProductHistory['lastPurchase'] | null {
  if (!customerId || !productId) return null;

  const allHistory = getAllHistory();
  const record = allHistory.find(
    h => h.customerId === customerId && h.productId === productId
  );

  return record?.lastPurchase || null;
}

/**
 * 保存客户对产品的购买信息
 */
export function saveCustomerProductHistory(
  customerId: string,
  productId: string,
  purchaseInfo: {
    unitPrice: number;
    unit: string;
    specification: string;
    quantity: number;
  }
): void {
  if (!customerId || !productId) return;

  const allHistory = getAllHistory();
  const existingIndex = allHistory.findIndex(
    h => h.customerId === customerId && h.productId === productId
  );

  const newRecord: CustomerProductHistory = {
    customerId,
    productId,
    lastPurchase: {
      ...purchaseInfo,
      date: new Date().toISOString()
    }
  };

  if (existingIndex >= 0) {
    // 更新现有记录
    allHistory[existingIndex] = newRecord;
  } else {
    // 添加新记录
    allHistory.push(newRecord);
  }

  saveAllHistory(allHistory);
  console.log('💾 保存客户购买历史:', customerId, productId, purchaseInfo);
}

/**
 * 批量保存客户购买历史（用于保存整个订单）
 */
export function saveCustomerOrderHistory(
  customerId: string,
  items: Array<{
    productId: string;
    unitPrice: number;
    unit: string;
    specification: string;
    quantity: number;
  }>
): void {
  if (!customerId || !items || items.length === 0) return;

  items.forEach(item => {
    saveCustomerProductHistory(customerId, item.productId, {
      unitPrice: item.unitPrice,
      unit: item.unit,
      specification: item.specification,
      quantity: item.quantity
    });
  });

  console.log(`💾 批量保存客户购买历史: 客户 ${customerId}, ${items.length} 个产品`);
}

/**
 * 获取客户的所有购买历史
 */
export function getCustomerAllHistory(customerId: string): CustomerProductHistory[] {
  if (!customerId) return [];

  const allHistory = getAllHistory();
  return allHistory.filter(h => h.customerId === customerId);
}

/**
 * 清除特定客户的购买历史
 */
export function clearCustomerHistory(customerId: string): void {
  if (!customerId) return;

  const allHistory = getAllHistory();
  const filtered = allHistory.filter(h => h.customerId !== customerId);
  saveAllHistory(filtered);
  console.log('🗑️ 清除客户购买历史:', customerId);
}

/**
 * 清除所有购买历史
 */
export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ 清除所有客户购买历史');
}


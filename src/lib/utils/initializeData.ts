import type { Customer, Product } from '$lib/types/invoice';

/**
 * 初始化默认数据
 * 如果 localStorage 中没有客户和产品数据，则创建默认数据
 */
export function initializeDefaultData() {
  initializeDefaultCustomer();
  initializeDefaultProduct();
}

/**
 * 初始化默认客户
 */
function initializeDefaultCustomer() {
  try {
    const stored = localStorage.getItem('customers');
    const customers: Customer[] = stored ? JSON.parse(stored) : [];

    // 如果已经有客户数据，不创建默认客户
    if (customers.length > 0) {
      console.log('✅ 已有客户数据，跳过默认客户创建');
      return;
    }

    // 创建默认客户
    const defaultCustomer: Customer = {
      id: crypto.randomUUID(),
      name: '默认客户',
      category: '普通客户',
      initialDebt: 0,
      phone: '13800138000',
      backupPhone: '',
      address: '广州市天河区珠江新城',
      fax: '',
      email: '',
      notes: '这是系统自动创建的默认客户，您可以修改或删除',
      images: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    customers.push(defaultCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    console.log('✅ 默认客户已创建:', defaultCustomer.name);

    // 同时初始化客户分类
    const storedCategories = localStorage.getItem('customer_categories');
    if (!storedCategories) {
      const defaultCategories = ['普通客户', '重要客户', 'VIP客户'];
      localStorage.setItem('customer_categories', JSON.stringify(defaultCategories));
      console.log('✅ 默认客户分类已创建');
    }
  } catch (error) {
    console.error('❌ 初始化默认客户失败:', error);
  }
}

/**
 * 初始化默认产品
 */
function initializeDefaultProduct() {
  try {
    const stored = localStorage.getItem('products');
    const products: Product[] = stored ? JSON.parse(stored) : [];

    // 如果已经有产品数据，不创建默认产品
    if (products.length > 0) {
      console.log('✅ 已有产品数据，跳过默认产品创建');
      return;
    }

    // 创建默认产品
    const defaultProduct: Product = {
      id: crypto.randomUUID(),
      name: '默认产品',
      barcode: '',
      category: '装饰材料',
      specifications: [],
      attributes: [],
      unit: '件',
      prices: [
        {
          id: crypto.randomUUID(),
          type: 'sale',
          price: 100,
          isDefault: true
        }
      ],
      tags: [],
      notes: '这是系统自动创建的默认产品，您可以修改或删除',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    products.push(defaultProduct);
    localStorage.setItem('products', JSON.stringify(products));
    console.log('✅ 默认产品已创建:', defaultProduct.name);

    // 同时初始化产品分类
    const storedCategories = localStorage.getItem('product_categories');
    if (!storedCategories) {
      const defaultCategories = ['装饰材料', '五金配件', '工具设备'];
      localStorage.setItem('product_categories', JSON.stringify(defaultCategories));
      console.log('✅ 默认产品分类已创建');
    }

    // 初始化单位选项
    const storedUnits = localStorage.getItem('product_units');
    if (!storedUnits) {
      const defaultUnits = ['张', '件', '米', '平方米', '箱', '包', '套'];
      localStorage.setItem('product_units', JSON.stringify(defaultUnits));
      console.log('✅ 默认单位选项已创建');
    }
  } catch (error) {
    console.error('❌ 初始化默认产品失败:', error);
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


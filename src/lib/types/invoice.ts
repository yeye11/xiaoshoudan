// 销售单相关的类型定义

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxId?: string;
}

// 扩展的客户信息类型
export interface Customer {
  id: string;
  name: string;
  category: string;
  initialDebt: number; // 期初欠款
  phone: string;
  backupPhone?: string; // 备用电话
  address?: string;
  fax?: string; // 传真
  email?: string;
  notes?: string; // 备注
  images?: string[]; // 图片
  attachments?: string[]; // 附件
  createdAt: string;
  updatedAt: string;
  isActive: boolean; // 是否启用
}

// 客户分类
export interface CustomerCategory {
  id: string;
  name: string;
  description?: string;
}

// 简化的客户信息（用于销售单）
export interface CustomerInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// 产品信息
export interface Product {
  id: string;
  name: string;
  barcode?: string; // 条形码
  category: string; // 产品分类
  specifications: ProductSpecification[]; // 规格型号
  attributes: ProductAttribute[]; // 属性管理
  unit: string; // 单位
  prices: ProductPrice[]; // 价格管理
  tags: string[]; // 标签
  notes?: string; // 备注
  images?: string[]; // 图片
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// 产品规格
export interface ProductSpecification {
  id: string;
  name: string; // 如 "1220*2440"
  isDefault: boolean;
}

// 产品属性
export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

// 产品价格
export interface ProductPrice {
  id: string;
  type: 'sale' | 'purchase' | 'wholesale'; // 销售价、采购价、批发价
  price: number;
  isDefault: boolean;
}

// 产品分类
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // 父分类ID，支持多级分类
}

// 扩展的销售单商品项目
export interface InvoiceItem {
  id: string;
  productId?: string; // 关联的产品ID
  productName: string;
  specification: string;
  unit: string;
  quantity: number; // 销售数量
  deliveryQuantity?: number; // 送货数量
  unitPrice: number;
  amount: number;
  note?: string;
}

// 库存信息
export interface Inventory {
  id: string;
  productId: string;
  specificationId: string;
  quantity: number; // 库存数量
  reservedQuantity: number; // 预留数量
  minStock: number; // 最小库存
  maxStock: number; // 最大库存
  location?: string; // 存放位置
  lastUpdated: string;
}

// 供应商信息
export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  backupPhone?: string;
  address?: string;
  fax?: string;
  email?: string;
  notes?: string;
  images?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// 扩展的销售单
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string; // 关联的客户ID
  customerInfo: CustomerInfo;
  companyInfo: CompanyInfo;
  items: InvoiceItem[];
  totalAmount: number;
  createdBy: string;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  type: 'sale' | 'purchase' | 'return'; // 销售单、采购单、退货单
  deliveryDate?: string; // 送货日期
  paymentStatus: 'unpaid' | 'partial' | 'paid'; // 付款状态
  paidAmount: number; // 已付金额
}

// 费用收入记录
export interface ExpenseIncome {
  id: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  attachments?: string[];
  notes?: string;
}

// 数据统计
export interface SalesStatistics {
  totalSales: number; // 总销售额
  totalPurchases: number; // 总采购额
  totalProfit: number; // 总利润
  totalDebt: number; // 总欠款
  customerCount: number; // 客户数量
  productCount: number; // 产品数量
  period: string; // 统计周期
}

// 搜索过滤条件
export interface SearchFilter {
  keyword?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  companyInfo: CompanyInfo;
  isDefault: boolean;
}

// 用于表单的类型
export interface InvoiceFormData {
  customerInfo: CustomerInfo;
  items: InvoiceItem[];
  createdBy: string;
  notes?: string;
}

// 用于生成新商品项目的默认值
export const createEmptyInvoiceItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  productName: '',
  specification: '',
  unit: '件',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  note: ''
});

// 用于生成新发票的默认值
export const createEmptyInvoice = (companyInfo: CompanyInfo): Invoice => ({
  id: crypto.randomUUID(),
  invoiceNumber: generateInvoiceNumber(),
  date: new Date().toISOString().split('T')[0],
  customerInfo: {
    name: '',
    address: '',
    phone: '',
    email: ''
  },
  companyInfo,
  items: [createEmptyInvoiceItem()],
  totalAmount: 0,
  createdBy: '',
  status: 'draft',
  type: 'sale',
  paymentStatus: 'unpaid',
  paidAmount: 0
});

// 生成发票编号
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-4);
  return `INV${year}${month}${day}${time}`;
};

// 计算商品项目金额
export const calculateItemAmount = (quantity: number, unitPrice: number): number => {
  return Math.round(quantity * unitPrice * 100) / 100;
};

// 计算发票总金额
export const calculateTotalAmount = (items: InvoiceItem[]): number => {
  return Math.round(items.reduce((total, item) => total + item.amount, 0) * 100) / 100;
};

// 格式化金额显示
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

// 验证发票数据
export const validateInvoice = (invoice: Invoice): string[] => {
  const errors: string[] = [];
  
  if (!invoice.customerInfo.name.trim()) {
    errors.push('客户名称不能为空');
  }
  
  if (!invoice.createdBy.trim()) {
    errors.push('制单人不能为空');
  }
  
  if (invoice.items.length === 0) {
    errors.push('至少需要一个商品项目');
  }
  
  invoice.items.forEach((item, index) => {
    if (!item.productName.trim()) {
      errors.push(`第${index + 1}行商品名称不能为空`);
    }
    if (item.quantity <= 0) {
      errors.push(`第${index + 1}行数量必须大于0`);
    }
    if (item.unitPrice < 0) {
      errors.push(`第${index + 1}行单价不能为负数`);
    }
  });
  
  return errors;
};

// 创建空的客户对象
export const createEmptyCustomer = (): Customer => ({
  id: crypto.randomUUID(),
  name: '',
  category: '',
  initialDebt: 0,
  phone: '',
  backupPhone: '',
  address: '',
  fax: '',
  email: '',
  notes: '',
  images: [],
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
});

// 创建空的产品对象
export const createEmptyProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: '',
  barcode: '',
  category: '',
  specifications: [],
  attributes: [],
  unit: '件',
  prices: [],
  tags: [],
  notes: '',
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
});

// 创建空的产品规格
export const createEmptySpecification = (): ProductSpecification => ({
  id: crypto.randomUUID(),
  name: '',
  isDefault: false
});

// 创建空的产品价格
export const createEmptyPrice = (type: 'sale' | 'purchase' | 'wholesale' = 'sale'): ProductPrice => ({
  id: crypto.randomUUID(),
  type,
  price: 0,
  isDefault: type === 'sale'
});

// 获取产品的默认价格
export const getProductDefaultPrice = (product: Product, type: 'sale' | 'purchase' | 'wholesale' = 'sale'): number => {
  const price = product.prices.find(p => p.type === type && p.isDefault);
  return price ? price.price : 0;
};

// 获取产品的默认规格
export const getProductDefaultSpecification = (product: Product): string => {
  const spec = product.specifications.find(s => s.isDefault);
  return spec ? spec.name : '';
};

// 计算客户总欠款
export const calculateCustomerDebt = (customer: Customer, invoices: Invoice[]): number => {
  const customerInvoices = invoices.filter(inv => inv.customerId === customer.id && inv.paymentStatus !== 'paid');
  const totalUnpaid = customerInvoices.reduce((total, inv) => total + (inv.totalAmount - inv.paidAmount), 0);
  return customer.initialDebt + totalUnpaid;
};

// 格式化电话号码
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // 简单的电话号码格式化，可以根据需要扩展
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

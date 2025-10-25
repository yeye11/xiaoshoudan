/**
 * 应用常量
 */

/**
 * 用户角色
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALESMAN: 'salesman',
} as const;

/**
 * 用户状态
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

/**
 * 销售单状态
 */
export const SALES_INVOICE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * 支付状态
 */
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
} as const;

/**
 * 客户分类
 */
export const CUSTOMER_CATEGORY = {
  VIP: 'VIP',
  NORMAL: '普通',
  POTENTIAL: '潜在',
} as const;

/**
 * 客户状态
 */
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLACKLIST: 'blacklist',
} as const;

/**
 * 产品状态
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
} as const;

/**
 * 库存操作类型
 */
export const INVENTORY_TYPE = {
  IN: 'in',
  OUT: 'out',
  ADJUST: 'adjust',
  RETURN: 'return',
} as const;

/**
 * 支付方式
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CREDIT_CARD: 'credit_card',
  OTHER: 'other',
} as const;

/**
 * 审计操作类型
 */
export const AUDIT_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

/**
 * 审计资源类型
 */
export const AUDIT_RESOURCE_TYPE = {
  SALES_INVOICE: 'sales_invoice',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  USER: 'user',
  PAYMENT: 'payment',
} as const;

/**
 * 订阅计划
 */
export const SUBSCRIPTION_PLAN = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

/**
 * 订阅状态
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
} as const;

/**
 * 分页默认值
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * 排序方向
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * 时间格式
 */
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
} as const;

/**
 * 缓存键前缀
 */
export const CACHE_KEYS = {
  USER: 'user:',
  CUSTOMER: 'customer:',
  PRODUCT: 'product:',
  SALES_INVOICE: 'sales_invoice:',
  INVENTORY: 'inventory:',
} as const;

/**
 * 缓存过期时间 (秒)
 */
export const CACHE_TTL = {
  SHORT: 300, // 5 分钟
  MEDIUM: 3600, // 1 小时
  LONG: 86400, // 1 天
} as const;


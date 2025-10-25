/**
 * 统一的 API 响应格式
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * 成功响应
 */
export const successResponse = <T>(
  data: T,
  message: string = '成功'
): ApiResponse<T> => ({
  code: 0,
  message,
  data,
});

/**
 * 错误响应
 */
export const errorResponse = (
  code: number,
  message: string,
  errors?: Array<{ field?: string; message: string }>
): ApiResponse => ({
  code,
  message,
  errors,
});

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  // 认证相关
  INVALID_CREDENTIALS: '邮箱或密码错误',
  USER_NOT_FOUND: '用户不存在',
  USER_ALREADY_EXISTS: '用户已存在',
  UNAUTHORIZED: '未授权',
  TOKEN_EXPIRED: 'Token 已过期',
  INVALID_TOKEN: 'Token 无效',

  // 验证相关
  VALIDATION_ERROR: '验证失败',
  INVALID_EMAIL: '邮箱格式不正确',
  INVALID_PASSWORD: '密码格式不正确',
  REQUIRED_FIELD: '必填字段缺失',

  // 资源相关
  RESOURCE_NOT_FOUND: '资源不存在',
  RESOURCE_ALREADY_EXISTS: '资源已存在',
  RESOURCE_CONFLICT: '资源冲突',

  // 权限相关
  PERMISSION_DENIED: '权限不足',
  FORBIDDEN: '禁止访问',

  // 服务器相关
  INTERNAL_ERROR: '服务器内部错误',
  SERVICE_UNAVAILABLE: '服务暂时不可用',
} as const;


/**
 * 自定义错误类
 */

export class AppError extends Error {
  constructor(
    public code: number,
    public message: string,
    public statusCode: number = 400,
    public errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(
    message: string = '验证失败',
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(400, message, 400, errors);
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '未授权') {
    super(401, message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(403, message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * 资源不存在错误
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(404, message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(409, message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 服务器错误
 */
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(500, message, 500);
    this.name = 'InternalServerError';
  }
}

/**
 * 检查错误是否是 AppError
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

/**
 * 获取错误消息
 */
export const getErrorMessage = (error: any): string => {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '未知错误';
};

/**
 * 获取错误状态码
 */
export const getErrorStatusCode = (error: any): number => {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
};


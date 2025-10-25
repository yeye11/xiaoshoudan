/**
 * 异步错误处理包装器
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 包装异步路由处理器，捕获错误并传递给错误处理中间件
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


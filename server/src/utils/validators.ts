/**
 * 验证工具函数
 */

import Joi from 'joi';
import { ValidationError } from './errors';

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 * 要求: 至少 8 个字符，包含大小写字母、数字
 */
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 验证手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证 UUID
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * 使用 Joi 验证数据
 */
export const validateWithJoi = async (
  data: any,
  schema: Joi.ObjectSchema
): Promise<any> => {
  try {
    const value = await schema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    return value;
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err;
    }
    // Joi 的 validateAsync 在有错误时会抛出异常
    if (err && typeof err === 'object' && 'details' in err) {
      const errors = (err as any).details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw new ValidationError('验证失败', errors);
    }
    throw new ValidationError('验证失败');
  }
};

/**
 * 注册验证 Schema
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱必填',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': '密码至少 8 个字符',
      'any.required': '密码必填',
    }),
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': '名称最多 100 个字符',
      'any.required': '名称必填',
    }),
  company: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': '公司名称最多 100 个字符',
    }),
});

/**
 * 登录验证 Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱必填',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码必填',
    }),
});

/**
 * 创建销售单验证 Schema
 */
export const createSalesInvoiceSchema = Joi.object({
  customerId: Joi.string()
    .required()
    .messages({
      'any.required': '客户 ID 必填',
    }),
  date: Joi.date()
    .required()
    .messages({
      'any.required': '日期必填',
    }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
      })
    )
    .required()
    .messages({
      'any.required': '销售单项必填',
    }),
  notes: Joi.string()
    .max(500)
    .optional(),
});

/**
 * 创建客户验证 Schema
 */
export const createCustomerSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': '名称最多 100 个字符',
      'any.required': '名称必填',
    }),
  phone: Joi.string()
    .max(20)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  category: Joi.string()
    .max(50)
    .optional(),
  creditLimit: Joi.number()
    .min(0)
    .optional(),
  address: Joi.string()
    .optional(),
});

/**
 * 创建产品验证 Schema
 */
export const createProductSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required(),
  sku: Joi.string()
    .max(50)
    .required(),
  category: Joi.string()
    .max(50)
    .optional(),
  unitPrice: Joi.number()
    .positive()
    .required(),
  unit: Joi.string()
    .max(20)
    .optional(),
  specs: Joi.string()
    .optional(),
});


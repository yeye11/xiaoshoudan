/**
 * 验证工具函数 - 统一的表单验证逻辑
 *
 * 功能：
 * - 提供常用的验证函数
 * - 统一验证规则
 * - 减少重复的验证代码
 */

/**
 * 通用字符串长度验证
 */
const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string,
  required: boolean = true
): string | null => {
  if (!value || !value.trim()) {
    return required ? `请填写${fieldName}` : null;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return `${fieldName}至少需要 ${minLength} 个字符`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName}不能超过 ${maxLength} 个字符`;
  }
  return null;
};

/**
 * 通用正则表达式验证
 */
const validateRegex = (
  value: string,
  regex: RegExp,
  errorMessage: string,
  required: boolean = false
): string | null => {
  if (!value) {
    return required ? errorMessage : null;
  }
  if (!regex.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * 通用数字范围验证
 */
const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string,
  required: boolean = true
): string | null => {
  if (value === null || value === undefined) {
    return required ? `请填写${fieldName}` : null;
  }
  if (value < min) {
    return `${fieldName}不能小于 ${min}`;
  }
  if (value > max) {
    return `${fieldName}不能超过 ${max}`;
  }
  return null;
};

/**
 * 验证器对象 - 包含所有验证函数
 */
export const validators = {
  /**
   * 验证姓名
   */
  name: (value: string): string | null => validateStringLength(value, 2, 50, '姓名'),

  /**
   * 验证电话号码
   */
  phone: (value: string): string | null => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return validateRegex(value.replace(/\s/g, ''), phoneRegex, '请输入有效的电话号码', false);
  },

  /**
   * 验证邮箱
   */
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validateRegex(value, emailRegex, '请输入有效的邮箱地址', false);
  },

  /**
   * 验证地址
   */
  address: (value: string): string | null => validateStringLength(value, 5, 200, '地址', false),

  /**
   * 验证产品名称
   */
  productName: (value: string): string | null => validateStringLength(value, 2, 100, '产品名称'),

  /**
   * 验证数量
   */
  quantity: (value: number): string | null => {
    if (value === null || value === undefined) {
      return '请填写数量';
    }
    if (!Number.isInteger(value) || value <= 0) {
      return '数量必须是大于 0 的整数';
    }
    return null;
  },

  /**
   * 验证价格
   */
  price: (value: number): string | null => validateNumberRange(value, 0, 999999.99, '价格'),

  /**
   * 验证金额
   */
  amount: (value: number): string | null => validateNumberRange(value, 0, 9999999.99, '金额'),

  /**
   * 验证日期
   */
  date: (value: string): string | null => {
    if (!value) {
      return '请选择日期';
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return '日期格式不正确';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '日期无效';
    }
    return null;
  },

  /**
   * 验证备注
   */
  notes: (value: string): string | null => {
    if (!value) {
      return null; // 备注可选
    }
    if (value.length > 500) {
      return '备注不能超过 500 个字符';
    }
    return null;
  },

  /**
   * 验证分类
   */
  category: (value: string): string | null => {
    if (!value || !value.trim()) {
      return '请选择分类';
    }
    return null;
  },

  /**
   * 验证单位
   */
  unit: (value: string): string | null => {
    if (!value || !value.trim()) {
      return '请选择单位';
    }
    return null;
  },

  /**
   * 验证条形码
   */
  barcode: (value: string): string | null => {
    if (!value) {
      return null; // 条形码可选
    }
    if (value.length < 8 || value.length > 20) {
      return '条形码长度应在 8-20 之间';
    }
    return null;
  },

  /**
   * 验证规格
   */
  specification: (value: string): string | null => {
    if (!value) {
      return null; // 规格可选
    }
    if (value.length > 100) {
      return '规格不能超过 100 个字符';
    }
    return null;
  },

  /**
   * 验证标签
   */
  tags: (value: string[]): string | null => {
    if (!Array.isArray(value)) {
      return null;
    }
    if (value.length > 10) {
      return '标签不能超过 10 个';
    }
    for (const tag of value) {
      if (tag.length > 20) {
        return '单个标签不能超过 20 个字符';
      }
    }
    return null;
  }
};

/**
 * 验证表单对象
 * @param formData 表单数据
 * @param rules 验证规则
 * @returns 错误对象
 */
export function validateForm(
  formData: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(formData[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

/**
 * 检查是否有错误
 * @param errors 错误对象
 * @returns 是否有错误
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * 清除错误
 * @param errors 错误对象
 * @param fields 要清除的字段
 * @returns 新的错误对象
 */
export function clearErrors(
  errors: Record<string, string>,
  fields: string[]
): Record<string, string> {
  const newErrors = { ...errors };
  for (const field of fields) {
    delete newErrors[field];
  }
  return newErrors;
}


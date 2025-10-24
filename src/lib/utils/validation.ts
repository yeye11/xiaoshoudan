/**
 * 验证工具函数 - 统一的表单验证逻辑
 * 
 * 功能：
 * - 提供常用的验证函数
 * - 统一验证规则
 * - 减少重复的验证代码
 */

/**
 * 验证器对象 - 包含所有验证函数
 */
export const validators = {
  /**
   * 验证姓名
   */
  name: (value: string): string | null => {
    if (!value || !value.trim()) {
      return '请填写姓名';
    }
    if (value.trim().length < 2) {
      return '姓名至少需要 2 个字符';
    }
    if (value.trim().length > 50) {
      return '姓名不能超过 50 个字符';
    }
    return null;
  },

  /**
   * 验证电话号码
   */
  phone: (value: string): string | null => {
    if (!value) {
      return null; // 电话号码可选
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return '请输入有效的电话号码';
    }
    return null;
  },

  /**
   * 验证邮箱
   */
  email: (value: string): string | null => {
    if (!value) {
      return null; // 邮箱可选
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  },

  /**
   * 验证地址
   */
  address: (value: string): string | null => {
    if (!value) {
      return null; // 地址可选
    }
    if (value.trim().length < 5) {
      return '地址至少需要 5 个字符';
    }
    if (value.trim().length > 200) {
      return '地址不能超过 200 个字符';
    }
    return null;
  },

  /**
   * 验证产品名称
   */
  productName: (value: string): string | null => {
    if (!value || !value.trim()) {
      return '请填写产品名称';
    }
    if (value.trim().length < 2) {
      return '产品名称至少需要 2 个字符';
    }
    if (value.trim().length > 100) {
      return '产品名称不能超过 100 个字符';
    }
    return null;
  },

  /**
   * 验证数量
   */
  quantity: (value: number): string | null => {
    if (value === null || value === undefined) {
      return '请填写数量';
    }
    if (value <= 0) {
      return '数量必须大于 0';
    }
    if (!Number.isInteger(value)) {
      return '数量必须是整数';
    }
    return null;
  },

  /**
   * 验证价格
   */
  price: (value: number): string | null => {
    if (value === null || value === undefined) {
      return '请填写价格';
    }
    if (value < 0) {
      return '价格不能为负数';
    }
    if (value > 999999.99) {
      return '价格过高';
    }
    return null;
  },

  /**
   * 验证金额
   */
  amount: (value: number): string | null => {
    if (value === null || value === undefined) {
      return '请填写金额';
    }
    if (value < 0) {
      return '金额不能为负数';
    }
    if (value > 9999999.99) {
      return '金额过高';
    }
    return null;
  },

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


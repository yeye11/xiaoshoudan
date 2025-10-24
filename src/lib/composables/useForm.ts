/**
 * 通用表单处理组合函数
 * 
 * 功能：
 * - 统一的表单验证逻辑
 * - 统一的表单保存流程
 * - 统一的错误处理
 * - 支持自定义验证规则
 */

import { writable, type Writable } from 'svelte/store';

export interface FormConfig<T> {
  /** 初始数据 */
  initialData: T;
  /** 验证规则 */
  validators?: Record<string, (value: any) => string | null>;
  /** 保存回调函数 */
  onSave: (data: T) => Promise<void>;
  /** 保存成功回调 */
  onSuccess?: (data: T) => void;
  /** 保存失败回调 */
  onError?: (error: Error) => void;
}

export interface FormState<T> {
  data: Writable<T>;
  errors: Writable<Record<string, string>>;
  isSubmitting: Writable<boolean>;
  validateForm: () => boolean;
  validateField: (fieldName: string, value: any) => string | null;
  handleSave: () => Promise<void>;
  reset: () => void;
  setFieldError: (fieldName: string, error: string) => void;
  clearFieldError: (fieldName: string) => void;
}

/**
 * 创建表单状态管理
 */
export function useForm<T>(config: FormConfig<T>): FormState<T> {
  const data = writable<T>(config.initialData);
  const errors = writable<Record<string, string>>({});
  const isSubmitting = writable(false);

  /**
   * 验证单个字段
   */
  const validateField = (fieldName: string, value: any): string | null => {
    const validator = config.validators?.[fieldName];
    if (!validator) return null;
    return validator(value);
  };

  /**
   * 验证整个表单
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    let currentData: T;
    data.subscribe(d => {
      currentData = d;
    })();

    if (config.validators) {
      for (const [fieldName, validator] of Object.entries(config.validators)) {
        const value = (currentData as any)[fieldName];
        const error = validator(value);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      }
    }

    errors.set(newErrors);
    return isValid;
  };

  /**
   * 处理保存
   */
  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    isSubmitting.set(true);

    try {
      let currentData: T;
      data.subscribe(d => {
        currentData = d;
      })();

      await config.onSave(currentData!);
      config.onSuccess?.(currentData!);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.update(e => ({
        ...e,
        general: err.message || '保存失败，请重试'
      }));
      config.onError?.(err);
    } finally {
      isSubmitting.set(false);
    }
  };

  /**
   * 重置表单
   */
  const reset = (): void => {
    data.set(config.initialData);
    errors.set({});
  };

  /**
   * 设置字段错误
   */
  const setFieldError = (fieldName: string, error: string): void => {
    errors.update(e => ({
      ...e,
      [fieldName]: error
    }));
  };

  /**
   * 清除字段错误
   */
  const clearFieldError = (fieldName: string): void => {
    errors.update(e => {
      const newErrors = { ...e };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return {
    data,
    errors,
    isSubmitting,
    validateForm,
    validateField,
    handleSave,
    reset,
    setFieldError,
    clearFieldError
  };
}

/**
 * 创建带有重复检查的表单
 */
export function useFormWithDuplicateCheck<T extends { id?: string; name: string }>(
  config: FormConfig<T> & {
    checkDuplicate: (name: string, excludeId?: string) => boolean;
  }
): FormState<T> {
  const form = useForm(config);

  // 增强验证函数以检查重复
  const originalValidateForm = form.validateForm;
  form.validateForm = (): boolean => {
    const isValid = originalValidateForm();
    
    let currentData: T;
    form.data.subscribe(d => {
      currentData = d;
    })();

    if (isValid && config.checkDuplicate(currentData!.name, currentData!.id)) {
      form.setFieldError('name', '名称已存在');
      return false;
    }

    return isValid;
  };

  return form;
}


import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  // 接受 UUID 格式或者字母数字加连字符的组合
  // UUID v4 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // 或者接受字母、数字、连字符的组合（如 test-customer-123）
  const flexibleIdPattern = /^[a-zA-Z0-9-]+$/;

  return uuidPattern.test(param) || flexibleIdPattern.test(param);
};


import { redirect } from '@sveltejs/kit';

export const load = () => {
  // 将根路径重定向到移动端首页
  throw redirect(307, '/mobile');
};


import { redirect } from '@sveltejs/kit';
import { authService } from '$lib/api/auth';

export const load = async () => {
  // 检查是否已认证
  if (!authService.isAuthenticated()) {
    throw redirect(307, '/login');
  }
};


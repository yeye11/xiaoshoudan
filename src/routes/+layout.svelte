<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import '../app.css';
  import { ToastHost } from '$lib/components/ui/toast';
  import { initializeDefaultData } from '$lib/utils/initializeData';
  import { pushNavigationHistory } from '$lib/utils/navigation';
  export let data;

  let accessChecked = false;
  let accessAllowed = true;
  let errorMessage = '';

  // 应用启动：初始化默认数据，并挂载导航记录
  onMount(async () => {
    // 权限检查
    try {
      // 简单检测是否在 Tauri 环境
      // @ts-ignore
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
          const status: any = await invoke('check_access_status');
          console.log('Access Status:', status);
          accessAllowed = status.allowed;
          if (!accessAllowed) {
              errorMessage = "当前版本已停止服务，请联系靓仔";
          }
      }
    } catch (e) {
        console.error("Failed to check access:", e);
    } finally {
        accessChecked = true;
    }

    if (accessAllowed) {
        initializeDefaultData();

        // 记录每次导航的路径（中文日志，便于排查返回循环）
        afterNavigate(({ to, from, type }) => {
            const toPath = to?.url?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
            console.log('🧭 导航变化（记录历史）:', { from: from?.url?.pathname, to: toPath, type });
            pushNavigationHistory(toPath);
        });
    }
  });
</script>

{#if !accessChecked}
    <div class="flex items-center justify-center min-h-screen bg-white">
        <div class="flex flex-col items-center gap-4">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500">正在检查服务状态...</p>
        </div>
    </div>
{:else if !accessAllowed}
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">服务已停止</h1>
            <p class="text-gray-600 mb-6">{errorMessage || '当前版本已停止服务，暂不支持访问，请联系靓仔。'}</p>
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-white flex flex-col" style="min-height: 100dvh;">
      <slot />
      <ToastHost />
    </div>
{/if}


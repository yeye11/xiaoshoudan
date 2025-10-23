<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import '../app.css';
  import { ToastHost } from '$lib/components/ui/toast';
  import { initializeDefaultData } from '$lib/utils/initializeData';
  import { pushNavigationHistory } from '$lib/utils/navigation';
  export let data;

  // 应用启动：初始化默认数据，并挂载导航记录
  onMount(() => {
    initializeDefaultData();

    // 记录每次导航的路径（中文日志，便于排查返回循环）
    afterNavigate(({ to, from, type }) => {
      const toPath = to?.url?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
      console.log('🧭 导航变化（记录历史）:', { from: from?.url?.pathname, to: toPath, type });
      pushNavigationHistory(toPath);
    });
  });
</script>

<div class="min-h-screen bg-white flex flex-col" style="min-height: 100dvh;">
  <slot />
  <ToastHost />
</div>


<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { ToastHost } from '$lib/components/ui/toast';
  import { initializeDefaultData } from '$lib/utils/initializeData';
  export let data;

  // 在应用启动时初始化默认数据
  onMount(() => {
    initializeDefaultData();
  });
</script>

<div class="min-h-screen bg-white flex flex-col" style="min-height: 100dvh;">
  <slot />
  <ToastHost />
</div>


<script lang="ts">
  export let title: string = '';
  export let showBack: boolean = false;
  export let showSearch: boolean = false;
  export let showActions: boolean = false;
  export let backgroundColor: string = 'bg-blue-500';
  export let textColor: string = 'text-white';

  // 事件处理
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  const handleBack = () => {
    dispatch('back');
    // 默认行为：返回上一页
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleSearch = () => {
    dispatch('search');
  };

  const handleAction = (action: string) => {
    dispatch('action', { action });
  };
</script>

<header class="sticky top-0 z-40 {backgroundColor} {textColor} shadow-sm" style="padding-top: 12px; padding-top: constant(safe-area-inset-top); padding-top: env(safe-area-inset-top);">
  <div class="flex items-center justify-between h-16 px-4">
    <!-- 左侧：返回按钮或占位 -->
    <div class="flex items-center">
      {#if showBack}
        <button
          on:click={handleBack}
          class="p-2 -ml-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="返回"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      {:else}
        <div class="w-10"></div>
      {/if}
    </div>

    <!-- 中间：标题 -->
    <div class="flex-1 text-center">
      <h1 class="text-lg font-medium truncate px-4">{title}</h1>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="flex items-center space-x-2">
      {#if showSearch}
        <button
          on:click={handleSearch}
          class="p-2 mr-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="搜索"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      {/if}

      {#if showActions}
        <slot name="actions">
          <!-- 默认操作按钮 -->
          <button
            on:click={() => handleAction('add')}
            class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="添加"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </slot>
      {/if}
    </div>
  </div>

  <!-- 可选的子标题或状态栏 -->
  <slot name="subtitle" />
</header>

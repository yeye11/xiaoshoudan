<!--
  DataLoader 组件 - 统一处理数据加载、错误和空状态
  
  功能：
  - 统一处理加载状态
  - 统一处理错误状态
  - 统一处理空状态
  - 减少重复代码
  
  使用示例：
  <DataLoader {loading} {error} {data} let:data>
    <div>{data.length} 项</div>
  </DataLoader>
-->

<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * 加载状态
   */
  export let loading = false;

  /**
   * 错误信息
   */
  export let error: string | null = null;

  /**
   * 数据
   */
  export let data: any = null;

  /**
   * 加载函数（可选）
   */
  export let onLoad: (() => Promise<void>) | null = null;

  /**
   * 空状态提示文本
   */
  export let emptyMessage = '暂无数据';

  /**
   * 加载中提示文本
   */
  export let loadingMessage = '加载中...';

  /**
   * 是否在挂载时自动加载
   */
  export let autoLoad = true;

  /**
   * 自动加载
   */
  onMount(async () => {
    if (autoLoad && onLoad) {
      loading = true;
      try {
        await onLoad();
      } catch (err) {
        error = err instanceof Error ? err.message : '加载失败';
      } finally {
        loading = false;
      }
    }
  });

  /**
   * 手动重新加载
   */
  export async function reload() {
    if (onLoad) {
      loading = true;
      error = null;
      try {
        await onLoad();
      } catch (err) {
        error = err instanceof Error ? err.message : '加载失败';
      } finally {
        loading = false;
      }
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-center py-8">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">{loadingMessage}</p>
    </div>
  </div>
{:else if error}
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">加载失败</h3>
        <div class="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
        <div class="mt-4">
          <button
            on:click={reload}
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  </div>
{:else if !data || (Array.isArray(data) && data.length === 0)}
  <div class="flex items-center justify-center py-8">
    <div class="text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
    </div>
  </div>
{:else}
  <slot {data} />
{/if}

<style>
  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>


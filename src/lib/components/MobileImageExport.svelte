<script lang="ts">
  import { exportElementAsImage } from '$lib/utils/imageExport';

  export let targetElement: HTMLElement | null = null;
  export let fileName: string = 'document';
  export let showButton: boolean = true;
  export let buttonText: string = '保存为图片';
  export let buttonClass: string = 'bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors w-full';

  let isExporting = false;

  // 统一接口：直接使用 utils 的导出函数，命名与桌面端一致（保存为图片）
  const exportAsImageUnified = async () => {
    if (!targetElement) return;
    isExporting = true;
    try { 
      await exportElementAsImage(targetElement as HTMLElement, fileName); 
    }
    catch (e) {
      console.error('导出图片失败:', e);
      alert('导出图片失败，请重试');
    }
    finally { 
      isExporting = false; 
    }
  };
</script>

{#if showButton}
  <!-- 主要导出按钮 -->
  <button
    on:click={exportAsImageUnified}
    disabled={isExporting}
    class={buttonClass}
  >
    {#if isExporting}
      <span class="flex items-center justify-center space-x-2">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>导出中...</span>
      </span>
    {:else}
      {buttonText}
    {/if}
  </button>
{/if}

<style>
  /* 确保按钮在移动端有合适的触摸目标大小 */
  button {
    min-height: 44px;
    touch-action: manipulation;
  }
</style>

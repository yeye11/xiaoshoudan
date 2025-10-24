<!--
  MobilePageLayout 组件 - 统一移动端页面布局
  
  功能：
  - 统一页面头部
  - 统一页面内容区域
  - 统一页面底部操作栏
  - 减少重复的布局代码
  
  使用示例：
  <MobilePageLayout title="销售单" showBack={true}>
    <div>页面内容</div>
    <svelte:fragment slot="actions">
      <button>保存</button>
    </svelte:fragment>
  </MobilePageLayout>
-->

<script lang="ts">
  import MobileHeader from './MobileHeader.svelte';

  /**
   * 页面标题
   */
  export let title = '';

  /**
   * 是否显示返回按钮
   */
  export let showBack = true;

  /**
   * 页面头部背景颜色
   */
  export let backgroundColor = 'bg-blue-500';

  /**
   * 是否显示底部操作栏
   */
  export let showActions = false;

  /**
   * 是否禁用底部操作栏
   */
  export let actionsDisabled = false;

  /**
   * 页面内容是否可滚动
   */
  export let scrollable = true;

  /**
   * 页面内容的额外 CSS 类
   */
  export let contentClass = '';

  /**
   * 页面容器的额外 CSS 类
   */
  export let containerClass = '';
</script>

<div class="flex flex-col h-screen {containerClass}">
  <!-- 页面头部 -->
  <MobileHeader {title} {showBack} {backgroundColor} />

  <!-- 页面内容 -->
  <div
    class="flex-1 overflow-y-auto {scrollable ? 'overflow-y-auto' : 'overflow-hidden'} {contentClass}"
  >
    <slot />
  </div>

  <!-- 底部操作栏 -->
  {#if showActions}
    <div
      class="border-t border-gray-200 bg-white px-4 py-3 flex gap-2 {actionsDisabled
        ? 'opacity-50 pointer-events-none'
        : ''}"
    >
      <slot name="actions" />
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>


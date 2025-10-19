<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Product } from '$lib/types/invoice';

  let status = 'ready'; // ready, processing, success, error
  let message = '';
  let details: string[] = [];

  onMount(() => {
    // 自动执行删除
    removeDefaultSpecs();
  });

  const removeDefaultSpecs = () => {
    status = 'processing';
    message = '正在删除所有"默认规格"...';
    details = [];

    try {
      const stored = localStorage.getItem('products');
      if (!stored) {
        status = 'error';
        message = '没有找到产品数据';
        return;
      }

      const products: Product[] = JSON.parse(stored);
      let removedCount = 0;
      let totalRemoved = 0;

      products.forEach(product => {
        const beforeCount = product.specifications.length;
        const beforeSpecs = product.specifications.map(s => s.name).join(', ');
        
        // 删除名为"默认规格"的规格
        product.specifications = product.specifications.filter(spec => spec.name !== '默认规格');
        
        const afterCount = product.specifications.length;
        const removed = beforeCount - afterCount;
        
        if (removed > 0) {
          removedCount++;
          totalRemoved += removed;
          const afterSpecs = product.specifications.map(s => s.name).join(', ') || '(无规格)';
          details.push(`产品 "${product.name}": 删除了 ${removed} 个"默认规格"`);
          details.push(`  - 删除前: ${beforeSpecs}`);
          details.push(`  - 删除后: ${afterSpecs}`);
        }
      });

      // 保存到 localStorage
      localStorage.setItem('products', JSON.stringify(products));
      
      status = 'success';
      message = `成功删除！共处理 ${products.length} 个产品，从 ${removedCount} 个产品中删除了 ${totalRemoved} 个"默认规格"`;
      
      // 3秒后返回产品列表
      setTimeout(() => {
        goto('/mobile/products');
      }, 3000);
    } catch (e) {
      status = 'error';
      message = `删除失败: ${e}`;
      console.error('删除失败:', e);
    }
  };

  const goBack = () => {
    goto('/mobile/products');
  };
</script>

<div class="min-h-screen bg-gray-50 p-4">
  <div class="max-w-2xl mx-auto mt-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">删除所有"默认规格"</h1>
      
      <!-- 状态显示 -->
      {#if status === 'processing'}
        <div class="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
          <div class="flex items-center gap-3">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="font-medium">{message}</span>
          </div>
        </div>
      {/if}

      {#if status === 'success'}
        <div class="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          <div class="flex items-center gap-3 mb-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">{message}</span>
          </div>
          <p class="text-sm">3秒后自动返回产品列表...</p>
        </div>
      {/if}

      {#if status === 'error'}
        <div class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <div class="flex items-center gap-3">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">{message}</span>
          </div>
        </div>
      {/if}

      <!-- 详细信息 -->
      {#if details.length > 0}
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">详细信息</h2>
          <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div class="space-y-1 font-mono text-xs text-gray-700">
              {#each details as detail}
                <div>{detail}</div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          type="button"
          on:click={goBack}
          class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          返回产品列表
        </button>
      </div>
    </div>
  </div>
</div>


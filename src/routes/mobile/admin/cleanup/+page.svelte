<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Product } from '$lib/types/invoice';

  let message = '';
  let isProcessing = false;

  const removeDefaultSpecs = () => {
    isProcessing = true;
    message = '正在处理...';

    try {
      const stored = localStorage.getItem('products');
      if (!stored) {
        message = '❌ 没有找到产品数据';
        isProcessing = false;
        return;
      }

      const products: Product[] = JSON.parse(stored);
      let removedCount = 0;
      let totalRemoved = 0;

      products.forEach(product => {
        const beforeCount = product.specifications.length;
        product.specifications = product.specifications.filter(spec => spec.name !== '默认规格');
        const afterCount = product.specifications.length;
        const removed = beforeCount - afterCount;
        
        if (removed > 0) {
          removedCount++;
          totalRemoved += removed;
          console.log(`✅ 产品 "${product.name}" 删除了 ${removed} 个"默认规格"`);
        }
      });

      localStorage.setItem('products', JSON.stringify(products));
      
      message = `✅ 成功！共处理 ${products.length} 个产品，从 ${removedCount} 个产品中删除了 ${totalRemoved} 个"默认规格"`;
      
      setTimeout(() => {
        goto('/mobile/products');
      }, 2000);
    } catch (e) {
      console.error('删除失败:', e);
      message = `❌ 删除失败: ${e}`;
    } finally {
      isProcessing = false;
    }
  };

  const cancel = () => {
    goto('/mobile/products');
  };
</script>

<div class="min-h-screen bg-gray-50 p-4">
  <div class="max-w-md mx-auto mt-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">清理工具</h1>
      
      <div class="mb-6">
        <p class="text-gray-700 mb-2">此工具将删除所有产品中名为"默认规格"的规格选项。</p>
        <p class="text-sm text-gray-500">注意：此操作不可撤销！</p>
      </div>

      {#if message}
        <div class="mb-4 p-4 rounded-lg {message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
          {message}
        </div>
      {/if}

      <div class="flex gap-3">
        <button
          type="button"
          on:click={cancel}
          disabled={isProcessing}
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="button"
          on:click={removeDefaultSpecs}
          disabled={isProcessing}
          class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isProcessing ? '处理中...' : '删除所有"默认规格"'}
        </button>
      </div>
    </div>
  </div>
</div>


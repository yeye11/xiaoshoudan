<script lang="ts">
  import { onMount } from 'svelte';
  import type { Product } from '$lib/types';

  let status = '正在清理...';
  let details: string[] = [];
  let totalRemoved = 0;
  let affectedProducts: string[] = [];

  onMount(() => {
    cleanDefaultSpecs();
  });

  function cleanDefaultSpecs() {
    try {
      // 读取产品数据
      const productsJson = localStorage.getItem('products');
      if (!productsJson) {
        status = '❌ 没有找到产品数据';
        return;
      }

      const products: Product[] = JSON.parse(productsJson);
      details.push(`📦 找到 ${products.length} 个产品`);

      // 清理每个产品的默认规格
      products.forEach(product => {
        const beforeCount = product.specifications.length;
        
        // 过滤掉名称为"默认规格"的规格
        product.specifications = product.specifications.filter(
          spec => spec.name !== '默认规格'
        );

        const removedCount = beforeCount - product.specifications.length;
        
        if (removedCount > 0) {
          totalRemoved += removedCount;
          affectedProducts.push(product.name);
          details.push(`✅ ${product.name}: 删除了 ${removedCount} 个默认规格`);
        }
      });

      // 保存清理后的数据
      localStorage.setItem('products', JSON.stringify(products));

      if (totalRemoved > 0) {
        status = `✅ 清理完成！共删除了 ${totalRemoved} 个"默认规格"`;
        details.push('');
        details.push(`📊 影响的产品 (${affectedProducts.length}个):`);
        affectedProducts.forEach(name => {
          details.push(`  • ${name}`);
        });
      } else {
        status = '✅ 没有找到需要清理的"默认规格"';
      }

      details.push('');
      details.push('🔄 请刷新页面查看效果');

    } catch (error) {
      status = `❌ 清理失败: ${error}`;
      details.push(`错误详情: ${error}`);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">清理"默认规格"</h1>
      
      <div class="mb-6">
        <div class="text-lg font-semibold mb-4 {totalRemoved > 0 ? 'text-green-600' : 'text-gray-600'}">
          {status}
        </div>
        
        {#if details.length > 0}
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            {#each details as detail}
              <div class="text-sm {detail.startsWith('✅') ? 'text-green-600' : detail.startsWith('❌') ? 'text-red-600' : detail.startsWith('📦') || detail.startsWith('📊') ? 'text-blue-600 font-semibold' : 'text-gray-700'}">
                {detail}
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex gap-3">
        <button
          on:click={() => window.location.reload()}
          class="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          🔄 刷新页面
        </button>
        
        <button
          on:click={() => window.history.back()}
          class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          ← 返回
        </button>
      </div>

      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-semibold text-yellow-800 mb-2">💡 说明</h3>
        <ul class="text-sm text-yellow-700 space-y-1">
          <li>• 此工具会删除所有产品中名称为"默认规格"的规格</li>
          <li>• 删除后，产品编辑界面将不再显示"默认规格"按钮</li>
          <li>• 数据已保存到 localStorage，刷新页面即可看到效果</li>
        </ul>
      </div>
    </div>
  </div>
</div>


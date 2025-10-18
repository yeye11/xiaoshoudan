<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Product } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let products: Product[] = [];
  let filtered: Product[] = [];
  let keyword = '';
  let showSearch = true;

  onMount(() => {
    loadProducts();
  });

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products');
      products = stored ? JSON.parse(stored) : [];
      filtered = products;
      handleSearch();
    } catch (e) {
      console.error('加载产品失败', e);
    }
  };

  const handleSearch = () => {
    if (!keyword.trim()) {
      filtered = products;
      return;
    }
    const k = keyword.toLowerCase();
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(k) ||
      p.category.toLowerCase().includes(k) ||
      (p.barcode || '').toLowerCase().includes(k) ||
      p.tags.some(t => t.toLowerCase().includes(k))
    );
  };

  const pick = (productId: string) => {
    const idx = Number($page.url.searchParams.get('index') || -1);
    const cid = $page.url.searchParams.get('customerId');
    // 返回到新建销售单页面并携带选择结果，并保留客户ID
    goto(`/mobile/sales/new?pickProductId=${encodeURIComponent(productId)}&index=${idx}${cid ? `&customerId=${cid}` : ''}`);
  };

  // 响应式搜索
  $: handleSearch();

</script>

<MobileHeader
  title="选择产品"
  showBack={true}
  backgroundColor="bg-orange-500"
>
</MobileHeader>

<!-- 搜索框 -->
<div class="bg-white border-b border-gray-200 p-3 sticky top-0 z-10">
  <div class="relative">
    <input
      type="text"
      bind:value={keyword}
      placeholder="搜索产品名称、分类、条码、标签"
      class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
    <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  </div>
</div>

<!-- 列表 -->
<div class="p-3">
  {#if filtered.length === 0}
    <div class="text-center text-gray-500 py-12">没有匹配的产品</div>
  {:else}
    <div class="space-y-2">
      {#each filtered as p}
        <button class="w-full text-left bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                on:click={() => pick(p.id)} aria-label={`选择 ${p.name}`}>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900">{p.name}</div>
              <div class="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {#if p.category}<span>分类: {p.category}</span>{/if}
                <span>单位: {p.unit}</span>
                {#if p.specifications.length > 0}
                  <span>规格: {p.specifications.find(s => s.isDefault)?.name || p.specifications[0]?.name}</span>
                {/if}
                {#if p.prices.length > 0}
                  <span class="text-orange-600">¥{(p.prices.find(pp => pp.type==='sale' && pp.isDefault) || p.prices[0])?.price.toFixed(2)}</span>
                {/if}
                {#if p.barcode}
                  <span class="font-mono text-xs text-gray-500">{p.barcode}</span>
                {/if}
              </div>
              {#if p.tags.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each p.tags.slice(0, 4) as tag}
                    <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>


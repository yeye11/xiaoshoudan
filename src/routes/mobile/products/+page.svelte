<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Product } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 产品列表和搜索
  let products: Product[] = [];
  let filteredProducts: Product[] = [];
  let searchKeyword = '';
  let sortBy = 'name';
  let sortOrder = 'asc';
  let showSearch = false;

  // 排序选项
  const sortOptions = [
    { id: 'name', name: '产品名称' },
    { id: 'category', name: '分类' },
    { id: 'price', name: '价格' },
    { id: 'createdAt', name: '创建时间' }
  ];

  onMount(() => {
    loadProducts();
  });

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products');
      if (stored) {
        products = JSON.parse(stored);
        filteredProducts = products;
        sortProducts();
      }
    } catch (error) {
      console.error('加载产品数据失败:', error);
    }
  };

  // 搜索功能
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      filteredProducts = products;
    } else {
      const keyword = searchKeyword.toLowerCase();
      filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.barcode?.toLowerCase().includes(keyword) ||
        product.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    sortProducts();
  };

  // 排序功能
  const sortProducts = () => {
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'price':
          aValue = getProductPrice(a);
          bValue = getProductPrice(b);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  };

  // 获取产品默认价格
  const getProductPrice = (product: Product): number => {
    const salePrice = product.prices.find(p => p.type === 'sale' && p.isDefault);
    return salePrice ? salePrice.price : 0;
  };

  // 获取产品默认规格
  const getProductSpecification = (product: Product): string => {
    const defaultSpec = product.specifications.find(s => s.isDefault);
    return defaultSpec ? defaultSpec.name : '';
  };

  // 切换搜索显示
  const toggleSearch = () => {
    showSearch = !showSearch;
    if (!showSearch) {
      searchKeyword = '';
      filteredProducts = products;
      sortProducts();
    }
  };

  // 切换排序
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'asc';
    }
    sortProducts();
  };

  // 导航到产品详情
  const viewProduct = (productId: string) => {
    goto(`/mobile/products/${productId}`);
  };

  // 导航到新建产品
  const createProduct = () => {
    goto('/mobile/products/new');
  };

  // 格式化价格
  const formatPrice = (price: number): string => {
    return `¥${price.toFixed(2)}`;
  };

  // 响应式搜索
  $: if (searchKeyword !== undefined) {
    handleSearch();
  }
</script>

<MobileHeader 
  title="产品" 
  showBack={true}
  showSearch={true}
  showActions={true}
  backgroundColor="bg-orange-500"
  on:search={toggleSearch}
  on:action={createProduct}
>
  <div slot="actions">
    <button
      on:click={createProduct}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="添加产品"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
  </div>
</MobileHeader>

<!-- 搜索栏 -->
{#if showSearch}
  <div class="bg-white border-b border-gray-200 p-4 space-y-3">
    <div class="relative">
      <input
        type="text"
        bind:value={searchKeyword}
        placeholder="输入产品名称、分类、条形码"
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <button
        on:click={toggleSearch}
        class="absolute right-3 top-2.5 text-orange-500 font-medium"
      >
        搜索
      </button>
    </div>

    <!-- 排序选项 -->
    <div class="flex items-center space-x-2 overflow-x-auto">
      <span class="text-sm text-gray-600 whitespace-nowrap">排序:</span>
      {#each sortOptions as option}
        <button
          on:click={() => toggleSort(option.id)}
          class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                 {sortBy === option.id 
                   ? 'bg-orange-500 text-white' 
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {option.name}
          {#if sortBy === option.id}
            {sortOrder === 'asc' ? '↑' : '↓'}
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}

<!-- 产品列表 -->
<div class="p-4">
  {#if filteredProducts.length === 0}
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
      <p class="text-gray-500 mb-4">
        {searchKeyword ? '暂时没有数据哦~' : '还没有产品数据'}
      </p>
      {#if !searchKeyword}
        <button
          on:click={createProduct}
          class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          添加第一个产品
        </button>
      {/if}
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredProducts as product}
        <div
          class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          on:click={() => viewProduct(product.id)}
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 mb-1">{product.name}</h3>
              <div class="text-sm text-gray-600 space-y-1">
                {#if product.category}
                  <div class="flex items-center">
                    <span class="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {product.category}
                  </div>
                {/if}
                
                {#if getProductSpecification(product)}
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    {getProductSpecification(product)}
                  </div>
                {/if}

                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  单位: {product.unit}
                </div>

                {#if product.barcode}
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                    </svg>
                    <span class="font-mono text-xs">{product.barcode}</span>
                  </div>
                {/if}
              </div>

              <!-- 标签 -->
              {#if product.tags.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each product.tags.slice(0, 3) as tag}
                    <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  {/each}
                  {#if product.tags.length > 3}
                    <span class="text-xs text-gray-500">+{product.tags.length - 3}</span>
                  {/if}
                </div>
              {/if}
            </div>
            
            <!-- 价格信息 -->
            <div class="text-right ml-4">
              <div class="text-xs text-gray-500">售价</div>
              <div class="text-sm font-medium text-orange-600">
                {formatPrice(getProductPrice(product))}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {product.unit}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

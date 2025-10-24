<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import ListItem from '$lib/components/ListItem.svelte';
  import type { Product } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { StorageManager } from '$lib/utils/storage';
  import { useList } from '$lib/composables/useList';

  // 初始化列表
  const list = useList({
    initialData: [],
    searchFields: ['name', 'category', 'unit'],
    sortFields: ['name', 'category'],
    onDelete: async (item: Product) => {
      StorageManager.deleteProduct(item.id);
    },
    onLoad: async () => {
      return StorageManager.getProducts();
    }
  });

  const { filteredItems, searchQuery, sortField, sortOrder, isDeleting, load } = list;

  onMount(async () => {
    await load();
  });

  // 编辑产品
  const handleEdit = (product: Product) => {
    goto(`/mobile/products/${product.id}`);
  };

  // 查看产品详情
  const handleView = (product: Product) => {
    goto(`/mobile/products/${product.id}`);
  };

  // 删除产品
  const handleDelete = async (product: Product) => {
    if (confirm(`确定要删除产品 "${product.name}" 吗？`)) {
      await list.delete(product);
    }
  };

  // 切换排序
  const toggleSort = (field: keyof Product) => {
    if ($sortField === field) {
      sortOrder.set($sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      sortField.set(field as keyof Product);
      sortOrder.set('desc');
    }
  };
</script>

<MobileHeader
  title="产品管理"
  showBack={true}
  showActions={true}
  backgroundColor="bg-green-500"
>
  <div slot="actions">
    <button
      on:click={() => goto('/mobile/products/new')}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="新建产品"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
  </div>
</MobileHeader>

<div class="flex flex-col h-full">
  <!-- 搜索栏 -->
  <div class="bg-white border-b p-4 space-y-3">
    <input
      type="text"
      bind:value={$searchQuery}
      placeholder="搜索产品名称、分类..."
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
    
    <!-- 排序按钮 -->
    <div class="flex gap-2">
      <button
        on:click={() => toggleSort('name')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-green-500={$sortField === 'name'}
        class:text-white={$sortField === 'name'}
        class:bg-gray-100={$sortField !== 'name'}
      >
        名称 {$sortField === 'name' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      <button
        on:click={() => toggleSort('category')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-green-500={$sortField === 'category'}
        class:text-white={$sortField === 'category'}
        class:bg-gray-100={$sortField !== 'category'}
      >
        分类 {$sortField === 'category' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
    </div>
  </div>

  <!-- 产品列表 -->
  <div class="flex-1 overflow-y-auto">
    {#if $filteredItems.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m0 0l8-4m-8 4v10l8 4m0-10l8 4m-8-4v10M7 12l8 4m0 0l8-4"></path>
        </svg>
        <p>暂无产品数据</p>
      </div>
    {:else}
      <div class="p-2 flex flex-col gap-3">
        {#each $filteredItems as product (product.id)}
          <ListItem
            item={product}
            fields={[
              { key: 'name', label: '名称' },
              { key: 'category', label: '分类', format: (val) => val || '未分类' },
              { key: 'unit', label: '单位' }
            ]}
            onClick={() => handleView(product)}
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product)}
            isDeleting={$isDeleting}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

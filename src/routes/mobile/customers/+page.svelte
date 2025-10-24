<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import ListItem from '$lib/components/ListItem.svelte';
  import type { Customer } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { StorageManager } from '$lib/utils/storage';
  import { useList } from '$lib/composables/useList';

  // 初始化列表
  const list = useList({
    initialData: [],
    searchFields: ['name', 'phone', 'category'],
    sortFields: ['name', 'createdAt'],
    onDelete: async (item: Customer) => {
      StorageManager.deleteCustomer(item.id);
    },
    onLoad: async () => {
      return StorageManager.getCustomers();
    }
  });

  const { filteredItems, searchQuery, sortField, sortOrder, isDeleting, load } = list;

  onMount(async () => {
    await load();
    // 默认按照创建时间倒序排序
    sortField.set('createdAt');
    sortOrder.set('desc');
  });

  // 编辑客户
  const handleEdit = (customer: Customer) => {
    goto(`/mobile/customers/${customer.id}/edit`);
  };

  // 查看客户详情
  const handleView = (customer: Customer) => {
    goto(`/mobile/customers/${customer.id}`);
  };

  // 删除客户
  const handleDelete = async (customer: Customer) => {
    if (confirm(`确定要删除客户 "${customer.name}" 吗？`)) {
      await list.delete(customer);
    }
  };

  // 切换排序
  const toggleSort = (field: keyof Customer) => {
    if ($sortField === field) {
      sortOrder.set($sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      sortField.set(field);
      sortOrder.set('desc');
    }
  };
</script>

<MobileHeader
  title="客户管理"
  showBack={true}
  showActions={true}
  backgroundColor="bg-blue-500"
>
  <div slot="actions">
    <button
      on:click={() => goto('/mobile/customers/new')}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="新建客户"
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
      placeholder="搜索客户名称、电话..."
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    
    <!-- 排序按钮 -->
    <div class="flex gap-2">
      <button
        on:click={() => toggleSort('name')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-blue-500={$sortField === 'name'}
        class:text-white={$sortField === 'name'}
        class:bg-gray-100={$sortField !== 'name'}
      >
        名称 {$sortField === 'name' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      <button
        on:click={() => toggleSort('createdAt')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-blue-500={$sortField === 'createdAt'}
        class:text-white={$sortField === 'createdAt'}
        class:bg-gray-100={$sortField !== 'createdAt'}
      >
        时间 {$sortField === 'createdAt' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
    </div>
  </div>

  <!-- 客户列表 -->
  <div class="flex-1 overflow-y-auto">
    {#if $filteredItems.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p>暂无客户数据</p>
      </div>
    {:else}
      <div class="p-2 flex flex-col gap-3">
        {#each $filteredItems as customer (customer.id)}
          <ListItem
            item={customer}
            fields={[
              { key: 'name', label: '名称' },
              { key: 'phone', label: '电话' },
              { key: 'category', label: '分类' }
            ]}
            onClick={() => handleView(customer)}
            onEdit={() => handleEdit(customer)}
            onDelete={() => handleDelete(customer)}
            isDeleting={$isDeleting}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

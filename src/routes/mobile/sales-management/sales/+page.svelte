<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import ListItem from '$lib/components/ListItem.svelte';
  import type { Invoice } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { StorageManager } from '$lib/utils/storage';
  import { useList } from '$lib/composables/useList';

  // 初始化列表
  const list = useList({
    initialData: [],
    searchFields: ['invoiceNumber'],
    sortFields: ['createdAt', 'totalAmount'],
    onDelete: async (item: Invoice) => {
      StorageManager.deleteInvoice(item.id);
    },
    onLoad: async () => {
      return StorageManager.getInvoices();
    }
  });

  const { filteredItems, searchQuery, sortField, sortOrder, isDeleting, load } = list;

  onMount(async () => {
    await load();
    // 默认按照创建时间倒序排序
    sortField.set('createdAt');
    sortOrder.set('desc');
  });

  // 编辑销售单
  const handleEdit = (invoice: Invoice) => {
    goto(`/mobile/sales-management/sales/${invoice.id}/edit`);
  };

  // 查看销售单详情
  const handleView = (invoice: Invoice) => {
    goto(`/mobile/sales-management/sales/${invoice.id}`);
  };

  // 删除销售单
  const handleDelete = async (invoice: Invoice) => {
    if (confirm(`确定要删除销售单 "${invoice.invoiceNumber}" 吗？`)) {
      await list.delete(invoice);
    }
  };

  // 切换排序
  const toggleSort = (field: keyof Invoice) => {
    if ($sortField === field) {
      sortOrder.set($sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      sortField.set(field);
      sortOrder.set('desc');
    }
  };
</script>

<MobileHeader
  title="销售管理"
  showBack={true}
  showActions={true}
  backgroundColor="bg-purple-500"
>
  <div slot="actions">
    <button
      on:click={() => goto('/mobile/sales-management/sales/new')}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="新建销售单"
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
      placeholder="搜索销售单号、客户名称..."
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
    
    <!-- 排序按钮 -->
    <div class="flex gap-2">
      <button
        on:click={() => toggleSort('createdAt')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-purple-500={$sortField === 'createdAt'}
        class:text-white={$sortField === 'createdAt'}
        class:bg-gray-100={$sortField !== 'createdAt'}
      >
        创建时间 {$sortField === 'createdAt' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      <button
        on:click={() => toggleSort('totalAmount')}
        class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-purple-500={$sortField === 'totalAmount'}
        class:text-white={$sortField === 'totalAmount'}
        class:bg-gray-100={$sortField !== 'totalAmount'}
      >
        金额 {$sortField === 'totalAmount' ? ($sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
    </div>
  </div>

  <!-- 销售单列表 -->
  <div class="flex-1 overflow-y-auto">
    {#if $filteredItems.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p>暂无销售单数据</p>
      </div>
    {:else}
      <div class="p-2 flex flex-col gap-3">
        {#each $filteredItems as invoice (invoice.id)}
          <ListItem
            item={invoice}
            fields={[
              { key: 'invoiceNumber', label: '单号' },
              { key: 'date', label: '日期' },
              { key: 'totalAmount', label: '金额' }
            ]}
            onClick={() => handleView(invoice)}
            onEdit={() => handleEdit(invoice)}
            onDelete={() => handleDelete(invoice)}
            isDeleting={$isDeleting}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

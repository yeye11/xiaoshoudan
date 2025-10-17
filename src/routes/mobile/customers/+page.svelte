<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Customer } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 客户列表和搜索
  let customers: Customer[] = [];
  let filteredCustomers: Customer[] = [];
  let searchKeyword = '';
  let searchCategory = 'all';
  let showSearch = false;

  // 搜索类别
  const searchCategories = [
    { id: 'all', name: '全部' },
    { id: 'name', name: '客户' },
    { id: 'phone', name: '客户电话' },
    { id: 'attachment', name: '附件' }
  ];

  onMount(() => {
    loadCustomers();
  });

  const loadCustomers = () => {
    try {
      const stored = localStorage.getItem('customers');
      if (stored) {
        customers = JSON.parse(stored);
        filteredCustomers = customers;
      }
    } catch (error) {
      console.error('加载客户数据失败:', error);
    }
  };

  const saveCustomers = () => {
    try {
      localStorage.setItem('customers', JSON.stringify(customers));
    } catch (error) {
      console.error('保存客户数据失败:', error);
    }
  };

  // 搜索功能
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      filteredCustomers = customers;
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    filteredCustomers = customers.filter(customer => {
      switch (searchCategory) {
        case 'name':
          return customer.name.toLowerCase().includes(keyword);
        case 'phone':
          return customer.phone.includes(keyword) || customer.backupPhone?.includes(keyword);
        case 'attachment':
          return customer.attachments?.some(att => att.toLowerCase().includes(keyword));
        default:
          return (
            customer.name.toLowerCase().includes(keyword) ||
            customer.phone.includes(keyword) ||
            customer.backupPhone?.includes(keyword) ||
            customer.email?.toLowerCase().includes(keyword) ||
            customer.address?.toLowerCase().includes(keyword)
          );
      }
    });
  };

  // 切换搜索显示
  const toggleSearch = () => {
    showSearch = !showSearch;
    if (!showSearch) {
      searchKeyword = '';
      filteredCustomers = customers;
    }
  };

  // 导航到客户详情
  const viewCustomer = (customerId: string) => {
    goto(`/mobile/customers/${customerId}`);
  };

  // 导航到新建客户
  const createCustomer = () => {
    goto('/mobile/customers/new');
  };

  // 格式化电话号码
  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  // 计算客户欠款（简化版）
  const getCustomerDebt = (customer: Customer): number => {
    // 这里应该根据实际的销售单数据计算
    return customer.initialDebt;
  };

  // 响应式搜索
  $: if (searchKeyword !== undefined) {
    handleSearch();
  }
</script>

<MobileHeader 
  title="客户" 
  showBack={true}
  showSearch={true}
  showActions={true}
  backgroundColor="bg-blue-500"
  on:search={toggleSearch}
  on:action={createCustomer}
>
  <div slot="actions">
    <button
      on:click={createCustomer}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="添加客户"
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
        placeholder="输入客户、客户电话、附件"
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <button
        on:click={toggleSearch}
        class="absolute right-3 top-2.5 text-blue-500 font-medium"
      >
        搜索
      </button>
    </div>

    <!-- 搜索类别 -->
    <div class="flex space-x-2">
      <span class="text-sm text-gray-600 py-2">搜索类别</span>
      {#each searchCategories as category}
        <button
          on:click={() => searchCategory = category.id}
          class="px-3 py-1 rounded-full text-sm font-medium transition-colors
                 {searchCategory === category.id 
                   ? 'bg-blue-500 text-white' 
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {category.name}
        </button>
      {/each}
    </div>
  </div>
{/if}

<!-- 客户列表 -->
<div class="p-4">
  {#if filteredCustomers.length === 0}
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
      <p class="text-gray-500 mb-4">
        {searchKeyword ? '暂时没有数据哦~' : '还没有客户数据'}
      </p>
      {#if !searchKeyword}
        <button
          on:click={createCustomer}
          class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          添加第一个客户
        </button>
      {/if}
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredCustomers as customer}
        <div
          class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          on:click={() => viewCustomer(customer.id)}
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 mb-1">{customer.name}</h3>
              <div class="text-sm text-gray-600 space-y-1">
                {#if customer.category}
                  <div class="flex items-center">
                    <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {customer.category}
                  </div>
                {/if}
                {#if customer.phone}
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    {formatPhone(customer.phone)}
                  </div>
                {/if}
                {#if customer.address}
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="truncate">{customer.address}</span>
                  </div>
                {/if}
              </div>
            </div>
            
            <!-- 欠款信息 -->
            {#if getCustomerDebt(customer) > 0}
              <div class="text-right">
                <div class="text-xs text-gray-500">欠款</div>
                <div class="text-sm font-medium text-red-600">
                  ¥{getCustomerDebt(customer).toFixed(2)}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

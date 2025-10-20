<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Invoice, Customer } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 销售单列表和搜索
  let invoices: Invoice[] = [];
  let filteredInvoices: Invoice[] = [];
  let customers: Customer[] = [];
  let searchKeyword = '';
  let filterStatus = 'all';
  let sortBy = 'date';
  let sortOrder = 'desc';
  let showSearch = false;
  let showSortOptions = true;

  // 统计数据
  let statistics = {
    totalSales: 0,
    unpaidAmount: 0,
    todaySales: 0,
    invoiceCount: 0
  };

  // 状态选项
  const statusOptions = [
    { id: 'all', name: '全部', color: 'text-gray-600' },
    { id: 'draft', name: '草稿', color: 'text-yellow-600' },
    { id: 'sent', name: '已发送', color: 'text-blue-600' },
    { id: 'paid', name: '已付款', color: 'text-green-600' },
    { id: 'cancelled', name: '已取消', color: 'text-red-600' }
  ];

  onMount(() => {
    loadData();
  });

  const loadData = () => {
    try {
      // 加载销售单
      const storedInvoices = localStorage.getItem('invoice_history');
      if (storedInvoices) {
        invoices = JSON.parse(storedInvoices);
        filteredInvoices = invoices;
      }

      // 加载客户
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) {
        customers = JSON.parse(storedCustomers);
      }

      // 计算统计数据
      calculateStatistics();
      sortInvoices();
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const calculateStatistics = () => {
    statistics.invoiceCount = invoices.length;
    statistics.totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    statistics.unpaidAmount = invoices
      .filter(inv => inv.paymentStatus !== 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    // 今日销售
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter(inv => inv.createdAt.split('T')[0] === today);
    statistics.todaySales = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  };

  // 搜索和筛选
  const handleSearch = () => {
    let filtered = invoices;

    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(keyword) ||
        invoice.customerInfo.name.toLowerCase().includes(keyword) ||
        invoice.createdBy.toLowerCase().includes(keyword)
      );
    }

    // 状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    filteredInvoices = filtered;
    sortInvoices();
  };

  // 排序
  const sortInvoices = () => {
    filteredInvoices.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'customer':
          aValue = a.customerInfo.name.toLowerCase();
          bValue = b.customerInfo.name.toLowerCase();
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

  // 切换搜索显示
  const toggleSearch = () => {
    showSearch = !showSearch;
    if (!showSearch) {
      searchKeyword = '';
      filterStatus = 'all';
      filteredInvoices = invoices;
      sortInvoices();
    }
  };

  // 切换排序
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
    sortInvoices();
  };

  // 获取客户名称
  const getCustomerName = (invoice: Invoice): string => {
    if (invoice.customerId) {
      const customer = customers.find(c => c.id === invoice.customerId);
      return customer ? customer.name : invoice.customerInfo.name;
    }
    return invoice.customerInfo.name;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 获取状态显示
  const getStatusDisplay = (invoice: Invoice) => {
    const status = statusOptions.find(s => s.id === invoice.status);
    return status || statusOptions[0];
  };

  // 导航
  const viewInvoice = (invoiceId: string) => {
    goto(`/mobile/sales/${invoiceId}`);
  };

  // 响应式搜索
  $: if (searchKeyword !== undefined || filterStatus !== undefined) {
    handleSearch();
  }
</script>

<MobileHeader
  title="销售"
  showBack={true}
  showSearch={true}
  showActions={false}
  backgroundColor="bg-red-500"
  on:search={toggleSearch}
/>

<!-- 搜索栏 -->
{#if showSearch}
  <div class="bg-white border-b border-gray-200 p-4 space-y-3">
    <div class="relative">
      <input
        type="text"
        bind:value={searchKeyword}
        placeholder="输入销售单号、客户名称、制单人"
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <button
        on:click={toggleSearch}
        class="absolute right-3 top-2.5 text-red-500 font-medium"
      >
        搜索
      </button>
    </div>

    <!-- 状态筛选 -->
    <div class="flex items-center space-x-2 overflow-x-auto">
      <span class="text-sm text-gray-600 whitespace-nowrap">状态:</span>
      {#each statusOptions as status}
        <button
          on:click={() => filterStatus = status.id}
          class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                 {filterStatus === status.id 
                   ? 'bg-red-500 text-white' 
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {status.name}
        </button>
      {/each}
    </div>

    <!-- 排序选项 -->
    <div class="flex items-center space-x-2">
      <span class="text-sm text-gray-600">排序:</span>
      <button
        on:click={() => toggleSort('date')}
        class="text-sm text-red-500 font-medium"
      >
        日期 {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      <button
        on:click={() => toggleSort('amount')}
        class="text-sm text-red-500 font-medium"
      >
        金额 {sortBy === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      <button
        on:click={() => toggleSort('customer')}
        class="text-sm text-red-500 font-medium"
      >
        客户 {sortBy === 'customer' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
    </div>
  </div>
{/if}

<!-- 统计卡片 -->
<div class="p-4 bg-gray-50">
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-lg p-3 shadow-sm border">
      <div class="text-xs text-gray-500">今日销售</div>
      <div class="text-lg font-bold text-green-600">{formatCurrency(statistics.todaySales)}</div>
    </div>
    <div class="bg-white rounded-lg p-3 shadow-sm border">
      <div class="text-xs text-gray-500">未付金额</div>
      <div class="text-lg font-bold text-red-600">{formatCurrency(statistics.unpaidAmount)}</div>
    </div>
  </div>
</div>

<!-- 排序选项栏 -->
<div class="bg-white border-b border-gray-200 px-4 py-3">
  <div class="flex items-center space-x-2 overflow-x-auto">
    <span class="text-sm text-gray-600 whitespace-nowrap font-medium">排序:</span>
    <button
      on:click={() => toggleSort('date')}
      class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
             {sortBy === 'date'
               ? 'bg-red-500 text-white'
               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      日期 {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
    </button>
    <button
      on:click={() => toggleSort('amount')}
      class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
             {sortBy === 'amount'
               ? 'bg-red-500 text-white'
               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      金额 {sortBy === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
    </button>
    <button
      on:click={() => toggleSort('customer')}
      class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
             {sortBy === 'customer'
               ? 'bg-red-500 text-white'
               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      客户 {sortBy === 'customer' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
    </button>
  </div>
</div>

<!-- 销售单列表 -->
<div class="p-4">
  {#if filteredInvoices.length === 0}
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="text-gray-500 mb-4">
        {searchKeyword || filterStatus !== 'all' ? '暂时没有数据哦~' : '还没有销售单，请从客户页面创建'}
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredInvoices as invoice}
        <div
          class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          on:click={() => viewInvoice(invoice.id)}
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
              <p class="text-sm text-gray-600">{getCustomerName(invoice)}</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
              <div class="text-xs {getStatusDisplay(invoice).color}">
                {getStatusDisplay(invoice).name}
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-4">
              <span>{formatDate(invoice.createdAt)}</span>
              <span>制单人: {invoice.createdBy}</span>
            </div>
            <div class="flex items-center">
              {#if invoice.paymentStatus !== 'paid'}
                <span class="text-red-600">未付: {formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
              {:else}
                <span class="text-green-600">已付款</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

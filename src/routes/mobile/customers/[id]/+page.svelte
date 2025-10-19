<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Customer, Invoice } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 客户数据
  let customer: Customer | null = null;
  let customerInvoices: Invoice[] = [];
  let loading = true;
  let sortBy = 'date';
  let sortOrder = 'desc';

  // 获取客户ID
  $: customerId = $page.params.id;

  onMount(() => {
    console.log('客户详情页面加载 - customerId:', customerId);
    console.log('客户详情页面加载 - page.params:', $page.params);
    loadCustomerData();
  });

  const loadCustomerData = () => {
    try {
      console.log('开始加载客户数据 - customerId:', customerId);

      if (!customerId || customerId === 'undefined') {
        console.error('客户ID无效:', customerId);
        loading = false;
        return;
      }

      // 加载客户信息
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      console.log('所有客户数据:', customers);

      customer = customers.find((c: Customer) => c.id === customerId) || null;
      console.log('找到的客户:', customer);

      // 加载客户相关的销售单
      const invoices = JSON.parse(localStorage.getItem('invoice_history') || '[]');
      customerInvoices = invoices.filter((inv: Invoice) =>
        inv.customerId === customerId || inv.customerInfo.name === customer?.name
      );
      console.log('客户相关销售单:', customerInvoices);

      // 排序
      sortInvoices();
    } catch (error) {
      console.error('加载客户数据失败:', error);
    } finally {
      loading = false;
    }
  };

  const sortInvoices = () => {
    customerInvoices.sort((a, b) => {
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
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  // 计算客户总欠款
  const getTotalDebt = (): number => {
    if (!customer) return 0;
    const unpaidAmount = customerInvoices
      .filter(inv => inv.paymentStatus !== 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    return customer.initialDebt + unpaidAmount;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 格式化电话
  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  // 操作处理
  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEdit = () => {
    goto(`/mobile/customers/${customerId}/edit`);
  };

  const handleCreateInvoice = () => {
    console.log('创建销售单 - customerId:', customerId);
    console.log('创建销售单 - customer:', customer);
    if (!customerId || customerId === 'undefined') {
      alert('客户ID无效，无法创建销售单');
      return;
    }
    goto(`/mobile/sales/new?customerId=${customerId}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    goto(`/mobile/sales/${invoiceId}`);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
    sortInvoices();
  };

  // 禁用/启用客户
  const toggleCustomerStatus = () => {
    if (!customer) return;
    
    const confirmed = confirm(
      customer.isActive ? '确定要禁用此客户吗？' : '确定要启用此客户吗？'
    );
    
    if (confirmed) {
      customer.isActive = !customer.isActive;
      customer.updatedAt = new Date().toISOString();
      
      // 更新localStorage
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const index = customers.findIndex((c: Customer) => c.id === customerId);
      if (index !== -1) {
        customers[index] = customer;
        localStorage.setItem('customers', JSON.stringify(customers));
      }
    }
  };
</script>

{#if loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>
{:else if !customer}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-gray-500 mb-4">客户不存在</p>
      <button
        on:click={() => goto('/mobile/customers')}
        class="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        返回客户列表
      </button>
    </div>
  </div>
{:else}
  <MobileHeader 
    title="客户详情" 
    showBack={true}
    showActions={true}
    backgroundColor="bg-blue-500"
  >
    <div slot="actions" class="flex space-x-2">
      <!-- 拨打电话 -->
      {#if customer.phone}
        <button
          on:click={() => handleCall(customer.phone)}
          class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="拨打电话"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
        </button>
      {/if}
      
      <!-- 编辑 -->
      <button
        on:click={handleEdit}
        class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label="编辑"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
      
      <!-- 更多操作 -->
      <button
        class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label="更多"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
    </div>
  </MobileHeader>

  <div class="p-4 space-y-4">
    <!-- 客户基本信息 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{customer.name}</h2>
          {#if customer.category}
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
              {customer.category}
            </span>
          {/if}
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">总欠款</div>
          <div class="text-lg font-bold {getTotalDebt() > 0 ? 'text-red-600' : 'text-green-600'}">
            {formatCurrency(getTotalDebt())}
          </div>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="space-y-3">
        {#if customer.phone}
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span class="text-gray-900">{formatPhone(customer.phone)}</span>
            </div>
            <button
              on:click={() => handleCall(customer.phone)}
              class="text-blue-500 text-sm font-medium"
            >
              拨打
            </button>
          </div>
        {/if}

        {#if customer.backupPhone}
          <div class="flex items-center">
            <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span class="text-gray-600">{formatPhone(customer.backupPhone)}</span>
          </div>
        {/if}

        {#if customer.address}
          <div class="flex items-start">
            <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-gray-600">{customer.address}</span>
          </div>
        {/if}

        {#if customer.email}
          <div class="flex items-center">
            <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="text-gray-600">{customer.email}</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="grid grid-cols-3 gap-3">
      <button
        on:click={handleCreateInvoice}
        class="bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        创建销售单
      </button>
      <button
        class="bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
      >
        对账
      </button>
      <button
        on:click={toggleCustomerStatus}
        class="{customer.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'} text-white p-3 rounded-lg font-medium transition-colors"
      >
        {customer.isActive ? '禁用' : '启用'}
      </button>
    </div>

    <!-- 历史记录 -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-gray-900">历史记录</h3>
          <div class="flex space-x-2">
            <button
              on:click={() => toggleSort('date')}
              class="text-sm text-blue-500 font-medium"
            >
              排序 {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              on:click={() => toggleSort('amount')}
              class="text-sm text-blue-500 font-medium"
            >
              筛选
            </button>
          </div>
        </div>
      </div>

      {#if customerInvoices.length === 0}
        <div class="p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500">暂时没有数据哦~</p>
        </div>
      {:else}
        <div class="divide-y divide-gray-200">
          {#each customerInvoices as invoice}
            <div
              class="p-4 hover:bg-gray-50 cursor-pointer"
              on:click={() => handleViewInvoice(invoice.id)}
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  <div class="text-sm text-gray-500">{formatDate(invoice.createdAt)}</div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                  <div class="text-xs {invoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}">
                    {invoice.paymentStatus === 'paid' ? '已付款' : '未付款'}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

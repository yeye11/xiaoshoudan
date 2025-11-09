<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import DeliveryNote from '$lib/components/DeliveryNote.svelte';
  import MobileImageExport from '$lib/components/MobileImageExport.svelte';
  import type { Invoice, Customer } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let invoice: Invoice | null = null;
  let customer: Customer | null = null;
  let invoiceId: string;
  let loading = true;
  let error = '';

  onMount(() => {
    invoiceId = $page.params.id || '';
    loadInvoice();
  });

  const loadInvoice = () => {
    try {
      const storedInvoices = localStorage.getItem('invoice_history');
      if (storedInvoices) {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        invoice = invoices.find(inv => inv.id === invoiceId) || null;
        
        if (invoice) {
          // 加载客户信息
          const storedCustomers = localStorage.getItem('customers');
          if (storedCustomers) {
            const customers: Customer[] = JSON.parse(storedCustomers);
            customer = customers.find(c => c.id === invoice?.customerId) || null;
          }
        } else {
          error = '未找到指定的销售单';
        }
      } else {
        error = '没有找到销售单数据';
      }
    } catch (err) {
      console.error('加载销售单失败:', err);
      error = '加载销售单失败';
    } finally {
      loading = false;
    }
  };

  const handleEdit = () => {
    goto(`/mobile/sales-management/sales/${invoiceId}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个销售单吗？')) {
      try {
        const storedInvoices = localStorage.getItem('invoice_history');
        if (storedInvoices) {
          const invoices: Invoice[] = JSON.parse(storedInvoices);
          const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
          localStorage.setItem('invoice_history', JSON.stringify(filteredInvoices));
          goto('/mobile/sales');
        }
      } catch (err) {
        console.error('删除销售单失败:', err);
        alert('删除失败，请重试');
      }
    }
  };

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'draft': { name: '草稿', color: 'bg-gray-100 text-gray-800' },
      'confirmed': { name: '已确认', color: 'bg-blue-100 text-blue-800' },
      'delivered': { name: '已送货', color: 'bg-green-100 text-green-800' },
      'cancelled': { name: '已取消', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { name: '未知', color: 'bg-gray-100 text-gray-800' };
  };

  // 获取付款状态显示
  const getPaymentStatusDisplay = (status: string) => {
    const statusMap = {
      'unpaid': { name: '未付款', color: 'bg-red-100 text-red-800' },
      'partial': { name: '部分付款', color: 'bg-yellow-100 text-yellow-800' },
      'paid': { name: '已付款', color: 'bg-green-100 text-green-800' }
    };
    return statusMap[status] || { name: '未知', color: 'bg-gray-100 text-gray-800' };
  };
</script>

<svelte:head>
  <title>送货单详情 - 仁腾装饰材料管理系统</title>
</svelte:head>

<MobileHeader 
  title={invoice ? `送货单 ${invoice.invoiceNumber}` : '送货单详情'}
  showBack={true}
  backgroundColor="bg-green-500"
>
  <div slot="actions">
    {#if invoice && invoice.status === 'draft'}
      <button
        on:click={handleEdit}
        class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label="编辑"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
    {/if}
    <button
      on:click={handlePrint}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
      aria-label="打印"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
      </svg>
    </button>
  </div>
</MobileHeader>

<div class="p-4 space-y-6 mobile-content">
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      <p class="text-gray-500 mt-2">加载中...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p class="text-red-600">{error}</p>
      <button
        on:click={() => goto('/mobile/sales')}
        class="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
      >
        返回销售单列表
      </button>
    </div>
  {:else if invoice}
    <!-- 移动端图片导出按钮 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <h3 class="font-medium text-gray-900 mb-3">保存选项</h3>
      <MobileImageExport 
        targetElement={null} 
        fileName={`送货单-${invoice.invoiceNumber}`}
        showButton={true}
      />
    </div>
    
    <!-- 使用专业的送货单格式 -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <DeliveryNote {invoice} showActions={false} />
    </div>

    <!-- 状态信息 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-900">单据状态</h3>
        <div class="flex space-x-2">
          <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusDisplay(invoice.status).color}">
            {getStatusDisplay(invoice.status).name}
          </div>
          <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getPaymentStatusDisplay(invoice.paymentStatus).color}">
            {getPaymentStatusDisplay(invoice.paymentStatus).name}
          </div>
        </div>
      </div>

      {#if invoice.paymentStatus !== 'paid'}
        <div class="text-sm text-gray-600">
          <span>未付金额:</span>
          <span class="ml-2 text-red-600 font-medium">{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
        </div>
      {/if}
    </div>

    <!-- 客户信息 -->
    {#if customer}
      <div class="bg-white rounded-lg p-4 shadow-sm border">
        <h3 class="font-medium text-gray-900 mb-3">客户信息</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">客户名称:</span>
            <span class="font-medium">{customer.name}</span>
          </div>
          {#if customer.phone}
            <div class="flex justify-between">
              <span class="text-gray-600">联系电话:</span>
              <a href="tel:{customer.phone}" class="text-blue-600 font-medium">{customer.phone}</a>
            </div>
          {/if}
          {#if customer.address}
            <div class="flex justify-between">
              <span class="text-gray-600">地址:</span>
              <span class="font-medium text-right max-w-48">{customer.address}</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- 操作按钮 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <h3 class="font-medium text-gray-900 mb-3">操作</h3>
      <div class="space-y-2">
        {#if invoice.status === 'draft'}
          <button
            on:click={handleEdit}
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            编辑送货单
          </button>
        {/if}
        
        <button
          on:click={handlePrint}
          class="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          打印送货单
        </button>
        
        {#if invoice.status === 'draft'}
          <button
            on:click={handleDelete}
            class="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            删除送货单
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  @media print {
    .mobile-content {
      padding: 0 !important;
    }
    
    .bg-white:not(.delivery-note) {
      display: none !important;
    }
  }
</style>

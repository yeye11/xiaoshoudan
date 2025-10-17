<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import { onMount } from 'svelte';

  // 主要功能模块
  const businessModules = [
    {
      id: 'sales',
      name: '销售',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-red-500',
      href: '/mobile/sales'
    },
    {
      id: 'purchase',
      name: '采购',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5m0 0L4 3H2m5 10v6a1 1 0 001 1h1m0-7h6m2 5.5a.5.5 0 11-1 0 .5.5 0 011 0zM9 19.5a.5.5 0 11-1 0 .5.5 0 011 0z',
      color: 'bg-orange-500',
      href: '/mobile/purchase'
    },
    {
      id: 'customers',
      name: '客户',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'bg-blue-500',
      href: '/mobile/customers'
    },
    {
      id: 'suppliers',
      name: '供应商',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'bg-red-500',
      href: '/mobile/suppliers'
    },
    {
      id: 'products',
      name: '产品',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'bg-orange-500',
      href: '/mobile/products'
    },
    {
      id: 'inventory',
      name: '库存',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7l9 6 9-6',
      color: 'bg-blue-500',
      href: '/mobile/inventory'
    },
    {
      id: 'expenses',
      name: '费用收入',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      color: 'bg-red-500',
      href: '/mobile/expenses'
    },
    {
      id: 'returns',
      name: '退货',
      icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
      color: 'bg-orange-500',
      href: '/mobile/returns'
    }
  ];

  // 统计数据
  let statistics = {
    totalDebt: 4425.50,
    todaySales: 0,
    monthSales: 0,
    customerCount: 0
  };

  onMount(() => {
    // 加载统计数据
    loadStatistics();
    console.log('移动端页面已加载');
  });

  const loadStatistics = () => {
    // 从localStorage加载数据进行统计
    try {
      const invoices = JSON.parse(localStorage.getItem('invoice_history') || '[]');
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      // 计算今日销售
      const today = new Date().toISOString().split('T')[0];
      const todayInvoices = invoices.filter((inv: any) => inv.date === today);
      statistics.todaySales = todayInvoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
      
      // 计算本月销售
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthInvoices = invoices.filter((inv: any) => inv.date.startsWith(currentMonth));
      statistics.monthSales = monthInvoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
      
      // 客户数量
      statistics.customerCount = customers.length;
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };
</script>

<MobileHeader 
  title="买卖" 
  backgroundColor="bg-blue-500"
  textColor="text-white"
>
  <div slot="subtitle" class="bg-yellow-400 text-yellow-900 px-4 py-2 text-sm">
    <div class="flex items-center justify-between">
      <span class="flex items-center">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
        </svg>
        累计欠款: {formatCurrency(statistics.totalDebt)}
      </span>
    </div>
  </div>
</MobileHeader>

<div class="p-4 space-y-6">
  <!-- 快速统计卡片 -->
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="text-sm text-gray-600">今日销售</div>
      <div class="text-xl font-bold text-green-600">{formatCurrency(statistics.todaySales)}</div>
    </div>
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="text-sm text-gray-600">本月销售</div>
      <div class="text-xl font-bold text-blue-600">{formatCurrency(statistics.monthSales)}</div>
    </div>
  </div>

  <!-- 功能模块网格 -->
  <div class="grid grid-cols-2 gap-4">
    {#each businessModules as module}
      <a
        href={module.href}
        class="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-3"
      >
        <div class="w-12 h-12 {module.color} rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={module.icon}></path>
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-900">{module.name}</span>
      </a>
    {/each}
  </div>

  <!-- 快速操作 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
    <div class="grid grid-cols-2 gap-3">
      <a
        href="/mobile/sales/new"
        class="bg-blue-500 text-white rounded-lg p-3 text-center font-medium hover:bg-blue-600 transition-colors"
      >
        创建销售单
      </a>
      <a
        href="/mobile/customers/new"
        class="bg-green-500 text-white rounded-lg p-3 text-center font-medium hover:bg-green-600 transition-colors"
      >
        添加客户
      </a>
      <a
        href="/mobile/products/new"
        class="bg-orange-500 text-white rounded-lg p-3 text-center font-medium hover:bg-orange-600 transition-colors"
      >
        添加产品
      </a>
      <a
        href="/mobile/inventory"
        class="bg-purple-500 text-white rounded-lg p-3 text-center font-medium hover:bg-purple-600 transition-colors"
      >
        查看库存
      </a>
    </div>
  </div>
</div>

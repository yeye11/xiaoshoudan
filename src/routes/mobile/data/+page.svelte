<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Invoice, Customer, Product } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';

  // 数据统计
  let statistics = {
    // 销售统计
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    yearSales: 0,
    
    // 客户统计
    totalCustomers: 0,
    activeCustomers: 0,
    totalDebt: 0,
    
    // 产品统计
    totalProducts: 0,
    activeProducts: 0,
    
    // 订单统计
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    draftOrders: 0
  };

  // 图表数据
  let salesTrend: { date: string; amount: number }[] = [];
  let topCustomers: { name: string; amount: number; count: number }[] = [];
  let topProducts: { name: string; amount: number; count: number }[] = [];

  onMount(() => {
    loadStatistics();
  });

  const loadStatistics = () => {
    try {
      // 加载数据
      const invoices: Invoice[] = JSON.parse(localStorage.getItem('invoice_history') || '[]');
      const customers: Customer[] = JSON.parse(localStorage.getItem('customers') || '[]');
      const products: Product[] = JSON.parse(localStorage.getItem('products') || '[]');

      // 计算基础统计
      calculateBasicStatistics(invoices, customers, products);
      
      // 计算销售趋势
      calculateSalesTrend(invoices);
      
      // 计算排行榜
      calculateTopCustomers(invoices);
      calculateTopProducts(invoices);
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const calculateBasicStatistics = (invoices: Invoice[], customers: Customer[], products: Product[]) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

    // 销售统计
    statistics.totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    statistics.todaySales = invoices.filter(inv => inv.createdAt.split('T')[0] === today).reduce((sum, inv) => sum + inv.totalAmount, 0);
    statistics.weekSales = invoices.filter(inv => inv.createdAt.split('T')[0] >= weekStart).reduce((sum, inv) => sum + inv.totalAmount, 0);
    statistics.monthSales = invoices.filter(inv => inv.createdAt.split('T')[0] >= monthStart).reduce((sum, inv) => sum + inv.totalAmount, 0);
    statistics.yearSales = invoices.filter(inv => inv.createdAt.split('T')[0] >= yearStart).reduce((sum, inv) => sum + inv.totalAmount, 0);

    // 客户统计
    statistics.totalCustomers = customers.length;
    statistics.activeCustomers = customers.filter(c => c.isActive).length;
    statistics.totalDebt = customers.reduce((sum, c) => sum + c.initialDebt, 0) + 
      invoices.filter(inv => inv.paymentStatus !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    // 产品统计
    statistics.totalProducts = products.length;
    statistics.activeProducts = products.filter(p => p.isActive).length;

    // 订单统计
    statistics.totalOrders = invoices.length;
    statistics.paidOrders = invoices.filter(inv => inv.paymentStatus === 'paid').length;
    statistics.unpaidOrders = invoices.filter(inv => inv.paymentStatus === 'unpaid').length;
    statistics.draftOrders = invoices.filter(inv => inv.status === 'draft').length;
  };

  const calculateSalesTrend = (invoices: Invoice[]) => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayInvoices = invoices.filter(inv => inv.createdAt.split('T')[0] === dateStr);
      const amount = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

      last7Days.push({
        date: dateStr,
        amount
      });
    }

    salesTrend = last7Days;
  };

  const calculateTopCustomers = (invoices: Invoice[]) => {
    const customerStats = new Map<string, { amount: number; count: number }>();
    
    invoices.forEach(invoice => {
      const customerName = invoice.customerInfo.name;
      if (customerStats.has(customerName)) {
        const stats = customerStats.get(customerName)!;
        stats.amount += invoice.totalAmount;
        stats.count += 1;
      } else {
        customerStats.set(customerName, { amount: invoice.totalAmount, count: 1 });
      }
    });
    
    topCustomers = Array.from(customerStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const calculateTopProducts = (invoices: Invoice[]) => {
    const productStats = new Map<string, { amount: number; count: number }>();
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (productStats.has(item.productName)) {
          const stats = productStats.get(item.productName)!;
          stats.amount += item.amount;
          stats.count += item.quantity;
        } else {
          productStats.set(item.productName, { amount: item.amount, count: item.quantity });
        }
      });
    });
    
    topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 获取增长率
  const getGrowthRate = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const rate = ((current - previous) / previous * 100).toFixed(1);
    return `${rate > 0 ? '+' : ''}${rate}%`;
  };
</script>

<MobileHeader 
  title="数据" 
  showBack={true}
  backgroundColor="bg-green-500"
/>

<div class="p-4 space-y-6">
  <!-- 核心指标 -->
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="text-sm text-gray-500">今日销售</div>
      <div class="text-2xl font-bold text-green-600">{formatCurrency(statistics.todaySales)}</div>
      <div class="text-xs text-gray-400 mt-1">
        本月: {formatCurrency(statistics.monthSales)}
      </div>
    </div>
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <div class="text-sm text-gray-500">总欠款</div>
      <div class="text-2xl font-bold text-red-600">{formatCurrency(statistics.totalDebt)}</div>
      <div class="text-xs text-gray-400 mt-1">
        未付订单: {statistics.unpaidOrders}
      </div>
    </div>
  </div>

  <!-- 销售统计 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">销售统计</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-lg font-bold text-gray-900">{formatCurrency(statistics.weekSales)}</div>
        <div class="text-sm text-gray-500">本周销售</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-gray-900">{formatCurrency(statistics.yearSales)}</div>
        <div class="text-sm text-gray-500">本年销售</div>
      </div>
    </div>
  </div>

  <!-- 销售趋势 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">近7天销售趋势</h3>
    <div class="space-y-2">
      {#each salesTrend as day}
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">{formatDate(day.date)}</span>
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full" 
                style="width: {Math.max(5, (day.amount / Math.max(...salesTrend.map(d => d.amount)) * 100))}%"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-900 w-16 text-right">
              {formatCurrency(day.amount)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- 客户排行 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">客户排行榜</h3>
    {#if topCustomers.length === 0}
      <p class="text-gray-500 text-center py-4">暂无数据</p>
    {:else}
      <div class="space-y-3">
        {#each topCustomers as customer, index}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                {index + 1}
              </div>
              <div>
                <div class="font-medium text-gray-900">{customer.name}</div>
                <div class="text-xs text-gray-500">{customer.count} 笔订单</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">{formatCurrency(customer.amount)}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 产品排行 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">产品排行榜</h3>
    {#if topProducts.length === 0}
      <p class="text-gray-500 text-center py-4">暂无数据</p>
    {:else}
      <div class="space-y-3">
        {#each topProducts as product, index}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">
                {index + 1}
              </div>
              <div>
                <div class="font-medium text-gray-900">{product.name}</div>
                <div class="text-xs text-gray-500">销量: {product.count}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">{formatCurrency(product.amount)}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 业务概览 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">业务概览</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-lg font-bold text-blue-600">{statistics.totalCustomers}</div>
        <div class="text-sm text-gray-500">总客户数</div>
        <div class="text-xs text-gray-400">活跃: {statistics.activeCustomers}</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-orange-600">{statistics.totalProducts}</div>
        <div class="text-sm text-gray-500">总产品数</div>
        <div class="text-xs text-gray-400">在售: {statistics.activeProducts}</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-green-600">{statistics.totalOrders}</div>
        <div class="text-sm text-gray-500">总订单数</div>
        <div class="text-xs text-gray-400">已付: {statistics.paidOrders}</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-red-600">{statistics.unpaidOrders}</div>
        <div class="text-sm text-gray-500">未付订单</div>
        <div class="text-xs text-gray-400">草稿: {statistics.draftOrders}</div>
      </div>
    </div>
  </div>
</div>

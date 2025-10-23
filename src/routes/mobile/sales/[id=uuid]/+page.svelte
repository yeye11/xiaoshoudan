<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import SalesInvoice from '$lib/components/SalesInvoice.svelte';
  import type { Invoice, Customer } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy, tick } from 'svelte';
  import { IMAGE_EXPORT_CONFIG } from '$lib/utils/imageExport';
  import { printElement } from '$lib/utils/printExport';
  import { isMobileDevice } from '$lib/utils/deviceDetect';

  let invoice: Invoice | null = null;
  let customer: Customer | null = null;
  let invoiceId: string;
  let loading = true;
  let error = '';
  let invoiceContainer: HTMLElement | null = null;

  const BASE_WIDTH = IMAGE_EXPORT_CONFIG.fixedCssWidth;
  let viewportRef: HTMLElement | null = null;
  let contentRef: HTMLElement | null = null;
  let scale = 1;
  let containerH: string | null = null; // 跟随“实际绘制高度”（scale 后）
  const resizeHandler = () => updateScale();

  onMount(() => {
    // 1. 加载销售单数据
    invoiceId = $page.params.id as string;
    loadInvoice();

    // 2. 检测设备类型
    isMobile = isMobileDevice();
    console.log('📱 设备检测 - 是否为移动设备:', isMobile);

    // 3. 初次渲染后按设备宽度计算缩放
    setTimeout(() => {
      updateScale();
      console.log('📱 页面加载完成');
    }, 100);

    // 4. 监听窗口大小变化
    window.addEventListener('resize', resizeHandler);
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeHandler);
  });

  $: if (invoice) {
    tick().then(() => updateScale());
  }

  async function updateScale() {
    await tick();
    // 取设备/视口宽度，优先使用容器宽度；再减去左右边框的安全余量，避免被裁切
    const vw = typeof window !== 'undefined' ? (window.innerWidth || 0) : 0;
    const docW = typeof document !== 'undefined' ? (document.documentElement?.clientWidth || 0) : 0;
    const containerW = viewportRef?.clientWidth || 0;
    const SAFE_BORDER_GUARD = 2; // 默认 tailwind border(1px) * 2
    let available = containerW > 0 ? containerW : Math.min(docW, vw);
    available = Math.max(0, available - SAFE_BORDER_GUARD);
    const next = Math.min(1, Math.max(0.1, available / BASE_WIDTH));
    scale = Number.isFinite(next) && next > 0 ? next : 1;

    // 参考“314.93 那个容器”的计算：读取绘制后的真实高度
    const rect = contentRef?.getBoundingClientRect();
    containerH = rect ? `${rect.height}px` : null;
  }

  const loadInvoice = () => {
    try {
      // 加载销售单
      const storedInvoices = localStorage.getItem('invoice_history');
      if (storedInvoices) {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        invoice = invoices.find(inv => inv.id === invoiceId) || null;

        if (!invoice) {
          error = '销售单不存在';
          loading = false;
          return;
        }

        // 加载客户信息
        if (invoice && invoice.customerId) {
          const storedCustomers = localStorage.getItem('customers');
          if (storedCustomers) {
            const customers: Customer[] = JSON.parse(storedCustomers);
            customer = customers.find(c => c.id === invoice!.customerId) || null;
          }
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
    goto(`/mobile/sales/${invoiceId}/edit`);
  };

  // 检测是否为移动设备
  let isMobile = false;

  // 获取打印/导出按钮的标签
  function getPrintButtonLabel(): string {
    return isMobile ? '保存PDF' : '打印';
  }

  // 打印功能
  const handlePrint = async () => {
    const target = contentRef || invoiceContainer;
    if (!target) {
      alert('无法打印：未找到销售单内容');
      return;
    }

    try {
      await printElement(target as HTMLElement);
    } catch (error) {
      console.error('打印失败:', error);
      alert(`打印失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
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
      draft: { name: '草稿', color: 'text-yellow-600 bg-yellow-100' },
      sent: { name: '已发送', color: 'text-blue-600 bg-blue-100' },
      paid: { name: '已付款', color: 'text-green-600 bg-green-100' },
      cancelled: { name: '已取消', color: 'text-red-600 bg-red-100' }
    } as const;
    const key = status as keyof typeof statusMap;
    return statusMap[key] ?? statusMap.draft;
  };

  // 获取支付状态显示
  const getPaymentStatusDisplay = (paymentStatus: string) => {
    const statusMap = {
      unpaid: { name: '未付款', color: 'text-red-600' },
      partial: { name: '部分付款', color: 'text-yellow-600' },
      paid: { name: '已付款', color: 'text-green-600' }
    } as const;
    const key = paymentStatus as keyof typeof statusMap;
    return statusMap[key] ?? statusMap.unpaid;
  };
</script>

<MobileHeader
  title="销售单详情"
  showBack={true}
  showActions={true}
  backgroundColor="bg-red-500"
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
      aria-label={getPrintButtonLabel()}
      title={getPrintButtonLabel()}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
      </svg>
    </button>
  </div>
</MobileHeader>

<div class="p-4 space-y-6">
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
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
    <!-- 使用专业的销售单格式 -->
    <div bind:this={invoiceContainer} class="bg-white rounded-lg shadow-sm border overflow-hidden print-target" style="height: {containerH ?? 'auto'};">
      <div bind:this={viewportRef} style="position: relative; width: 100%; display: flex; justify-content: center;">
        <div bind:this={contentRef} style="width: {BASE_WIDTH}px; transform: scale({scale}); transform-origin: top center;">
          <SalesInvoice {invoice} showActions={false} fixedLayout={true} />
        </div>
      </div>
    </div>


    <!-- 状态信息 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border mt-6">
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

    <!-- 操作按钮 -->
    <div class="space-y-3 pb-6 mt-6">
      <!-- 第一行：编辑和删除（仅草稿状态） -->
      {#if invoice.status === 'draft'}
        <div class="flex space-x-3">
          <button
            on:click={handleEdit}
            class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            编辑
          </button>
          <button
            on:click={handleDelete}
            class="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      {/if}

      <!-- 第二行：打印/保存PDF功能（根据设备类型自动选择） -->
      <div class="flex space-x-3">
        <!-- 智能打印/保存PDF按钮 -->
        <button
          on:click={handlePrint}
          class="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          {getPrintButtonLabel()}
        </button>
      </div>
    </div>
  {/if}
</div>


<style>
  /* 采用“打印隔离层”方案：把要打印的内容克隆到 #print-overlay，
     仅保留该层，其余根节点隐藏，避免祖先被隐藏导致目标不可见 */
  @media print {
    /* 隐藏除了打印overlay之外的所有内容 */
    :global(body.printing-only > :not(#print-overlay)) {
      display: none !important;
    }

    /* 显示打印overlay */
    :global(#print-overlay) {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      z-index: 9999 !important;
    }

    /* 打印目标样式 */
    :global(#print-overlay .print-target),
    :global(#print-overlay > *) {
      position: static !important;
      width: 190mm !important;
      max-width: 190mm !important;
      margin: 0 auto !important;
      padding: 10mm !important;
      box-shadow: none !important;
      border: 0 !important;
      background: white !important;
      transform: none !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: visible !important;
    }

    /* 移除所有transform */
    :global(#print-overlay *[style*="transform"]) {
      transform: none !important;
    }

    /* 确保销售单内容可见 */
    :global(#print-overlay .sales-invoice) {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* 打印页面设置 */
    @page {
      size: A4;
      margin: 10mm;
    }
  }
</style>

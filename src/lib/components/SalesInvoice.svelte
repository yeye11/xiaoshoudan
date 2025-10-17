<script lang="ts">
  import type { Invoice } from '$lib/types/invoice.ts';
  import { numberToChineseSimple } from '$lib/utils/numberToChinese.ts';
  import { exportElementAsImage, formatDate as formatDateUtil } from '$lib/utils/imageExport.ts';
  import MobileImageExport from './MobileImageExport.svelte';

  export let invoice: Invoice;
  export let showActions = true;

  let salesInvoiceRef: HTMLElement;
  let isExporting = false;

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  // 使用统一的日期格式化函数
  const formatDate = formatDateUtil;

  // 生成空行
  const generateEmptyRows = (count: number) => {
    return Array(count).fill(null);
  };

  // 导出为图片的函数
  const exportAsImage = async () => {
    if (!salesInvoiceRef) return;

    isExporting = true;

    try {
      const fileName = `销售单-${invoice.invoiceNumber}-${formatDate(invoice.date)}`;
      await exportElementAsImage(salesInvoiceRef, fileName);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出图片失败，请重试');
    } finally {
      isExporting = false;
    }
  };

  // 打印销售单
  const printSalesInvoice = () => {
    window.print();
  };
</script>

<!-- 操作按钮 -->
{#if showActions}
  <div class="mb-4 print:hidden">
    <!-- 移动端图片导出组件 -->
    <div class="block md:hidden mb-4">
      <MobileImageExport
        targetElement={salesInvoiceRef}
        fileName="销售单"
        showButton={true}
      />
    </div>

    <!-- 桌面端按钮 -->
    <div class="hidden md:flex space-x-3 action-buttons justify-center">
      <button
        on:click={exportAsImage}
        disabled={isExporting}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isExporting ? '导出中...' : '保存为图片'}
      </button>

      <button
        on:click={printSalesInvoice}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        打印/保存PDF
      </button>
    </div>
  </div>
{/if}

<div
  bind:this={salesInvoiceRef}
  class="sales-invoice print:shadow-none"
  style="width: 1280px; min-height: 720px; margin: 0 auto; padding: 40px; box-sizing: border-box; font-family: 'Microsoft YaHei', 'SimSun', serif; background-color: white;"
>
  <!-- 公司抬头 -->
  <div class="text-center mb-4 border-b border-gray-400 pb-3">
    <h1 class="text-xl font-bold mb-1" style="color: #000;">{invoice.companyInfo.name}</h1>
    <div class="text-xs flex justify-center space-x-8 mb-1" style="color: #333;">
      <span>地址：{invoice.companyInfo.address}</span>
      <span>电话：{invoice.companyInfo.phone}</span>
    </div>
    <h2 class="text-lg font-bold" style="color: #000;">销 售 单</h2>
  </div>

  <!-- 基本信息 -->
  <div class="grid grid-cols-3 gap-4 mb-2 text-xs" style="align-items: center;">
    <div style="display: flex; align-items: center;"><strong>客户名称：</strong><span>{invoice.customerInfo.name}</span></div>
    <div style="display: flex; align-items: center;"><strong>客户电话：</strong><span>{invoice.customerInfo.phone || ''}</span></div>
    <div style="display: flex; align-items: center;"><strong>制单人：</strong><span>{invoice.createdBy}</span></div>
  </div>

  <div class="grid grid-cols-3 gap-4 mb-3 text-xs" style="align-items: center;">
    <div style="display: flex; align-items: center;"><strong>客户地址：</strong><span>{invoice.customerInfo.address || ''}</span></div>
    <div style="display: flex; align-items: center;"><strong>物流名称：</strong><span></span></div>
    <div style="display: flex; align-items: center;"><strong>开单日期：</strong><span>{formatDate(invoice.date)}</span></div>
  </div>
  
  <!-- 商品明细表格 -->
  <div class="mb-3">
    <table class="w-full border-collapse text-xs" style="border: 1px solid #000;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th class="px-2 py-1 text-center font-bold" style="width: 8%; border: 1px solid #000;">序号</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 30%; border: 1px solid #000;">产品名称</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 20%; border: 1px solid #000;">规格型号</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 10%; border: 1px solid #000;">单位</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 10%; border: 1px solid #000;">数量</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 12%; border: 1px solid #000;">单价</th>
          <th class="px-2 py-1 text-center font-bold" style="width: 10%; border: 1px solid #000;">金额</th>
        </tr>
      </thead>
      <tbody>
        <!-- 实际商品行 -->
        {#each invoice.items as item, index}
          <tr>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{index + 1}</td>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{item.productName}</td>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{item.specification}</td>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{item.unit}</td>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{item.quantity}</td>
            <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{formatCurrency(item.unitPrice)}</td>
            <td class="px-2 py-1 text-center font-semibold" style="border: 1px solid #000;">{formatCurrency(item.amount)}</td>
          </tr>
        {/each}

        <!-- 空行填充 -->
        {#each generateEmptyRows(Math.max(0, 8 - invoice.items.length)) as _}
          <tr>
            <td class="px-2 py-1 text-center" style="height: 24px; border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
            <td class="px-2 py-1" style="border: 1px solid #000;"></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <!-- 合计信息 -->
  <div class="flex justify-between items-center mb-2 text-xs">
    <div>
      <span class="font-medium">合计（大写）：</span>
      <span class="font-bold" style="color: #d32f2f;">{numberToChineseSimple(invoice.totalAmount)}</span>
    </div>
    <div>
      <span class="font-medium">合计：</span>
      <span class="text-sm font-bold" style="color: #d32f2f;">{formatCurrency(invoice.totalAmount)}</span>
    </div>
  </div>

  <!-- 备注和条款 -->
  <div class="mb-2 text-xs">
    {#if invoice.notes}
      <p class="mb-1"><span class="font-medium">备注：</span>{invoice.notes}</p>
    {/if}
    <div class="flex justify-between items-center">
      <p style="color: #666;">以上货品请核对清楚，如有质量问题请在3日内致电告知本公司，谢谢！</p>
      <span style="color: #666;">第1页/共1页</span>
    </div>
  </div>

  <!-- 签名区域 -->
  <div class="grid grid-cols-2 gap-8 text-xs mt-3">
    <div>
      <span class="font-medium">销售单位及经手人（签章）：</span>
    </div>
    <div>
      <span class="font-medium">客户单位及经手人（签章）：</span>
    </div>
  </div>
</div>

<!-- 操作按钮 -->
<div class="no-print flex justify-center space-x-4 mt-6 mb-8">
  <button
    on:click={() => window.print()}
    class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
  >
    🖨️ 打印/保存PDF
  </button>
  
  <button
    on:click={exportAsImage}
    class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
  >
    📸 保存为图片
  </button>
</div>

<style>
  .sales-invoice {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-radius: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  @media print {
    .no-print {
      display: none !important;
    }

    .sales-invoice {
      box-shadow: none;
      border: none;
      margin: 0;
      padding: 20px;
      width: 210mm !important;
      height: 297mm !important;
      background: white !important;
    }

    @page {
      margin: 10mm;
      size: A4;
    }
  }

  /* 确保表格边框在所有浏览器中正确显示 */
  table {
    border-spacing: 0;
    border-collapse: collapse;
  }

  th, td {
    border-width: 1px;
    border-style: solid;
    border-color: #374151;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .sales-invoice {
      width: 100% !important;
      height: auto !important;
      padding: 15px !important;
      font-size: 10px !important;
    }
  }
</style>

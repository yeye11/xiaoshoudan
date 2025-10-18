<script lang="ts">
  import type { Invoice } from '$lib/types/invoice';
  import { formatCurrency } from '$lib/types/invoice';

  export let invoice: Invoice;
  export let onBack: () => void;
  export let onPrint: () => void;

  // 格式化日期显示
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 打印功能
  function handlePrint() {
    window.print();
    onPrint();
  }

  // 导出PDF功能（简单实现）
  function exportToPDF() {
    // 这里可以集成更专业的PDF生成库
    window.print();
  }

  // 复制到剪贴板
  async function copyToClipboard() {
    const text = generateTextVersion();
    try {
      await navigator.clipboard.writeText(text);
      alert('销售单内容已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  }

  // 生成文本版本
  function generateTextVersion(): string {
    let text = `${invoice.companyInfo.name}\n`;
    text += `地址: ${invoice.companyInfo.address}\n`;
    text += `电话: ${invoice.companyInfo.phone}\n\n`;
    text += `送货单\n\n`;
    text += `客户名称: ${invoice.customerInfo.name}\n`;
    text += `制单人: ${invoice.createdBy}\n`;
    text += `送货日期: ${formatDate(invoice.date)}\n\n`;
    text += `商品明细:\n`;
    text += `序号\t产品名称\t规格型号\t单位\t数量\t单价\t金额\n`;

    invoice.items.forEach((item, index) => {
      text += `${index + 1}\t${item.productName}\t${item.specification}\t${item.unit}\t${item.quantity}\t${formatCurrency(item.unitPrice)}\t${formatCurrency(item.amount)}\n`;
    });

    text += `\n合计: ${formatCurrency(invoice.totalAmount)}`;
    return text;
  }
</script>

<div class="invoice-preview">
  <!-- 操作按钮栏 -->
  <div class="no-print mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
    <button
      on:click={onBack}
      class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      返回编辑
    </button>

    <div class="flex space-x-2">
      <button
        on:click={copyToClipboard}
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        复制
      </button>

      <button
        on:click={exportToPDF}
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        导出PDF
      </button>

      <button
        on:click={handlePrint}
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        打印
      </button>
    </div>
  </div>

  <!-- 销售单内容 -->
  <div class="invoice-content bg-white p-8 shadow-lg max-w-4xl mx-auto" style="min-height: 297mm;">
    <!-- 公司信息头部 -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{invoice.companyInfo.name}</h1>
      <p class="text-sm text-gray-600 mb-1">地址: {invoice.companyInfo.address}</p>
      <p class="text-sm text-gray-600">电话: {invoice.companyInfo.phone}</p>
    </div>

    <!-- 送货单标题 -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900">送货单</h2>
    </div>

    <!-- 客户信息和基本信息 -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <div class="mb-2">
          <span class="font-medium text-gray-700">客户名称: </span>
          <span class="text-gray-900">{invoice.customerInfo.name}</span>
        </div>
        {#if invoice.customerInfo.address}
          <div class="mb-2">
            <span class="font-medium text-gray-700">客户地址: </span>
            <span class="text-gray-900">{invoice.customerInfo.address}</span>
          </div>
        {/if}
        {#if invoice.customerInfo.phone}
          <div class="mb-2">
            <span class="font-medium text-gray-700">客户电话: </span>
            <span class="text-gray-900">{invoice.customerInfo.phone}</span>
          </div>
        {/if}
      </div>
      <div class="text-right">
        <div class="mb-2">
          <span class="font-medium text-gray-700">制单人: </span>
          <span class="text-gray-900">{invoice.createdBy}</span>
        </div>
        <div class="mb-2">
          <span class="font-medium text-gray-700">送货日期: </span>
          <span class="text-gray-900">{formatDate(invoice.date)}</span>
        </div>
        <div class="mb-2">
          <span class="font-medium text-gray-700">单据编号: </span>
          <span class="text-gray-900">{invoice.invoiceNumber}</span>
        </div>
      </div>
    </div>

    <!-- 商品明细表格 -->
    <div class="mb-8">
      <table class="w-full border-collapse border border-gray-400">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">序号</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">产品名称</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">规格型号</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">单位</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">数量</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">单价</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">金额</div></th>
            <th class="border border-gray-400 px-3 py-2 text-center font-medium text-gray-700"><div class="cell-v-center center">备注</div></th>
          </tr>
        </thead>
        <tbody>
          {#each invoice.items as item, index}
            <tr>
              <td class="border border-gray-400 px-3 py-2 text-center"><div class="cell-v-center center">{index + 1}</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center left">{item.productName}</div></td>
              <td class="border border-gray-400 px-3 py-2 text-center"><div class="cell-v-center center">{item.specification}</div></td>
              <td class="border border-gray-400 px-3 py-2 text-center"><div class="cell-v-center center">{item.unit}</div></td>
              <td class="border border-gray-400 px-3 py-2 text-right"><div class="cell-v-center right">{item.quantity}</div></td>
              <td class="border border-gray-400 px-3 py-2 text-right"><div class="cell-v-center right">{formatCurrency(item.unitPrice)}</div></td>
              <td class="border border-gray-400 px-3 py-2 text-right font-medium"><div class="cell-v-center right">{formatCurrency(item.amount)}</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center left">{item.note || ''}</div></td>
            </tr>
          {/each}

          <!-- 填充空行以保持表格美观 -->
          {#each Array(Math.max(0, 8 - invoice.items.length)) as _}
            <tr>
              <td class="border border-gray-400 px-3 py-2 h-8"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
              <td class="border border-gray-400 px-3 py-2"><div class="cell-v-center center">&nbsp;</div></td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="bg-gray-100">
            <td colspan="6" class="border border-gray-400 px-3 py-3 text-right font-medium">
              <div class="cell-v-center right">合计（大写）：{invoice.totalAmount.toFixed(2).replace(/\d/g, (d) => '零一二三四五六七八九'[parseInt(d)])}元整</div>
            </td>
            <td class="border border-gray-400 px-3 py-3 text-right font-bold text-lg">
              <div class="cell-v-center right">{formatCurrency(invoice.totalAmount)}</div>
            </td>
            <td class="border border-gray-400 px-3 py-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- 备注和签名区域 -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <p class="text-sm text-gray-600 mb-4">
          以上货品请核对清楚，如有质量问题请在3日内致电告知本公司，谢谢！
        </p>
        {#if invoice.notes}
          <div>
            <span class="font-medium text-gray-700">备注: </span>
            <span class="text-gray-900">{invoice.notes}</span>
          </div>
        {/if}
      </div>
      <div class="text-right text-sm text-gray-600">
        <p class="mb-8">第1页/共1页</p>
      </div>
    </div>

    <!-- 签名区域 -->
    <div class="grid grid-cols-2 gap-8 mt-16">
      <div class="text-center">
        <div class="border-b border-gray-400 mb-2 pb-8"></div>
        <p class="text-sm text-gray-600">送货单位及经手人（签章）</p>
      </div>
      <div class="text-center">
        <div class="border-b border-gray-400 mb-2 pb-8"></div>
        <p class="text-sm text-gray-600">收货单位及经手人（签章）</p>
      </div>
    </div>
  </div>
</div>

<style>
  @media print {
    .no-print {
      display: none !important;
    }

    .invoice-content {
      box-shadow: none !important;
      margin: 0 !important;
      padding: 20mm !important;
    }

    body {
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 0;
    }
  }

  .invoice-preview {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 20px;
  }

  /* 表格单元格显式垂直居中，避免依赖 UA 默认，提升 html2canvas 一致性 */
  table th, table td { vertical-align: middle; }

  /* 通用：仅做垂直居中的包裹容器，水平对齐由修饰类控制 */
  .cell-v-center {
    display: flex;
    align-items: center; /* 垂直居中 */
    width: 100%;
    height: 100%;
  }
  .cell-v-center.center { justify-content: center; }
  .cell-v-center.left { justify-content: flex-start; }
  .cell-v-center.right { justify-content: flex-end; }

</style>

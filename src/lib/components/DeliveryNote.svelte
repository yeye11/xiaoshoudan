<script lang="ts">
  import { numberToChineseSimple } from '$lib/utils/numberToChinese';
  import { exportElementAsImage, formatDate } from '$lib/utils/imageExport.ts';
  import MobileImageExport from './MobileImageExport.svelte';

  export let invoice;
  export let showActions = true;

  let deliveryNoteRef: HTMLElement;
  let isExporting = false;

  // 导出为图片
  const exportAsImage = async () => {
    if (!deliveryNoteRef) return;

    isExporting = true;

    try {
      const fileName = `送货单-${invoice.invoiceNumber}-${formatDate(invoice.date)}`;
      await exportElementAsImage(deliveryNoteRef, fileName);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出图片失败，请重试');
    } finally {
      isExporting = false;
    }
  };

  // 显示导出说明
  const showInstructions = () => {
    alert(
      '保存送货单为图片的方法：\n\n' +
      '🖼️ 方法1：右键保存\n' +
      '在送货单上右键点击，选择"另存为图片"或"保存图片"\n\n' +
      '📸 方法2：截图工具\n' +
      'Windows: Win + Shift + S\n' +
      'Mac: Cmd + Shift + 4\n\n' +
      '🖨️ 方法3：打印为PDF\n' +
      '点击"打印/保存PDF"按钮，在打印对话框中选择"保存为PDF"\n\n' +
      '📱 方法4：移动设备\n' +
      '长按送货单图片，选择"保存图片"'
    );
  };

  // 打印送货单
  const printDeliveryNote = () => {
    window.print();
  };

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  // 生成空行
  const generateEmptyRows = (count: number) => {
    return Array(count).fill(null);
  };
</script>

<!-- 操作按钮 -->
{#if showActions}
  <div class="mb-4 print:hidden">
    <!-- 移动端图片导出组件 -->
    <div class="block md:hidden mb-4">
      <MobileImageExport
        targetElement={deliveryNoteRef}
        fileName="送货单"
        showButton={true}
      />
    </div>

    <!-- 桌面端按钮 -->
    <div class="hidden md:flex space-x-3 action-buttons">
      <button
        on:click={exportAsImage}
        disabled={isExporting}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isExporting ? '导出中...' : '保存为图片'}
      </button>

      <button
        on:click={printDeliveryNote}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        打印/保存PDF
      </button>

      <button
        on:click={showInstructions}
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        导出帮助
      </button>
    </div>
  </div>
{/if}

<!-- 送货单主体 -->
<div
  bind:this={deliveryNoteRef}
  class="delivery-note print:shadow-none"
  style="width: 1280px; min-height: 720px; margin: 0 auto; padding: 40px; box-sizing: border-box; font-family: 'Microsoft YaHei', 'SimSun', serif; background-color: white;"
>
  <!-- 公司抬头 -->
  <div class="text-center mb-4 border-b border-gray-400 pb-3">
    <h1 class="text-xl font-bold mb-1" style="color: #000;">{invoice.companyInfo.name}</h1>
    <div class="text-xs flex justify-center space-x-8 mb-1" style="color: #333;">
      <span>地址：{invoice.companyInfo.address}</span>
      <span>电话：{invoice.companyInfo.phone}</span>
    </div>
    <h2 class="text-lg font-bold" style="color: #000;">送 货 单</h2>
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
    <div style="display: flex; align-items: center;"><strong>送货日期：</strong><span>{invoice.deliveryDate || invoice.date}</span></div>
  </div>
  
  <!-- 商品明细表格 -->
  <table class="w-full border-collapse text-xs mb-3" style="border: 1px solid #000;">
    <thead>
      <tr style="background-color: #f5f5f5;">
        <th class="px-2 py-1 text-center w-12" style="border: 1px solid #000;">序号</th>
        <th class="px-2 py-1 text-center w-32" style="border: 1px solid #000;">产品名称</th>
        <th class="px-2 py-1 text-center w-24" style="border: 1px solid #000;">规格型号</th>
        <th class="px-2 py-1 text-center w-16" style="border: 1px solid #000;">单位</th>
        <th class="px-2 py-1 text-center w-16" style="border: 1px solid #000;">数量</th>
        <th class="px-2 py-1 text-center w-20" style="border: 1px solid #000;">单价</th>
        <th class="px-2 py-1 text-center w-20" style="border: 1px solid #000;">金额</th>
        <th class="px-2 py-1 text-center w-24" style="border: 1px solid #000;">备注</th>
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
          <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{formatCurrency(item.amount)}</td>
          <td class="px-2 py-1 text-center" style="border: 1px solid #000;">{item.note || ''}</td>
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
          <td class="px-2 py-1" style="border: 1px solid #000;"></td>
        </tr>
      {/each}
    </tbody>
  </table>
  
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
  <div class="flex justify-between items-center mb-2 text-xs">
    <p style="color: #666;">以上货品请核对清楚，如有质量问题请在3日内致电告知本公司，谢谢！</p>
    <span style="color: #666;">第1页/共1页</span>
  </div>

  <!-- 签名区域 -->
  <div class="grid grid-cols-2 gap-8 text-xs mt-3">
    <div>
      <span class="font-medium">送货单位及经手人（签章）：</span>
    </div>
    <div>
      <span class="font-medium">收货单位及经手人（签章）：</span>
    </div>
  </div>
</div>

<style>
  .delivery-note {
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  
  @media print {
    .delivery-note {
      box-shadow: none;
      border: none;
      margin: 0;
      padding: 20px;
    }

    @page {
      margin: 1cm;
      size: A4;
    }
  }

  /* 确保表格边框在所有浏览器中正确显示 */
  table {
    border-spacing: 0;
  }

  th, td {
    border-width: 1px;
    border-style: solid;
    border-color: #000;
  }
</style>

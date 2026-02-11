<script lang="ts">
  import type { Invoice } from '$lib/types/invoice.ts';
  import { numberToChineseSimple } from '$lib/utils/numberToChinese.ts';
  import { exportElementAsImage, formatDate as formatDateUtil, IMAGE_EXPORT_CONFIG } from '$lib/utils/imageExport.ts';
  import MobileImageExport from './MobileImageExport.svelte';


  export let invoice: Invoice;
  export let showActions = true;
  // 固定布局：在基准宽度（fixedCssWidth）下用绝对像素布局，外层再整体缩放
  export let fixedLayout: boolean = false;

  let salesInvoiceRef: HTMLElement;
  let isExporting = false;
  const BASE_CSS_WIDTH = IMAGE_EXPORT_CONFIG.fixedCssWidth;
  $: rootWidth = fixedLayout ? `${BASE_CSS_WIDTH}px` : '100%';
  $: rootMaxWidth = fixedLayout ? `${BASE_CSS_WIDTH}px` : '600px';

  // 格式化金额
  const formatCurrency = (amount: number): string => amount.toFixed(2);

  // 展示逻辑：仅使用“该销售单保存时的快照”，避免修改“我的资料”后影响历史销售单
  const normalizeSnapshotValue = (value: unknown, placeholders: string[] = []) => {
    const text = String(value ?? '').trim();
    return text.length > 0 && !placeholders.includes(text) ? text : '';
  };
  $: headerCompanyName = normalizeSnapshotValue(invoice?.companyInfo?.name, ['公司名称']);
  $: headerAddress = normalizeSnapshotValue(invoice?.companyInfo?.address, ['公司地址']);
  $: headerPhone = normalizeSnapshotValue(invoice?.companyInfo?.phone, ['公司电话']);
  $: displayCreatedBy = normalizeSnapshotValue(invoice?.createdBy);

  // 使用统一的日期格式化函数
  const formatDate = formatDateUtil;

  // 生成空行
  const generateEmptyRows = (count: number) => Array(count).fill(null);

  // 导出为图片的函数
  const exportAsImage = async () => {
    if (!salesInvoiceRef) return;

    isExporting = true;

    try {
      const fileName = `销售单-${invoice.invoiceNumber}-${formatDate(invoice.createdAt)}`;
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
        fileName={`销售单-${invoice.invoiceNumber}-${formatDate(invoice.createdAt)}`}
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
  class:fixed-layout={fixedLayout}
  style="width: {rootWidth}; max-width: {rootMaxWidth}; margin: 0 auto; padding: 20px 30px; box-sizing: border-box; font-family: 'Microsoft YaHei', 'SimSun', serif; background-color: white;"
>
  <!-- 公司抬头 -->
  <div class="text-center" data-no-export-nudge style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #999;">
    <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 2px 0; color: #000;">{headerCompanyName}</h1>
    <div style="font-size: 11px; margin: 1px 0; color: #333;">
      <span>地址：{headerAddress}</span>
      <span style="margin-left: 20px;">电话：{headerPhone}</span>
    </div>
    <h2 style="font-size: 16px; font-weight: bold; margin: 2px 0 0 0; color: #000; letter-spacing: 8px;">销 售 单</h2>
  </div>

  <!-- 基本信息 -->
  <div class="info-grid" data-export-nudge="on" style="--col1: 1.3fr; --col2: 1fr; --col3: 0.7fr;">
    <!-- 第一行 -->
    <div class="info-item" style="padding: 2px 4px;"><strong>客户名称：</strong><span class="nowrap-ellipsis" title={invoice.customerInfo.name}>{invoice.customerInfo.name}</span></div>
    <div class="info-item" style="padding: 2px 4px;"><strong>客户电话：</strong><span class="nowrap-ellipsis" title={invoice.customerInfo.phone || ''}>{invoice.customerInfo.phone || ''}</span></div>
    <div class="info-item" style="padding: 2px 4px;"><strong>制单人：</strong><span class="nowrap-ellipsis" title={displayCreatedBy}>{displayCreatedBy}</span></div>
    <!-- 第二行（与上面共用同一套列轨，保证上下严格对齐） -->
    <div class="info-item" style="padding: 2px 4px;"><strong>客户地址：</strong><span class="nowrap-ellipsis" title={invoice.customerInfo.address || ''}>{invoice.customerInfo.address || ''}</span></div>
    <div class="info-item" style="padding: 2px 4px;"><strong>物流名称：</strong><span class="nowrap-ellipsis"></span></div>
    <div class="info-item" style="padding: 2px 4px;"><strong>开单日期：</strong><span class="nowrap-ellipsis">{formatDate(invoice.createdAt)}</span></div>
  </div>

  <!-- 商品明细表格 -->
  <div style="margin-bottom: 2px;">
    <table class="items-table" style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #000; table-layout: fixed;">
      <thead>
        <tr style="background-color: #ffffff; height: 20px;">
          <th style="width: 10%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">序号</div></th>
          <th style="width: 20%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">产品名称</div></th>
          <th style="width: 20%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">规格型号</div></th>
          <th style="width: 10%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">单位</div></th>
          <th style="width: 10%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">数量</div></th>
          <th style="width: 10%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">单价</div></th>
          <th style="width: 10%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">金额</div></th>
          <th style="width: 11%; border: 1px solid #000; padding: 2px 1px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #ffffff;"><div class="cell-center">备注</div></th>
        </tr>
      </thead>
      <tbody>
        <!-- 实际商品行 -->
        {#each invoice.items as item, index}
          <tr style="height: 18px; background-color: #ffffff;">
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{index + 1}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{item.productName}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{item.specification}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{item.unit}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{item.quantity}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{formatCurrency(item.unitPrice)}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-weight: bold; word-break: break-word; background-color: #ffffff;"><div class="cell-center">{formatCurrency(item.amount)}</div></td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; word-break: break-word; background-color: #ffffff;"><div class="cell-center"></div></td>
          </tr>
        {/each}

        <!-- 空行填充 -->
        {#each generateEmptyRows(Math.max(0, 8 - invoice.items.length)) as _}
          <tr style="height: 18px; background-color: #ffffff;">
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
            <td style="border: 1px solid #000; padding: 1px; background-color: #ffffff;"><div class="cell-center">&nbsp;</div></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- 合计信息 -->
  <div data-no-export-nudge style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-size: 12px;">
    <div>
      <span style="font-weight: 500;">合计（大写）：</span>
      <span style="font-weight: bold; color: #d32f2f;">{numberToChineseSimple(invoice.totalAmount)}</span>
    </div>
    <div>
      <span style="font-weight: 500;">合计：</span>
      <span style="font-weight: bold; color: #d32f2f;">{formatCurrency(invoice.totalAmount)}</span>
    </div>
  </div>

  <!-- 备注和条款 -->
  <div data-no-export-nudge style="margin-bottom: 2px; font-size: 12px;">
    {#if invoice.notes}
      <p style="margin: 0 0 2px 0;"><span style="font-weight: 500;">备注：</span>{invoice.notes}</p>
    {/if}
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <p style="color: #666; margin: 0; font-size: 11px;">以上货品请核对清楚，如有质量问题请在3日内致电告知本公司，谢谢！</p>
      <span style="color: #666; font-size: 11px;">第1页/共1页</span>
    </div>
  </div>

  <!-- 签名区域 -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px; margin-top: 4px; min-height: 80px;">
    <div style="display: flex; flex-direction: column;">
      <span style="font-weight: 500;">销售单位及经手人（签章）：</span>
    </div>
    <div style="display: flex; flex-direction: column;">
      <span style="font-weight: 500;">收货单位及经手人（签章）：</span>
    </div>
  </div>
</div>

<!-- 操作按钮 -->
<div class="no-print flex justify-center space-x-4 mt-6 mb-8">

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
    vertical-align: middle; /* 显式指定垂直居中，html2canvas 不依赖 UA 默认值 */
  }

  /* 信息网格：增加列间距，使右侧整体右移一些 */
  /* 基础信息三列网格，默认均分；用于第一行（名称/电话/制单人） */
  .info-grid {
    display: grid;
    /* 使用 CSS 变量定义每列比例，便于在不同行微调列宽 */
    grid-template-columns: var(--col1, 1fr) var(--col2, 1fr) var(--col3, 1fr);
    column-gap: 0px; /* 列间距，按需微调 */
    font-size: 12px;
    margin-bottom: 4px;
    align-items: center; /* 让每格内容垂直居中对齐 */
  }
  /* 客户地址可能较长：第二行使用加宽的第一列 */

  /* 信息项：标签固定，值可省略号截断，保持水平分布协调 */
  .info-item { display: flex; align-items: center; gap: 4px; }
  .info-item strong { white-space: nowrap; }
  .info-item .nowrap-ellipsis {
    flex: 1;             /* 占据剩余空间 */
    min-width: 0;        /* 允许在 flex 容器内收缩 */
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* 商品表行高变量，保证视觉垂直居中 */
  .items-table { --head-h: 20px; --row-h: 18px; }
  .items-table thead tr { height: var(--head-h); }
  .items-table tbody tr { height: var(--row-h); }
  /* 覆盖上下内边距，避免文本被挤到底部 */
  .items-table th, .items-table td { padding-top: 0 !important; padding-bottom: 0 !important; }

  /* 表格单元格内容的精确垂直/水平居中（单行文本） */
  .cell-center {
    display: block; /* 使用块级并配合精确行高 */
    text-align: center;
    width: 100%;
    height: var(--row-h);
    line-height: var(--row-h);
  }
  .items-table thead .cell-center {
    height: var(--head-h);
    line-height: var(--head-h);
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .sales-invoice:not(.fixed-layout) {
      width: 100% !important;
      height: auto !important;
      padding: 15px !important;
      font-size: 10px !important;
    }
  }
</style>

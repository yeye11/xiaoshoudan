<script lang="ts">
  import type { Quotation } from '$lib/types/invoice';
  import { IMAGE_EXPORT_CONFIG, exportElementAsImage } from '$lib/utils/imageExport';
  import { onMount } from 'svelte';
  import MobileImageExport from './MobileImageExport.svelte';

  export let quotation: Quotation;
  export let showActions: boolean = true;
  export let fixedLayout: boolean = false;

  // 兼容旧数据：如果没有columns，自动转换或创建默认列
  if (!quotation.columns || !Array.isArray(quotation.columns) || quotation.columns.length === 0) {
    const oldHeaders = (quotation as any).tableHeaders;
    if (oldHeaders) {
      quotation.columns = [
        { id: crypto.randomUUID(), label: '序号', fieldKey: '__sequence__', width: '6%', isSequence: true },
        { id: crypto.randomUUID(), label: oldHeaders.productNameLabel || '型号', fieldKey: 'productName', width: '18%' },
        { id: crypto.randomUUID(), label: oldHeaders.specificationLabel || '规格', fieldKey: 'specification', width: '18%' },
        { id: crypto.randomUUID(), label: oldHeaders.unitPriceLabel || '单价', fieldKey: 'unitPrice', width: '12%' },
        { id: crypto.randomUUID(), label: oldHeaders.noteLabel || '备注', fieldKey: 'note', width: '12%' }
      ];
    } else {
      quotation.columns = [
        { id: crypto.randomUUID(), label: '序号', fieldKey: '__sequence__', width: '6%', isSequence: true },
        { id: crypto.randomUUID(), label: '型号', fieldKey: 'productName', width: '18%' },
        { id: crypto.randomUUID(), label: '规格', fieldKey: 'specification', width: '18%' },
        { id: crypto.randomUUID(), label: '单价', fieldKey: 'unitPrice', width: '12%' },
        { id: crypto.randomUUID(), label: '备注', fieldKey: 'note', width: '12%' }
      ];
    }
  } else if (!quotation.columns[0]?.isSequence) {
    // 如果第一列不是序号列，则插入序号列
    quotation.columns = [
      { id: crypto.randomUUID(), label: '序号', fieldKey: '__sequence__', width: '6%', isSequence: true },
      ...quotation.columns
    ];
  }

  let rootRef: HTMLElement;
  let isExporting = false;
  const BASE_CSS_WIDTH = IMAGE_EXPORT_CONFIG.fixedCssWidth;

  // 根据表格宽度计算实际容器宽度（加上padding和边距）
  $: containerWidth = quotation.tableWidth ? 
    (parseInt(String(quotation.tableWidth).replace(/px/i, '')) + 48) : // +48 for padding (24px * 2)
    BASE_CSS_WIDTH;
  
  // 当containerWidth变化时重新计算缩放
  $: if (containerWidth) {
    updateScale();
  }

  // 计算缩放比例：以实际容器宽度为参考，窄屏整体缩小，宽屏保持 1:1
  let scale = 1;
  const updateScale = () => {
    if (typeof window === 'undefined') return;
    const viewportWidth = window.innerWidth || containerWidth;
    const available = viewportWidth * 0.98; // 留 2% 边距
    scale = Math.min(1, available / containerWidth);
  };

  onMount(() => {
    // 延迟执行确保fontFamily等样式已加载
    setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  });

  const formatCurrency = (v?: number) =>
    typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(2) : '';

  const exportAsImage = async () => {
    if (!rootRef) return;
    try {
      isExporting = true;
      // 等待布局刷新
      await new Promise(resolve => setTimeout(resolve, 50));
      await exportElementAsImage(rootRef, `报价单-${quotation.quotationNumber}`, containerWidth);
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试');
    } finally {
      isExporting = false;
    }
  };

  const printDoc = () => window.print();
</script>

{#if showActions}
  <div class="mb-4 print:hidden">
    <div class="block md:hidden mb-3">
      <MobileImageExport targetElement={rootRef} fileName={`报价单-${quotation.quotationNumber}`} showButton={true} />
    </div>
    <div class="hidden md:flex gap-3 justify-center">
      <button class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50" on:click={exportAsImage} disabled={isExporting}>
        {isExporting ? '导出中…' : '保存为图片'}
      </button>
      <button class="bg-green-500 text-white px-4 py-2 rounded" on:click={printDoc}>打印/保存PDF</button>
    </div>
  </div>
{/if}

<div class="layout-wrapper" style="--scale:{isExporting ? 1 : scale};">
  <div class="layout-inner" style="width:{containerWidth}px;transform:scale({isExporting ? 1 : scale});">
    <div bind:this={rootRef} class="bg-white p-6" style="width:{containerWidth}px;margin:0 auto;">
    <!-- 标题 -->
    <div class="text-center mb-6">
      <h1 class="font-extrabold" style="color: rgb(239, 68, 68); font-size:{quotation.headerFontSize || 28}px">
        {quotation.headerInfo.title}
      </h1>
    </div>

  <!-- 头部信息：仅标题，其他不展示 -->

    <!-- 表格 -->
    <div class="mb-6 flex justify-center">
      <table class="border-collapse border border-gray-400" style="width:{quotation.tableWidth || '100%'}; font-size:{quotation.tableFontSize || 14}px">
      <thead>
        <tr class="bg-gray-100">
          {#each quotation.columns as col (col.id)}
            <th class="border border-gray-400 px-2 py-2 text-center" class:whitespace-nowrap={col.isSequence} style="width:{col.width || 'auto'}">{col.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each quotation.items as item, i}
          <tr>
            {#each quotation.columns as col (col.id)}
              <td class="border border-gray-400 px-2 py-2 text-center" class:whitespace-nowrap={col.isSequence} style="width:{col.width || 'auto'}">
                {#if col.isSequence}
                  {i + 1}
                {:else if col.fieldKey.includes('price') || col.fieldKey.includes('Price')}
                  {formatCurrency(item[col.fieldKey])}
                {:else}
                  {item[col.fieldKey] || ''}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
      </table>
    </div>

    <!-- 底部信息与二维码 -->
    <div class="flex gap-6 items-start">
      <div class="space-y-2 flex-1">
        {#if quotation.footerInfo.note1}<div style="color: rgb(239, 81, 88); font-size:{quotation.note1FontSize || 16}px">{quotation.footerInfo.note1}</div>{/if}
        {#if quotation.footerInfo.note2}<div style="color: rgb(239, 81, 88); font-size:{quotation.note2FontSize || 16}px">{quotation.footerInfo.note2}</div>{/if}
      </div>
      {#if quotation.footerInfo.qrCodeImage}
        <div class="flex-shrink-0">
          <img src={quotation.footerInfo.qrCodeImage} alt="二维码"
            style="width:{quotation.footerInfo.qrCodeWidth || 80}px;height:{quotation.footerInfo.qrCodeHeight || 80}px" />
        </div>
      {/if}
    </div>
    </div>
  </div>
</div>

<style>
  .layout-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow-x: hidden;
  }
  .layout-inner {
    transform-origin: top center;
  }
</style>

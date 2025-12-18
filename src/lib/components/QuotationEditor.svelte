<script lang="ts">
  import { createEmptyQuotationItem, type Quotation, type QuotationItem } from '$lib/types/invoice';
  import FormField from './FormField.svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { onMount } from 'svelte';

  export let quotation: Quotation;
  export let onSave: (q: Quotation) => void = () => {};

  // 兼容旧数据：如果没有columns，自动转换或创建默认列
  if (!quotation.columns || !Array.isArray(quotation.columns) || quotation.columns.length === 0) {
    const oldHeaders = (quotation as any).tableHeaders;
    if (oldHeaders) {
      // 从旧的 tableHeaders 转换
      quotation.columns = [
        { id: crypto.randomUUID(), label: '序号', fieldKey: '__sequence__', width: '6%', isSequence: true },
        { id: crypto.randomUUID(), label: oldHeaders.productNameLabel || '型号', fieldKey: 'productName', width: '18%' },
        { id: crypto.randomUUID(), label: oldHeaders.specificationLabel || '规格', fieldKey: 'specification', width: '18%' },
        { id: crypto.randomUUID(), label: oldHeaders.unitPriceLabel || '单价', fieldKey: 'unitPrice', width: '12%' },
        { id: crypto.randomUUID(), label: oldHeaders.noteLabel || '备注', fieldKey: 'note', width: '12%' }
      ];
    } else {
      // 创建默认列
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

  // 报价产品（用于联想）
  let qpNames: string[] = [];
  let qpSpecsByName: Record<string, string[]> = {};
  let qpMapByName: Record<string, { specification?: string; defaultPrice?: number }[]> = {};

  // 初始化默认值
  if (!quotation.tableWidth) {
    quotation.tableWidth = '600px';
  }

  onMount(() => {
    try {
      const products = StorageManager.getQuotationProducts();
      qpNames = [...new Set(products.map(p => p.name).filter(Boolean))] as string[];
      qpSpecsByName = products.reduce((acc, p) => {
        if (!p.name) return acc;
        acc[p.name] = acc[p.name] || [];
        if (p.specification) acc[p.name].push(p.specification);
        return acc;
      }, {} as Record<string, string[]>);
      qpMapByName = products.reduce((acc, p) => {
        if (!p.name) return acc;
        (acc[p.name] = acc[p.name] || []).push({ specification: p.specification, defaultPrice: p.defaultPrice });
        return acc;
      }, {} as Record<string, { specification?: string; defaultPrice?: number }[]>);
    } catch {}
  });

  const addItem = () => {
    // 创建新项目，自动复制上一个项目的数据
    const lastItem = quotation.items[quotation.items.length - 1];
    placeholderFields.clear(); // 清空之前的虚态记录
    if (lastItem) {
      // 复制上一个项目的数据，但生成新的id
      editingItem = { ...lastItem, id: crypto.randomUUID() };
      // 标记所有复制的字段为虚态（占位符）
      quotation.columns.forEach(col => {
        if (!col.isSequence && lastItem[col.fieldKey]) {
          placeholderFields.add(col.fieldKey);
        }
      });
    } else {
      editingItem = createEmptyQuotationItem();
    }
    editingItemIndex = quotation.items.length; // 标记为新项目
  };
  const removeItem = (idx: number) => {
    quotation.items = quotation.items.filter((_, i) => i !== idx);
  };

  // 编辑项目的弹框状态
  let editingItemIndex: number | null = null;
  let editingItem: QuotationItem | null = null;
  let placeholderFields: Set<string> = new Set(); // 追踪虚态填充的字段

  // 拖放排序
  let draggedColumnIndex: number | null = null;
  
  const handleDragStart = (index: number) => {
    draggedColumnIndex = index;
  };
  
  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === index) return;
    
    const newColumns = [...quotation.columns];
    const draggedItem = newColumns[draggedColumnIndex];
    newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(index, 0, draggedItem);
    
    quotation.columns = newColumns;
    draggedColumnIndex = index;
  };
  
  const handleDragEnd = () => {
    draggedColumnIndex = null;
  };

  // 计算当前列宽总和（不含序号列）
  const getTotalColumnWidth = (cols: typeof quotation.columns) => {
    return cols.reduce((sum, col) => {
      const widthNum = parseFloat(col.width || '0');
      return sum + (isNaN(widthNum) ? 0 : widthNum);
    }, 0);
  };

  // 等比缩放列宽
  const scaleColumnWidths = (cols: typeof quotation.columns, targetTotal: number) => {
    const currentTotal = getTotalColumnWidth(cols);
    if (currentTotal <= 0) return cols;
    
    const scale = targetTotal / currentTotal;
    return cols.map(col => ({
      ...col,
      width: `${(parseFloat(col.width || '10') * scale).toFixed(2)}%`
    }));
  };

  // 添加列时自动调整宽度
  const addColumn = () => {
    const newCol = { id: crypto.randomUUID(), label: '新列', fieldKey: `col_${Date.now()}`, width: '10%' };
    const newColumns = [...quotation.columns, newCol];
    const totalWidth = getTotalColumnWidth(newColumns);
    
    // 如果总宽度超过 100%，则等比缩小所有列
    if (totalWidth > 100) {
      quotation.columns = scaleColumnWidths(newColumns, 100);
      
      // 如果列很多，自动增加表格宽度，保证每列至少有足够的展示空间
      const totalColumns = newColumns.length;
      const minWidthPerColumn = 60; // 每列最少需要的像素宽度
      const minTableWidth = totalColumns * minWidthPerColumn;
      const currentWidth = parseInt(quotation.tableWidth || '600');
      
      if (minTableWidth > currentWidth) {
        quotation.tableWidth = `${Math.ceil(minTableWidth / 50) * 50}px`; // 按 50px 对齐
      }
    } else {
      quotation.columns = newColumns;
    }
  };

  // 根据产品名填充建议规格
  const handleNameChange = (item: QuotationItem) => {
    if (!item.productName) return;
    const specs = qpSpecsByName[item.productName] || [];
    if (specs.length && !item.specification) {
      item.specification = specs[0];
    }
    const candidates = qpMapByName[item.productName] || [];
    const hit = candidates.find(c => !item.specification || c.specification === item.specification) || candidates[0];
    if (hit && (item.unitPrice === undefined || Number.isNaN(item.unitPrice))) {
      if (typeof hit.defaultPrice === 'number') item.unitPrice = hit.defaultPrice;
    }
  };

  const save = () => {
    quotation.updatedAt = new Date().toISOString();
    try {
      onSave(quotation);
    } catch (e: any) {
      alert(e?.message || '保存失败：请检查存储空间或字段内容');
    }
  };

  // 压缩二维码为固定尺寸，避免占用过多 localStorage
  async function compressFileToDataURL(file: File, w = 80, h = 80, mime = 'image/jpeg', quality = 0.75): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const targetW = Math.max(1, Math.floor(w));
      const targetH = Math.max(1, Math.floor(h));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return await readAsDataURL(file);
      // 等比缩小，白色填充周边，不裁剪内容
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.min(targetW / iw, targetH / ih);
      const newW = iw * scale;
      const newH = ih * scale;
      const offsetX = (targetW - newW) / 2;
      const offsetY = (targetH - newH) / 2;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, iw, ih, offsetX, offsetY, newW, newH);
      return canvas.toDataURL(mime, quality);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const rd = new FileReader();
      rd.onload = (ev) => resolve(String((ev.target as any)?.result || ''));
      rd.onerror = reject;
      rd.readAsDataURL(file);
    });
  }
</script>

<div class="p-4 bg-white rounded shadow-sm space-y-6">
  <!-- 自定义名称（仅列表显示） -->
  <section class="bg-blue-50 p-3 rounded">
    <div class="text-sm text-blue-700 mb-2">💡 自定义名称（仅在报价单列表显示，不会显示在导出的图片上）</div>
    <FormField label="自定义名称" bind:value={quotation.customName} placeholder="例如：客户A报价、2024年度报价等" />
  </section>

  <!-- 头部信息 -->
  <section>
    <h3 class="text-lg font-bold mb-3">头部信息</h3>
    <div class="grid grid-cols-1 gap-3">
      <FormField label="报价单标题" bind:value={quotation.headerInfo.title} />
      <div>
        <label class="block text-sm font-semibold mb-1">标题字体大小（px）</label>
        <div class="flex items-center gap-2">
          <input class="border rounded px-3 py-2 w-24" type="number" min="14" max="48" step="1" bind:value={quotation.headerFontSize} />
          <span class="text-gray-500 text-sm">默认: 28</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 表格列管理 -->
  <section class="border-t pt-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-bold">表格列设置</h3>
      <button class="bg-blue-500 text-white px-3 py-1 rounded" on:click={addColumn}>+ 添加列</button>
    </div>
    <div class="mb-3 grid grid-cols-1 gap-3">
      <div>
        <label class="block text-sm font-semibold mb-1">表格宽度</label>
        <input class="border rounded px-3 py-2 w-full" type="text" bind:value={quotation.tableWidth} />
      </div>
    </div>
    <div class="space-y-2">
      {#each quotation.columns as col, colIdx (col.id)}
        <div 
          class="flex gap-2 items-center bg-gray-50 p-2 rounded cursor-move hover:bg-gray-100 transition-colors"
          draggable="true"
          on:dragstart={() => handleDragStart(colIdx)}
          on:dragover={(e) => handleDragOver(e, colIdx)}
          on:dragend={handleDragEnd}
          class:opacity-50={draggedColumnIndex === colIdx}
        >
          <div class="text-gray-400 cursor-grab active:cursor-grabbing pr-2">☰</div>
          <input class="flex-1 border rounded px-2 py-1" bind:value={col.label} placeholder="列标题" disabled={col.isSequence} style={col.isSequence ? 'opacity: 1; background-color: white; color: currentColor;' : ''} />
          <input class="w-24 border rounded px-2 py-1" bind:value={col.width} placeholder="宽度%" />
          <button 
            class="px-2 py-1 rounded text-sm"
            class:bg-red-500={!col.isSequence}
            class:text-white={!col.isSequence}
            class:bg-gray-300={col.isSequence}
            class:text-gray-500={col.isSequence}
            class:cursor-not-allowed={col.isSequence}
            disabled={col.isSequence}
            on:click={() => {
              if (!col.isSequence) {
                quotation.columns = quotation.columns.filter((_, i) => i !== colIdx);
              }
            }}
          >删除</button>
        </div>
      {/each}
    </div>
  </section>

  <!-- 报价项目 -->
  <section class="border-t pt-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-bold">报价项目</h3>
      <button class="bg-green-500 text-white px-3 py-1 rounded" on:click={addItem}>+ 添加项目</button>
    </div>

    <div class="space-y-2">
      {#each [...quotation.items].reverse() as item, reverseIndex (item.id)}
        {@const index = quotation.items.length - 1 - reverseIndex}
        <div 
          class="flex gap-2 items-center bg-gray-50 p-2 rounded cursor-move"
          draggable="true"
          on:dragstart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(index));
          }}
          on:dragover={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          on:drop={(e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            if (fromIndex !== toIndex) {
              const items = [...quotation.items];
              const [movedItem] = items.splice(fromIndex, 1);
              items.splice(toIndex, 0, movedItem);
              quotation.items = items;
            }
          }}
        >
          <span class="text-gray-500 font-semibold text-sm w-8 flex-shrink-0">{index + 1}</span>
          <span class="font-semibold flex-1">{item.productName || ''} / {item.unitPrice || ''}</span>
          <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm" on:click={() => {
            editingItemIndex = index;
            editingItem = { ...item };
          }}>编辑</button>
          <button class="bg-red-500 text-white px-3 py-1 rounded text-sm" on:click={() => removeItem(index)}>删除</button>
        </div>
      {/each}
    </div>
  </section>

  <!-- 编辑项目弹框 -->
  {#if editingItemIndex !== null && editingItem !== null}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded shadow-lg max-w-2xl w-full h-4/5 overflow-y-auto flex flex-col">
        <div class="p-4 space-y-2 flex-1 overflow-y-auto">
          {#each quotation.columns.filter(c => !c.isSequence) as col (col.id)}
            <div class="flex gap-2 items-center">
              <label class="w-16 text-sm font-semibold flex-shrink-0">{col.label}</label>
              <input 
                class="flex-1 border rounded px-2 py-1"
                class:opacity-60={placeholderFields.has(col.fieldKey)}
                bind:value={editingItem[col.fieldKey]}
                type={col.fieldKey.includes('price') || col.fieldKey.includes('Price') ? 'number' : 'text'}
                step="0.01"
                placeholder={col.label}
                on:focus={() => {
                  // 当聚焦虚态字段时，清空内容
                  if (placeholderFields.has(col.fieldKey)) {
                    editingItem[col.fieldKey] = '';
                    placeholderFields.delete(col.fieldKey); // 转为实态
                  }
                }}
                on:input={() => {
                  // 用户开始输入时，标记为实态
                  if (placeholderFields.has(col.fieldKey)) {
                    placeholderFields.delete(col.fieldKey);
                  }
                }}
              />
            </div>
          {/each}
        </div>
        <div class="sticky bottom-0 bg-white p-4 border-t flex gap-3 justify-end">
          <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded" on:click={() => {
            editingItemIndex = null;
            editingItem = null;
            placeholderFields.clear();
          }}>取消</button>
          <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={() => {
            if (editingItemIndex !== null && editingItem !== null) {
              // 检查是否是新项目（索引等于当前items数量）
              const isNewItem = editingItemIndex === quotation.items.length;
              if (isNewItem) {
                // 新项目：添加到数组
                quotation.items = [...quotation.items, { ...editingItem }];
              } else {
                // 编辑现有项目：更新数组
                quotation.items[editingItemIndex] = { ...editingItem };
                quotation.items = quotation.items;
              }
              editingItemIndex = null;
              editingItem = null;
              placeholderFields.clear();
            }
          }}>保存</button>
        </div>
      </div>
    </div>
  {/if}
  <section class="border-t pt-4">
    <h3 class="text-lg font-bold mb-3">底部信息</h3>
    <div class="grid grid-cols-1 gap-3">
      <div>
        <label class="block text-sm font-semibold mb-2">备注1</label>
        <FormField label="" bind:value={quotation.footerInfo.note1} />
        <div class="mt-2">
          <label class="block text-sm font-semibold mb-1">备注1 字体大小（px）</label>
          <div class="flex items-center gap-2">
            <input class="border rounded px-3 py-2 w-24" type="number" min="10" max="32" step="1" bind:value={quotation.note1FontSize} />
            <span class="text-gray-500 text-sm">默认: 16</span>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold mb-2">备注2</label>
        <FormField label="" bind:value={quotation.footerInfo.note2} />
        <div class="mt-2">
          <label class="block text-sm font-semibold mb-1">备注2 字体大小（px）</label>
          <div class="flex items-center gap-2">
            <input class="border rounded px-3 py-2 w-24" type="number" min="10" max="32" step="1" bind:value={quotation.note2FontSize} />
            <span class="text-gray-500 text-sm">默认: 16</span>
          </div>
        </div>
      </div>
      <div>
        <label for="qrcode-upload" class="block text-sm font-semibold mb-2">二维码图片（固定大小）</label>
        {#if quotation.footerInfo.qrCodeImage}
          <div class="flex items-center gap-4 mb-2">
            <img src={quotation.footerInfo.qrCodeImage} alt="QR" class="border rounded"
              style="width:{quotation.footerInfo.qrCodeWidth || 80}px;height:{quotation.footerInfo.qrCodeHeight || 80}px" />
            <button class="bg-red-500 text-white px-3 py-1 rounded" on:click={() => (quotation.footerInfo.qrCodeImage='')}>删除二维码</button>
          </div>
        {/if}
        <input id="qrcode-upload" type="file" accept="image/*" class="hidden" on:change={async (e: any)=>{
          const f: File | undefined = e.target.files?.[0];
          if(!f) return;
          try {
            const w = quotation.footerInfo.qrCodeWidth || 80;
            const h = quotation.footerInfo.qrCodeHeight || 80;
            const dataUrl = await compressFileToDataURL(f, w, h, 'image/jpeg', 0.75);
            // 若压缩后仍然过大（> 400KB），再降质量一次
            if (dataUrl.length > 400 * 1024) {
              const dataUrl2 = await compressFileToDataURL(f, w, h, 'image/jpeg', 0.6);
              quotation.footerInfo.qrCodeImage = dataUrl2;
            } else {
              quotation.footerInfo.qrCodeImage = dataUrl;
            }
          } catch (err) {
            alert('图片处理失败，请更换图片或稍后重试');
          }
        }} />
        <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={() => (document.getElementById('qrcode-upload') as HTMLInputElement)?.click()}>上传二维码</button>
        <div class="mt-2 text-sm text-gray-600">尺寸：
          <input class="border rounded px-2 py-1 w-20" type="number" bind:value={quotation.footerInfo.qrCodeWidth} />×
          <input class="border rounded px-2 py-1 w-20" type="number" bind:value={quotation.footerInfo.qrCodeHeight} /> px
        </div>
      </div>
    </div>
  </section>

  <div class="border-t pt-4 flex justify-center">
    <button class="bg-green-600 text-white px-6 py-2 rounded" on:click={save}>保存报价单</button>
  </div>
</div>

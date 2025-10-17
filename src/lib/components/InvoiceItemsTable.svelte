<script lang="ts">
  import type { InvoiceItem } from '$lib/types/invoice';
  import { 
    createEmptyInvoiceItem, 
    calculateItemAmount, 
    formatCurrency 
  } from '$lib/types/invoice';

  export let items: InvoiceItem[] = [];
  export let onItemsChange: (items: InvoiceItem[]) => void;

  // 单位选项
  const unitOptions = [
    '件', '个', '套', '米', '平方米', '立方米', 
    '公斤', '吨', '箱', '包', '张', '块'
  ];

  // 添加新的商品项目
  function addItem() {
    items = [...items, createEmptyInvoiceItem()];
    onItemsChange(items);
  }

  // 删除商品项目
  function removeItem(index: number) {
    if (items.length > 1) {
      items = items.filter((_, i) => i !== index);
      onItemsChange(items);
    }
  }

  // 复制商品项目
  function duplicateItem(index: number) {
    const itemToCopy = { ...items[index] };
    itemToCopy.id = crypto.randomUUID();
    items = [...items.slice(0, index + 1), itemToCopy, ...items.slice(index + 1)];
    onItemsChange(items);
  }

  // 更新商品项目金额
  function updateItemAmount(index: number) {
    const item = items[index];
    item.amount = calculateItemAmount(item.quantity, item.unitPrice);
    items = [...items];
    onItemsChange(items);
  }

  // 移动商品项目位置
  function moveItem(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    items = [...items];
    onItemsChange(items);
  }

  // 计算总金额
  $: totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // 处理键盘事件
  function handleKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      addItem();
    } else if (event.key === 'Delete' && event.ctrlKey) {
      event.preventDefault();
      removeItem(index);
    }
  }
</script>

<div class="mb-8">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold text-gray-800">商品明细</h2>
    <div class="flex space-x-2">
      <button 
        on:click={addItem}
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        添加商品
      </button>
    </div>
  </div>
  
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">序号</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">产品名称</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">规格型号</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">单位</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">数量</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">单价</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">金额</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each items as item, index}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-3 py-3 text-center text-sm text-gray-900">
                {index + 1}
              </td>
              <td class="px-3 py-3">
                <input 
                  type="text" 
                  bind:value={item.productName}
                  on:keydown={(e) => handleKeyDown(e, index)}
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入产品名称"
                />
              </td>
              <td class="px-3 py-3">
                <input 
                  type="text" 
                  bind:value={item.specification}
                  on:keydown={(e) => handleKeyDown(e, index)}
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="规格型号"
                />
              </td>
              <td class="px-3 py-3">
                <select 
                  bind:value={item.unit}
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {#each unitOptions as unit}
                    <option value={unit}>{unit}</option>
                  {/each}
                </select>
              </td>
              <td class="px-3 py-3">
                <input 
                  type="number" 
                  bind:value={item.quantity}
                  on:input={() => updateItemAmount(index)}
                  on:keydown={(e) => handleKeyDown(e, index)}
                  min="0"
                  step="0.01"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                />
              </td>
              <td class="px-3 py-3">
                <input 
                  type="number" 
                  bind:value={item.unitPrice}
                  on:input={() => updateItemAmount(index)}
                  on:keydown={(e) => handleKeyDown(e, index)}
                  min="0"
                  step="0.01"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                />
              </td>
              <td class="px-3 py-3 text-right font-medium text-sm text-gray-900">
                ¥{formatCurrency(item.amount)}
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center space-x-1">
                  <!-- 上移按钮 -->
                  <button 
                    on:click={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上移"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                  
                  <!-- 下移按钮 -->
                  <button 
                    on:click={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下移"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <!-- 复制按钮 -->
                  <button 
                    on:click={() => duplicateItem(index)}
                    class="p-1 text-blue-400 hover:text-blue-600"
                    title="复制"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                  
                  <!-- 删除按钮 -->
                  <button 
                    on:click={() => removeItem(index)}
                    disabled={items.length === 1}
                    class="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot class="bg-gray-50">
          <tr>
            <td colspan="6" class="px-3 py-4 text-right font-medium text-gray-900">
              合计：
            </td>
            <td class="px-3 py-4 text-right font-bold text-lg text-gray-900">
              ¥{formatCurrency(totalAmount)}
            </td>
            <td class="px-3 py-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
  
  <!-- 快捷键提示 -->
  <div class="mt-2 text-xs text-gray-500">
    <p>快捷键：Ctrl + Enter 添加新行，Ctrl + Delete 删除当前行</p>
  </div>
</div>

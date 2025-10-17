<script lang="ts">
  import { onMount } from 'svelte';
  import type { Invoice } from '$lib/types/invoice';
  import { formatCurrency } from '$lib/types/invoice';

  export let onLoadInvoice: (invoice: Invoice) => void;
  export let onClose: () => void;

  let invoiceHistory: Invoice[] = [];
  let filteredHistory: Invoice[] = [];
  let searchTerm = '';
  let sortBy: 'date' | 'customer' | 'amount' = 'date';
  let sortOrder: 'asc' | 'desc' = 'desc';

  // 加载历史记录
  onMount(() => {
    loadHistory();
  });

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    invoiceHistory = history;
    filterAndSort();
  }

  // 搜索和排序
  function filterAndSort() {
    let filtered = invoiceHistory;

    // 搜索过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = invoiceHistory.filter(invoice => 
        invoice.customerInfo.name.toLowerCase().includes(term) ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.createdBy.toLowerCase().includes(term)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'customer':
          comparison = a.customerInfo.name.localeCompare(b.customerInfo.name);
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    filteredHistory = filtered;
  }

  // 处理搜索
  function handleSearch() {
    filterAndSort();
  }

  // 处理排序
  function handleSort(field: 'date' | 'customer' | 'amount') {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
    filterAndSort();
  }

  // 加载发票
  function loadInvoice(invoice: Invoice) {
    onLoadInvoice(invoice);
    onClose();
  }

  // 删除发票
  function deleteInvoice(invoiceId: string) {
    if (confirm('确定要删除这张销售单吗？')) {
      const history = invoiceHistory.filter(inv => inv.id !== invoiceId);
      localStorage.setItem('invoiceHistory', JSON.stringify(history));
      loadHistory();
    }
  }

  // 清空历史记录
  function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      localStorage.removeItem('invoiceHistory');
      loadHistory();
    }
  }

  // 格式化日期
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('zh-CN');
  }

  // 导出历史记录
  function exportHistory() {
    const dataStr = JSON.stringify(invoiceHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 响应式搜索
  $: if (searchTerm !== undefined) {
    handleSearch();
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
    <!-- 头部 -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">销售单历史记录</h2>
        <button 
          on:click={onClose}
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex-1 max-w-md">
          <input 
            type="text" 
            bind:value={searchTerm}
            placeholder="搜索客户名称、单据编号或制单人..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex space-x-2">
          <button 
            on:click={exportHistory}
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            导出
          </button>
          <button 
            on:click={clearHistory}
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            清空
          </button>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="overflow-auto" style="max-height: calc(90vh - 200px);">
      {#if filteredHistory.length === 0}
        <div class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500">
            {searchTerm ? '没有找到匹配的记录' : '暂无历史记录'}
          </p>
        </div>
      {:else}
        <table class="w-full">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  on:click={() => handleSort('date')}
                  class="flex items-center hover:text-gray-700"
                >
                  日期
                  {#if sortBy === 'date'}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if sortOrder === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      {/if}
                    </svg>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单据编号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  on:click={() => handleSort('customer')}
                  class="flex items-center hover:text-gray-700"
                >
                  客户名称
                  {#if sortBy === 'customer'}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if sortOrder === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      {/if}
                    </svg>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  on:click={() => handleSort('amount')}
                  class="flex items-center hover:text-gray-700"
                >
                  金额
                  {#if sortBy === 'amount'}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if sortOrder === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      {/if}
                    </svg>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">制单人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品数量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredHistory as invoice}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.customerInfo.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ¥{formatCurrency(invoice.totalAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.createdBy}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.items.length} 项
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    on:click={() => loadInvoice(invoice)}
                    class="text-blue-600 hover:text-blue-900"
                  >
                    加载
                  </button>
                  <button 
                    on:click={() => deleteInvoice(invoice.id)}
                    class="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

    <!-- 底部统计 -->
    <div class="bg-gray-50 px-6 py-3 border-t border-gray-200">
      <p class="text-sm text-gray-600">
        共 {filteredHistory.length} 条记录
        {#if searchTerm}
          （从 {invoiceHistory.length} 条中筛选）
        {/if}
      </p>
    </div>
  </div>
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    Invoice,
    InvoiceItem,
    CompanyInfo,
    CustomerInfo
  } from '$lib/types/invoice';
  import {
    createEmptyInvoice,
    calculateTotalAmount,
    validateInvoice,
    generateInvoiceNumber
  } from '$lib/types/invoice';
  import InvoiceItemsTable from '$lib/components/InvoiceItemsTable.svelte';
  import InvoicePreview from '$lib/components/InvoicePreview.svelte';
  import InvoiceHistory from '$lib/components/InvoiceHistory.svelte';
  import Navigation from '$lib/components/Navigation.svelte';

  // 默认公司信息
  let defaultCompanyInfo: CompanyInfo = {
    name: '佛山市仁腾装饰材料有限公司',
    address: '佛山市南海盐步大转弯夹板装饰第五期C1座12号',
    phone: '18575852698',
    email: '',
    taxId: ''
  };

  let invoice: Invoice = createEmptyInvoice(defaultCompanyInfo);
  let showPreview = false;
  let showHistory = false;
  let errors: string[] = [];

  // 从本地存储加载公司信息
  onMount(() => {
    const savedCompanyInfo = localStorage.getItem('companyInfo');
    if (savedCompanyInfo) {
      defaultCompanyInfo = JSON.parse(savedCompanyInfo);
      invoice.companyInfo = { ...defaultCompanyInfo };
    }
  });

  // 保存公司信息到本地存储
  function saveCompanyInfo() {
    localStorage.setItem('companyInfo', JSON.stringify(invoice.companyInfo));
  }

  // 处理商品项目变化
  function handleItemsChange(items: InvoiceItem[]) {
    invoice.items = items;
    invoice.totalAmount = calculateTotalAmount(items);
  }

  // 验证并预览发票
  function previewInvoice() {
    errors = validateInvoice(invoice);
    if (errors.length === 0) {
      showPreview = true;
      saveInvoiceToHistory();
    }
  }

  // 保存发票到历史记录
  function saveInvoiceToHistory() {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    history.unshift({ ...invoice, id: crypto.randomUUID() });
    // 只保留最近50条记录
    if (history.length > 50) {
      history.splice(50);
    }
    localStorage.setItem('invoiceHistory', JSON.stringify(history));
  }

  // 重置表单
  function resetForm() {
    invoice = createEmptyInvoice(invoice.companyInfo);
    showPreview = false;
    errors = [];
  }

  // 返回编辑
  function backToEdit() {
    showPreview = false;
  }

  // 处理打印
  function handlePrint() {
    console.log('打印销售单:', invoice.invoiceNumber);
  }

  // 显示历史记录
  function showHistoryModal() {
    showHistory = true;
  }

  // 关闭历史记录
  function closeHistory() {
    showHistory = false;
  }

  // 从历史记录加载发票
  function loadFromHistory(historicalInvoice: Invoice) {
    // 创建新的发票，保留历史数据但生成新的ID和编号
    invoice = {
      ...historicalInvoice,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    showHistory = false;
    showPreview = false;
  }
</script>

<Navigation />

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
  <div class="max-w-6xl mx-auto px-4">
    <div class="bg-white rounded-xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">销售单生成器</h1>
        <p class="text-gray-600">快速创建专业的销售单据</p>
      </div>
      
      {#if !showPreview}
        <!-- 错误提示 -->
        {#if errors.length > 0}
          <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 class="text-red-800 font-medium mb-2">请修正以下错误：</h3>
            <ul class="text-red-700 text-sm space-y-1">
              {#each errors as error}
                <li>• {error}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- 公司信息 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">公司信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">公司名称</label>
              <input 
                type="text" 
                bind:value={invoice.companyInfo.name}
                on:blur={saveCompanyInfo}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入公司名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
              <input 
                type="text" 
                bind:value={invoice.companyInfo.phone}
                on:blur={saveCompanyInfo}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入联系电话"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">公司地址</label>
              <input 
                type="text" 
                bind:value={invoice.companyInfo.address}
                on:blur={saveCompanyInfo}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入公司地址"
              />
            </div>
          </div>
        </div>

        <!-- 客户信息 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">客户信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">客户名称 *</label>
              <input 
                type="text" 
                bind:value={invoice.customerInfo.name}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入客户名称"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">制单人 *</label>
              <input 
                type="text" 
                bind:value={invoice.createdBy}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入制单人"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">送货日期</label>
              <input 
                type="date" 
                bind:value={invoice.date}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- 商品明细 -->
        <InvoiceItemsTable
          bind:items={invoice.items}
          onItemsChange={handleItemsChange}
        />

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <button
            on:click={showHistoryModal}
            class="group bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"
          >
            <svg class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            历史记录
          </button>
          <button
            on:click={resetForm}
            class="group bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"
          >
            <svg class="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            重置
          </button>
          <button
            on:click={previewInvoice}
            class="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"
          >
            <svg class="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            预览销售单
          </button>
        </div>
      {:else}
        <!-- 预览界面 -->
        <InvoicePreview
          {invoice}
          onBack={backToEdit}
          onPrint={handlePrint}
        />
      {/if}
    </div>
  </div>
</div>

<!-- 历史记录模态框 -->
{#if showHistory}
  <InvoiceHistory
    onLoadInvoice={loadFromHistory}
    onClose={closeHistory}
  />
{/if}

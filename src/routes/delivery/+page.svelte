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
  import DeliveryNote from '$lib/components/DeliveryNote.svelte';
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
  let errors: string[] = [];

  // 从本地存储加载公司信息
  onMount(() => {
    const savedCompanyInfo = localStorage.getItem('companyInfo');
    if (savedCompanyInfo) {
      defaultCompanyInfo = JSON.parse(savedCompanyInfo);
      invoice.companyInfo = { ...defaultCompanyInfo };
    }
    
    // 设置默认的送货日期为今天
    const today = new Date().toISOString().split('T')[0];
    invoice.deliveryDate = today;
    invoice.date = today;
    
    // 设置默认制单人
    invoice.createdBy = '张总';
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

  // 添加新商品行
  function addItem() {
    const newItem: InvoiceItem = {
      productName: '',
      specification: '',
      unit: '件',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    invoice.items = [...invoice.items, newItem];
  }

  // 删除商品行
  function removeItem(index: number) {
    invoice.items = invoice.items.filter((_, i) => i !== index);
    invoice.totalAmount = calculateTotalAmount(invoice.items);
  }

  // 更新商品项目
  function updateItem(index: number, field: keyof InvoiceItem, value: any) {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // 如果更新的是数量或单价，重新计算金额
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    invoice.items = updatedItems;
    invoice.totalAmount = calculateTotalAmount(updatedItems);
  }

  // 切换预览模式
  function togglePreview() {
    showPreview = !showPreview;
  }

  // 验证表单
  function validateForm() {
    errors = validateInvoice(invoice);
    return errors.length === 0;
  }

  // 保存送货单
  function saveDeliveryNote() {
    if (!validateForm()) {
      alert('请填写完整信息：\n' + errors.join('\n'));
      return;
    }

    // 保存到本地存储
    const savedDeliveryNotes = JSON.parse(localStorage.getItem('deliveryNotes') || '[]');
    const deliveryNote = {
      ...invoice,
      id: Date.now().toString(),
      type: 'delivery',
      createdAt: new Date().toISOString()
    };
    
    savedDeliveryNotes.push(deliveryNote);
    localStorage.setItem('deliveryNotes', JSON.stringify(savedDeliveryNotes));
    
    alert('送货单保存成功！');
  }

  // 重置表单
  function resetForm() {
    if (confirm('确定要重置表单吗？所有数据将被清空。')) {
      invoice = createEmptyInvoice(defaultCompanyInfo);
      const today = new Date().toISOString().split('T')[0];
      invoice.deliveryDate = today;
      invoice.date = today;
      invoice.createdBy = '张总';
      errors = [];
    }
  }
</script>

<svelte:head>
  <title>送货单管理 - 销售管理系统</title>
</svelte:head>

<Navigation />

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900">送货单管理</h1>
    <div class="flex space-x-3">
      <button
        on:click={togglePreview}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showPreview ? '编辑模式' : '预览模式'}
      </button>
      <button
        on:click={saveDeliveryNote}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        保存送货单
      </button>
      <button
        on:click={resetForm}
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        重置表单
      </button>
    </div>
  </div>

  {#if showPreview}
    <!-- 预览模式 - 显示送货单 -->
    <DeliveryNote {invoice} />
  {:else}
    <!-- 编辑模式 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 公司信息 -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">公司信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">公司名称</label>
            <input
              type="text"
              bind:value={invoice.companyInfo.name}
              on:blur={saveCompanyInfo}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
            <input
              type="text"
              bind:value={invoice.companyInfo.phone}
              on:blur={saveCompanyInfo}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">公司地址</label>
            <input
              type="text"
              bind:value={invoice.companyInfo.address}
              on:blur={saveCompanyInfo}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- 客户信息 -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">客户信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">客户名称 *</label>
            <input
              type="text"
              bind:value={invoice.customerInfo.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">客户电话</label>
            <input
              type="text"
              bind:value={invoice.customerInfo.phone}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户电话"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">制单人</label>
            <input
              type="text"
              bind:value={invoice.createdBy}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入制单人"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">客户地址</label>
            <input
              type="text"
              bind:value={invoice.customerInfo.address}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户地址"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">送货日期</label>
            <input
              type="date"
              bind:value={invoice.deliveryDate}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- 商品明细 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">商品明细</h2>
          <button
            on:click={addItem}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            添加商品
          </button>
        </div>
        
        <InvoiceItemsTable
          items={invoice.items}
          on:update={(e) => updateItem(e.detail.index, e.detail.field, e.detail.value)}
          on:remove={(e) => removeItem(e.detail.index)}
        />
      </div>

      <!-- 合计信息 -->
      <div class="flex justify-end">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-right">
            <span class="text-lg font-semibold">合计金额：</span>
            <span class="text-xl font-bold text-blue-600">¥{invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      {#if errors.length > 0}
        <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 class="text-red-800 font-medium mb-2">请修正以下错误：</h3>
          <ul class="text-red-700 text-sm">
            {#each errors as error}
              <li>• {error}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</div>

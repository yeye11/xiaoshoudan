<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Invoice, Customer, Product } from '$lib/types/invoice.ts';
  import { createEmptyInvoice, createEmptyInvoiceItem, getProductDefaultPrice } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let invoice: Invoice = createEmptyInvoice();
  let customers: Customer[] = [];
  let products: Product[] = [];
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  let invoiceId: string;
  let loading = true;

  // 模态框状态
  let showCustomerPicker = false;
  let showProductPicker = false;
  let selectedItemIndex = -1;

  onMount(() => {
    invoiceId = $page.params.id;
    loadData();
  });

  const loadData = async () => {
    try {
      // 加载客户数据
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) {
        customers = JSON.parse(storedCustomers);
      }

      // 加载产品数据
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        products = JSON.parse(storedProducts);
      }

      // 加载销售单数据
      const storedInvoices = localStorage.getItem('invoice_history');
      if (storedInvoices) {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        const foundInvoice = invoices.find(inv => inv.id === invoiceId);
        if (foundInvoice) {
          invoice = { ...foundInvoice };
        } else {
          errors.general = '销售单不存在';
        }
      } else {
        errors.general = '没有找到销售单数据';
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      errors.general = '加载数据失败';
    } finally {
      loading = false;
    }
  };

  // 选择客户
  const selectCustomer = (customer: Customer) => {
    invoice.customerId = customer.id;
    invoice.customerInfo = {
      name: customer.name,
      address: customer.address || '',
      phone: customer.phone,
      email: customer.email || ''
    };
    showCustomerPicker = false;
  };

  // 选择产品
  const selectProduct = (product: Product) => {
    if (selectedItemIndex >= 0) {
      // 编辑现有商品
      invoice.items[selectedItemIndex] = {
        ...invoice.items[selectedItemIndex],
        productId: product.id,
        productName: product.name,
        specification: product.specifications?.[0]?.name || '',
        unit: product.unit,
        unitPrice: getProductDefaultPrice(product, 'sale')
      };
    } else {
      // 添加新商品
      const newItem = createEmptyInvoiceItem();
      newItem.productId = product.id;
      newItem.productName = product.name;
      newItem.specification = product.specifications?.[0]?.name || '';
      newItem.unit = product.unit;
      newItem.unitPrice = getProductDefaultPrice(product, 'sale');
      newItem.quantity = 1;
      invoice.items = [...invoice.items, newItem];
    }
    
    calculateTotalAmount();
    showProductPicker = false;
    selectedItemIndex = -1;
  };

  // 添加商品
  const addItem = () => {
    selectedItemIndex = -1;
    showProductPicker = true;
  };

  // 编辑商品
  const editItem = (index: number) => {
    selectedItemIndex = index;
    showProductPicker = true;
  };

  // 删除商品
  const removeItem = (index: number) => {
    invoice.items = invoice.items.filter((_, i) => i !== index);
    calculateTotalAmount();
  };

  // 复制商品
  const duplicateItem = (index: number) => {
    const item = { ...invoice.items[index] };
    item.id = Date.now().toString();
    invoice.items = [...invoice.items, item];
    calculateTotalAmount();
  };

  // 计算总金额
  const calculateTotalAmount = () => {
    invoice.totalAmount = invoice.items.reduce((total, item) => {
      item.amount = item.quantity * item.unitPrice;
      return total + item.amount;
    }, 0);
  };

  // 表单验证
  const validateForm = (): boolean => {
    errors = {};

    if (!invoice.customerInfo.name.trim()) {
      errors.customer = '请选择客户';
    }

    if (invoice.items.length === 0) {
      errors.items = '请至少添加一个商品';
    }

    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      if (!item.productName.trim()) {
        errors[`item_${i}_name`] = '商品名称不能为空';
      }
      if (item.quantity <= 0) {
        errors[`item_${i}_quantity`] = '数量必须大于0';
      }
      if (item.unitPrice < 0) {
        errors[`item_${i}_price`] = '单价不能为负数';
      }
    }

    return Object.keys(errors).length === 0;
  };

  // 保存销售单
  const saveInvoice = async () => {
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      // 更新时间戳
      invoice.updatedAt = new Date().toISOString();
      
      // 计算总金额
      calculateTotalAmount();

      // 保存到localStorage
      const storedInvoices = localStorage.getItem('invoice_history');
      const invoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : [];
      
      const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
      if (invoiceIndex >= 0) {
        invoices[invoiceIndex] = invoice;
        localStorage.setItem('invoice_history', JSON.stringify(invoices));
        
        // 返回销售单详情页面
        goto(`/mobile/sales/${invoiceId}`);
      } else {
        errors.general = '销售单不存在';
      }
    } catch (error) {
      console.error('保存销售单失败:', error);
      errors.general = '保存失败，请重试';
    } finally {
      isSubmitting = false;
    }
  };

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };
</script>

<MobileHeader 
  title="编辑销售单" 
  showBack={true}
  backgroundColor="bg-red-500"
>
  <div slot="actions">
    <button
      on:click={saveInvoice}
      disabled={isSubmitting}
      class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors disabled:opacity-50"
      aria-label="保存"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </button>
  </div>
</MobileHeader>

<div class="p-4 space-y-6">
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
      <p class="text-gray-500 mt-2">加载中...</p>
    </div>
  {:else}
    <!-- 错误提示 -->
    {#if errors.general}
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-red-600 text-sm">{errors.general}</p>
      </div>
    {/if}

    <!-- 基本信息 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
      <h3 class="font-medium text-gray-900">基本信息</h3>
      
      <!-- 销售单号 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">销售单号</label>
        <input
          type="text"
          bind:value={invoice.invoiceNumber}
          placeholder="自动生成"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          readonly
        />
      </div>

      <!-- 日期 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
        <input
          type="date"
          bind:value={invoice.date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <!-- 送货日期 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">送货日期</label>
        <input
          type="date"
          bind:value={invoice.deliveryDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- 客户信息 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-gray-900">客户信息</h3>
        <button
          on:click={() => showCustomerPicker = true}
          class="text-red-600 text-sm font-medium hover:text-red-700"
        >
          选择客户
        </button>
      </div>
      
      {#if invoice.customerInfo.name}
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="font-medium text-gray-900">{invoice.customerInfo.name}</div>
          {#if invoice.customerInfo.phone}
            <div class="text-sm text-gray-600">{invoice.customerInfo.phone}</div>
          {/if}
          {#if invoice.customerInfo.address}
            <div class="text-sm text-gray-600">{invoice.customerInfo.address}</div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-4 text-gray-500">
          <p>请选择客户</p>
        </div>
      {/if}
      
      {#if errors.customer}
        <p class="text-red-500 text-sm">{errors.customer}</p>
      {/if}
    </div>

    <!-- 商品明细 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-gray-900">商品明细</h3>
        <button
          on:click={addItem}
          class="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors"
        >
          添加商品
        </button>
      </div>
      
      {#if invoice.items.length > 0}
        <div class="space-y-3">
          {#each invoice.items as item, index}
            <div class="border border-gray-200 rounded-lg p-3">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{item.productName}</h4>
                  {#if item.specification}
                    <p class="text-sm text-gray-600">规格: {item.specification}</p>
                  {/if}
                </div>
                <div class="flex space-x-1 ml-2">
                  <button
                    on:click={() => editItem(index)}
                    class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    aria-label="编辑"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    on:click={() => duplicateItem(index)}
                    class="p-1 text-green-600 hover:bg-green-50 rounded"
                    aria-label="复制"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                  <button
                    on:click={() => removeItem(index)}
                    class="p-1 text-red-600 hover:bg-red-50 rounded"
                    aria-label="删除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">数量</label>
                  <input
                    type="number"
                    bind:value={item.quantity}
                    on:input={calculateTotalAmount}
                    min="0"
                    step="0.01"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">单价</label>
                  <input
                    type="number"
                    bind:value={item.unitPrice}
                    on:input={calculateTotalAmount}
                    min="0"
                    step="0.01"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">金额</label>
                  <div class="px-2 py-1 text-sm bg-gray-50 rounded border">
                    {formatCurrency(item.amount || 0)}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- 总计 -->
        <div class="border-t border-gray-200 pt-3">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-900">合计:</span>
            <span class="text-xl font-bold text-red-600">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500">
          <p>暂无商品，请添加商品</p>
        </div>
      {/if}
      
      {#if errors.items}
        <p class="text-red-500 text-sm">{errors.items}</p>
      {/if}
    </div>

    <!-- 备注 -->
    <div class="bg-white rounded-lg p-4 shadow-sm border">
      <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
      <textarea
        bind:value={invoice.notes}
        placeholder="请输入备注信息"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- 保存按钮 -->
    <div class="flex space-x-3 pb-6">
      <button
        type="button"
        on:click={() => goto(`/mobile/sales/${invoiceId}`)}
        class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
      >
        取消
      </button>
      <button
        type="button"
        on:click={saveInvoice}
        disabled={isSubmitting}
        class="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </div>
  {/if}
</div>

<!-- 客户选择器 -->
{#if showCustomerPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full rounded-t-lg max-h-96 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择客户</h3>
          <button
            on:click={() => showCustomerPicker = false}
            class="text-gray-400 hover:text-gray-600"
            aria-label="关闭"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4">
        {#if customers.length > 0}
          <div class="space-y-2">
            {#each customers as customer}
              <button
                on:click={() => selectCustomer(customer)}
                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="font-medium text-gray-900">{customer.name}</div>
                {#if customer.phone}
                  <div class="text-sm text-gray-600">{customer.phone}</div>
                {/if}
                {#if customer.address}
                  <div class="text-sm text-gray-600">{customer.address}</div>
                {/if}
              </button>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-500">
            <p>暂无客户数据</p>
            <button
              on:click={() => goto('/mobile/customers/new')}
              class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              添加客户
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- 产品选择器 -->
{#if showProductPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full rounded-t-lg max-h-96 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择产品</h3>
          <button
            on:click={() => { showProductPicker = false; selectedItemIndex = -1; }}
            class="text-gray-400 hover:text-gray-600"
            aria-label="关闭"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4">
        {#if products.length > 0}
          <div class="space-y-2">
            {#each products as product}
              <button
                on:click={() => selectProduct(product)}
                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="font-medium text-gray-900">{product.name}</div>
                <div class="text-sm text-gray-600">
                  {product.unit} • ¥{getProductDefaultPrice(product, 'sale').toFixed(2)}
                </div>
                {#if product.specifications && product.specifications.length > 0}
                  <div class="text-xs text-gray-500">
                    规格: {product.specifications.map(s => s.name).join(', ')}
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-500">
            <p>暂无产品数据</p>
            <button
              on:click={() => goto('/mobile/products/new')}
              class="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              添加产品
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

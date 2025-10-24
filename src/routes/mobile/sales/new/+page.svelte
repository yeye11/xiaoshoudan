<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Invoice, Customer, Product, InvoiceItem } from '$lib/types/invoice.ts';
  import { createEmptyInvoice, createEmptyInvoiceItem, calculateItemAmount, calculateTotalAmount } from '$lib/types/invoice.ts';
  import { getCurrentUserName } from '$lib/utils/initializeData';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { saveCustomerOrderHistory } from '$lib/utils/customerHistory';
  import { StorageManager } from '$lib/utils/storage';
  import { InvoiceCalculator } from '$lib/utils/invoiceCalculations';

  // 表单数据
  let invoice: Invoice | null = null;
  let customers: Customer[] = [];
  let products: Product[] = [];
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  // 选择器状态
  let showCustomerPicker = false;
  let showProductPicker = false;
  let selectedItemIndex = -1;

  // 默认公司信息（兜底）
  const FALLBACK_COMPANY_INFO = {
    name: '佛山市仁腾装饰材料有限公司',
    address: '佛山市南海盐步大转弯夹板装饰第五期C1座12号',
    phone: '18575852698',
    email: '',
    taxId: ''
  };

  // 来自“我的-资料”的公司信息（若存在则覆盖兜底值）
  let companyInfo = { ...FALLBACK_COMPANY_INFO };
  const refreshCompanyInfoFromProfile = () => {
    try {
      const u = StorageManager.getUserInfo();
      if (u && u.company) {
        companyInfo = {
          name: u.company || FALLBACK_COMPANY_INFO.name,
          address: u.address || FALLBACK_COMPANY_INFO.address,
          phone: u.phone || FALLBACK_COMPANY_INFO.phone,
          email: u.email || FALLBACK_COMPANY_INFO.email,
          taxId: u.taxId || FALLBACK_COMPANY_INFO.taxId
        };
      } else {
        companyInfo = { ...FALLBACK_COMPANY_INFO };
      }
    } catch (e) {
      console.warn('读取用户资料失败，使用默认公司信息', e);
      companyInfo = { ...FALLBACK_COMPANY_INFO };
    }
  };

  let pendingCartItemChecked = false;
  let processedCartItems = new Set<string>(); // 记录已处理的购物车项目

  onMount(() => {
    loadData();
    refreshCompanyInfoFromProfile();

    // 检查是否有保存的草稿
    const savedDraft = sessionStorage.getItem('salesInvoiceDraft');
    if (savedDraft) {
      try {
        invoice = JSON.parse(savedDraft);
        console.log('📋 恢复销售单草稿，商品数量:', invoice?.items.length);
      } catch (e) {
        console.error('恢复草稿失败:', e);
        initializeInvoice();
      }
    } else {
      initializeInvoice();
    }

    // 检查是否有从产品选择页返回的购物车数据
    const selectedProducts = sessionStorage.getItem('selectedProducts');
    if (selectedProducts) {
      try {
        const products = JSON.parse(selectedProducts) as InvoiceItem[];
        console.log('🛒 接收到购物车数据:', products.length, '个商品');

        // 将购物车商品添加到发票
        if (invoice) {
          invoice.items = [...invoice.items, ...products];
          updateTotalAmount();
          console.log('✅ 已添加购物车商品，当前总数:', invoice.items.length);
        }

        // 清除 sessionStorage
        sessionStorage.removeItem('selectedProducts');
      } catch (e) {
        console.error('处理购物车数据失败:', e);
      }
    }
  });

  // 检查是否有待处理的购物车项目（从产品选择页"保存"按钮返回）
  $: if (invoice && !pendingCartItemChecked) {
    try {
      const itemData = sessionStorage.getItem('pendingCartItem');
      const itemIndex = sessionStorage.getItem('pendingCartItemIndex');

      if (itemData) {
        const item = JSON.parse(itemData) as InvoiceItem;
        const idx = parseInt(itemIndex || '-1', 10);

        if (idx >= 0 && idx < invoice.items.length) {
          // 更新现有项目
          invoice.items[idx] = item;
        } else {
          // 添加新项目
          invoice.items.push(item);
        }

        updateTotalAmount();

        // 清理 sessionStorage
        sessionStorage.removeItem('pendingCartItem');
        sessionStorage.removeItem('pendingCartItemIndex');
        sessionStorage.removeItem('pendingCustomerId');
      }

      pendingCartItemChecked = true;
    } catch (e) {
      console.error('处理待处理购物车项目失败:', e);
      pendingCartItemChecked = true;
    }
  }

  const loadData = () => {
    try {
      customers = StorageManager.getCustomers();
      products = StorageManager.getProducts();
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const initializeInvoice = () => {
    console.log('🔄 初始化销售单');
    invoice = createEmptyInvoice(companyInfo);
    // 初始化为不含默认商品
    invoice.items = [];

    // 检查URL参数中是否有客户ID和制单人
    const customerId = $page.url.searchParams.get('customerId');
    const createdBy = $page.url.searchParams.get('createdBy');

    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        selectCustomer(customer);
      }
    }

    // 设置制单人：优先使用URL参数，否则使用当前登录用户
    if (createdBy) {
      invoice.createdBy = decodeURIComponent(createdBy);
    } else {
      invoice.createdBy = getCurrentUserName();
    }


  };

  // 当从客户详情页带 customerId 跳转过来时，确保选中该客户（避免时序竞态）
  $: if (invoice && customers.length > 0 && $page?.url) {
    const cid = $page.url.searchParams.get('customerId');
    if (cid && !invoice.customerId) {
      const c = customers.find((x) => x.id === cid);
      if (c) {
        selectCustomer(c);
        // 选中后清理 URL 上的 customerId，避免后续重复触发
        const params = new URLSearchParams($page.url.search);
        params.delete('customerId');
        const qs = params.toString();
        goto(`${$page.url.pathname}${qs ? '?' + qs : ''}`, { replaceState: true, noScroll: true, keepFocus: true });
      }
    }
  }

  // 选择客户
  const selectCustomer = (customer: Customer) => {
    if (!invoice) return;

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
    if (!invoice) return;

    if (selectedItemIndex >= 0) {
      // 更新现有项目
      const item = invoice.items[selectedItemIndex];
      item.productId = product.id;
      item.productName = product.name;

      // 不自动设置规格，让用户手动选择
      item.specification = '';

      // 设置默认价格
      const defaultPrice = product.prices.find(p => p.type === 'sale' && p.isDefault);
      item.unitPrice = defaultPrice ? defaultPrice.price : 0;

      item.unit = product.unit;

      // 重新计算金额
      updateItemAmount(selectedItemIndex);
    } else {
      // 添加新项目
      const newItem = createEmptyInvoiceItem();
      newItem.productId = product.id;
      newItem.productName = product.name;

      // 不自动设置规格，让用户手动选择
      newItem.specification = '';

      const defaultPrice = product.prices.find(p => p.type === 'sale' && p.isDefault);
      newItem.unitPrice = defaultPrice ? defaultPrice.price : 0;

      newItem.unit = product.unit;
      newItem.amount = calculateItemAmount(newItem.quantity, newItem.unitPrice);

      invoice.items.push(newItem);
    }

    showProductPicker = false;
    selectedItemIndex = -1;
    updateTotalAmount();
  };

  // 更新项目金额
  const updateItemAmount = (index: number) => {
    if (!invoice) return;
    const item = invoice.items[index];
    item.amount = calculateItemAmount(item.quantity, item.unitPrice);
    updateTotalAmount();
  };

  // 保存草稿到 sessionStorage
  const saveDraft = () => {
    if (invoice) {
      sessionStorage.setItem('salesInvoiceDraft', JSON.stringify(invoice));
      console.log('💾 保存销售单草稿，商品数量:', invoice.items.length);
    }
  };

  // 更新总金额
  const updateTotalAmount = () => {
    if (!invoice) return;
    invoice.totalAmount = calculateTotalAmount(invoice.items);
    saveDraft(); // 每次更新总金额时保存草稿
  };

  // 添加商品项目
  const addItem = () => {
    selectedItemIndex = -1;
    const cid = invoice?.customerId;
    goto(`/mobile/products/select?index=-1${cid ? `&customerId=${cid}` : ''}`);
  };

  // 编辑商品项目
  const editItem = (index: number) => {
    selectedItemIndex = index;
    const cid = invoice?.customerId;
    goto(`/mobile/products/select?index=${index}${cid ? `&customerId=${cid}` : ''}`);
  };

  // 删除商品项目
  const removeItem = (index: number) => {
    if (!invoice) return;
    invoice.items.splice(index, 1);
    updateTotalAmount();
  };

  // 复制商品项目
  const duplicateItem = (index: number) => {
    if (!invoice) return;
    const item = invoice.items[index];
    const newItem = { ...item, id: crypto.randomUUID() };
    invoice.items.splice(index + 1, 0, newItem);
    updateTotalAmount();
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!invoice) return false;

    errors = {};

    if (!invoice.customerInfo?.name?.trim()) {
      errors.customer = '请选择客户';
    }

    if (!invoice.createdBy?.trim()) {
      errors.createdBy = '制单人不能为空';
    }

    if (invoice.items.length === 0) {
      errors.items = '至少需要一个商品项目';
    }

    invoice.items.forEach((item, index) => {
      if (!item.productName.trim()) {
        errors[`item_${index}_name`] = '商品名称不能为空';
      }
      if (item.quantity <= 0) {
        errors[`item_${index}_quantity`] = '数量必须大于0';
      }
      if (item.unitPrice < 0) {
        errors[`item_${index}_price`] = '单价不能为负数';
      }
    });

    return Object.keys(errors).length === 0;
  };

  // 保存销售单
  const saveInvoice = async (status: 'draft' | 'sent' = 'draft') => {
    console.log('开始保存销售单...', { invoice, status });

    if (!invoice) {
      console.error('保存失败：invoice 为空');
      errors.general = '销售单数据未初始化';
      return;
    }

    const isValid = validateForm();
    console.log('表单验证结果:', { isValid, errors });

    if (!isValid) {
      console.error('保存失败：表单验证未通过', errors);
      errors.general = '请检查并填写所有必填字段';
      return;
    }

    isSubmitting = true;

    try {
      invoice.status = status;
      invoice.type = 'sale';
      invoice.paymentStatus = 'unpaid';
      invoice.paidAmount = 0;

      // 加载现有销售单
      const invoices = StorageManager.getInvoices();

      // 添加新销售单
      invoices.push(invoice);

      // 保存到localStorage
      StorageManager.saveInvoices(invoices);

      // 保存客户购买历史
      if (invoice.customerId && invoice.items.length > 0) {
        const historyItems = invoice.items
          .filter(item => item.productId) // 只保存有产品ID的项目
          .map(item => ({
            productId: item.productId!,
            unitPrice: item.unitPrice,
            unit: item.unit,
            specification: item.specification,
            quantity: item.quantity
          }));

        if (historyItems.length > 0) {
          saveCustomerOrderHistory(invoice.customerId, historyItems);
        }
      }

      // 清除草稿
      sessionStorage.removeItem('salesInvoiceDraft');
      console.log('🗑️ 清除销售单草稿');

      // 返回销售单列表
      goto('/mobile/sales');
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

  // 获取产品信息
  const getProductInfo = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // 监听从选择产品页返回的选择结果
  $: if ($page?.url && products.length > 0 && invoice) {
    const sp = $page.url.searchParams;

    // 处理新的 cartItem 参数（来自编辑模态框）
    const cartItemData = sp.get('cartItem');
    if (cartItemData) {
      // 生成唯一标识，防止重复处理
      const cartItemKey = `${cartItemData}_${sp.get('index')}`;

      console.log('🔍 检测到 cartItem:', { cartItemKey, hasProcessed: processedCartItems.has(cartItemKey), currentItems: invoice.items.length });

      if (!processedCartItems.has(cartItemKey)) {
        processedCartItems.add(cartItemKey);

        try {
          const item = JSON.parse(decodeURIComponent(cartItemData)) as InvoiceItem;
          const idx = parseInt(sp.get('index') || '-1', 10);
          const itemIndex = isNaN(idx) ? -1 : idx;

          console.log('✅ 处理 cartItem:', { itemIndex, productName: item.productName, beforeCount: invoice.items.length });

          if (itemIndex >= 0 && itemIndex < invoice.items.length) {
            // 更新现有项目
            invoice.items[itemIndex] = item;
            console.log('📝 更新现有项目:', itemIndex);
          } else {
            // 添加新项目
            invoice.items.push(item);
            console.log('➕ 添加新项目，当前总数:', invoice.items.length);
          }

          updateTotalAmount();

          // 清理URL参数
          const params = new URLSearchParams($page.url.search);
          params.delete('cartItem');
          params.delete('index');
          const qs = params.toString();
          goto(`${$page.url.pathname}${qs ? '?' + qs : ''}`, { replaceState: true, noScroll: true, keepFocus: true });
        } catch (e) {
          console.error('解析购物车项目失败:', e);
        }
      }
    }

    // 处理旧的 pickProductId 参数（向后兼容）
    const picked = sp.get('pickProductId');
    if (picked) {
      const idx = parseInt(sp.get('index') || '-1', 10);
      selectedItemIndex = isNaN(idx) ? -1 : idx;
      const product = products.find(p => p.id === picked);
      if (product) {
        selectProduct(product);
      }
      // 清理URL参数
      const params = new URLSearchParams($page.url.search);
      params.delete('pickProductId');
      params.delete('index');
      const qs = params.toString();
      goto(`${$page.url.pathname}${qs ? '?' + qs : ''}`, { replaceState: true, noScroll: true, keepFocus: true });
    }
  }
</script>

<MobileHeader
  title="新建销售单"
  showBack={true}
  backgroundColor="bg-red-500"
>
  <div slot="actions">
    <button
      on:click={() => saveInvoice('draft')}
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

{#if invoice}
<div class="p-4 space-y-6">
  <!-- 错误提示 -->
  {#if errors.general}
    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-600 text-sm font-medium">{errors.general}</p>
    </div>
  {/if}

  <!-- 详细错误列表 -->
  {#if Object.keys(errors).length > 1 || (Object.keys(errors).length === 1 && !errors.general)}
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p class="text-yellow-800 text-sm font-medium mb-2">请检查以下问题：</p>
      <ul class="text-yellow-700 text-sm space-y-1">
        {#each Object.entries(errors) as [key, message]}
          {#if key !== 'general'}
            <li>• {message}</li>
          {/if}
        {/each}
      </ul>
    </div>
  {/if}



  <!-- 商品明细 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">商品明细</h3>
      <button
        on:click={addItem}
        class="text-red-500 text-sm font-medium"
      >
        + 添加商品
      </button>
    </div>

    {#if errors.items}
      <p class="text-red-500 text-sm">{errors.items}</p>
    {/if}

    <div class="space-y-2">
      {#each invoice.items as item, index}
        <div class="border border-gray-200 rounded-lg p-2.5 bg-white">
          <!-- 第一行：产品名称 单位 数量 删除按钮 -->
          <div class="flex items-center justify-between mb-1.5 text-sm">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="font-medium text-gray-900 truncate">{item.productName || '未选择商品'}</span>
              <span class="text-gray-500 text-xs whitespace-nowrap">单位:{item.unit}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-xs text-gray-600 whitespace-nowrap">
                数量: <span class="font-medium text-gray-900">{item.quantity}</span>
              </div>
              <button
                type="button"
                on:click={() => removeItem(index)}
                class="text-red-500 hover:text-red-700 p-1"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 第二行：单价和金额 -->
          <div class="flex items-center justify-between text-xs pr-7">
            <div class="text-gray-600">
              单价: <span class="font-medium text-gray-900">¥{formatCurrency(item.unitPrice)}</span>
            </div>
            <div class="text-gray-600">
              金额: <span class="font-bold text-red-600 text-sm">¥{formatCurrency(item.amount)}</span>
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
      on:click={() => {
        sessionStorage.removeItem('salesInvoiceDraft');
        goto('/mobile/sales');
      }}
      class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
    >
      取消
    </button>
    <button
      type="button"
      on:click={() => saveInvoice('draft')}
      disabled={isSubmitting}
      class="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
    >
      {isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
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
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4">
        {#if customers.length === 0}
          <div class="text-center py-8">
            <p class="text-gray-500 mb-4">还没有客户数据</p>
            <button
              on:click={() => goto('/mobile/customers/new')}
              class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              添加客户
            </button>
          </div>
        {:else}
          <div class="space-y-2">
            {#each customers as customer}
              <button
                on:click={() => selectCustomer(customer)}
                class="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border"
              >
                <div class="font-medium text-gray-900">{customer.name}</div>
                {#if customer.phone}
                  <div class="text-sm text-gray-600">{customer.phone}</div>
                {/if}
                {#if customer.category}
                  <div class="text-xs text-blue-600">{customer.category}</div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- 产品选择器 -->
{#if showProductPicker}
  <div class="mt-4">
    <div class="bg-white w-full rounded-lg shadow-sm border max-h-[60vh] overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择产品</h3>
          <button
            on:click={() => showProductPicker = false}
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4">
        {#if products.length === 0}
          <div class="text-center py-8">
            <p class="text-gray-500 mb-4">还没有产品数据</p>
            <button
              on:click={() => goto('/mobile/products/new')}
              class="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              添加产品
            </button>
          </div>
        {:else}
          <div class="space-y-2">
            {#each products as product}
              <button
                on:click={() => selectProduct(product)}
                class="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{product.name}</div>
                    {#if product.category}
                      <div class="text-xs text-orange-600">{product.category}</div>
                    {/if}
                    <div class="text-sm text-gray-600">单位: {product.unit}</div>
                    {#if product.specifications.length > 0}
                      <div class="text-xs text-gray-500">
                        规格: {product.specifications.find(s => s.isDefault)?.name || product.specifications[0]?.name || '无'}
                      </div>
                    {/if}
                  </div>
                  <div class="text-right">
                    {#if product.prices.length > 0}
                      <div class="text-sm font-medium text-orange-600">
                        ¥{(product.prices.find(p => p.type === 'sale' && p.isDefault) || product.prices[0])?.price.toFixed(2) || '0.00'}
                      </div>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{/if}

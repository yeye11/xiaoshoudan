<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import ProductEditModal from '$lib/components/ProductEditModal.svelte';
  import type { Product, InvoiceItem } from '$lib/types/invoice.ts';
  import { createEmptyInvoiceItem, calculateItemAmount } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getCustomerProductHistory } from '$lib/utils/customerHistory';

  let products: Product[] = [];
  let filtered: Product[] = [];
  let keyword = '';

  // 获取当前客户ID
  let customerId = '';
  $: customerId = $page?.url?.searchParams?.get('customerId') || '';

  // 购物车状态
  let cart: InvoiceItem[] = [];

  // 编辑模态框状态
  let showEditModal = false;
  let editingProduct: Product | null = null;
  let editingItem: InvoiceItem | null = null;
  let editingCartIndex = -1; // 正在编辑的购物车项目索引

  // 购物车查看模态框状态
  let showCartModal = false;

  onMount(() => {
    loadProducts();
  });

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products');
      products = stored ? JSON.parse(stored) : [];
      filtered = products;
      handleSearch();
    } catch (e) {
      console.error('加载产品失败', e);
    }
  };

  const handleSearch = () => {
    if (!keyword.trim()) {
      filtered = products;
      return;
    }
    const k = keyword.toLowerCase();
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(k) ||
      p.category.toLowerCase().includes(k) ||
      (p.barcode || '').toLowerCase().includes(k) ||
      p.tags.some(t => t.toLowerCase().includes(k))
    );
  };

  const pick = (product: Product) => {
    editingProduct = product;
    editingItem = createEmptyInvoiceItem();
    editingItem.productId = product.id;
    editingItem.productName = product.name;

    // 尝试获取客户的历史购买信息
    const history = customerId ? getCustomerProductHistory(customerId, product.id) : null;

    if (history) {
      // 使用历史购买信息
      editingItem.unit = history.unit;
      editingItem.unitPrice = history.unitPrice;
      editingItem.specification = history.specification;
      editingItem.quantity = 1; // 数量默认为1，不使用历史数量
      console.log('📋 使用客户历史购买信息:', {
        product: product.name,
        unit: history.unit,
        price: history.unitPrice,
        spec: history.specification,
        lastDate: history.date
      });
    } else {
      // 使用产品默认信息
      editingItem.unit = product.unit;
      editingItem.quantity = 1;

      // 设置默认单价
      const defaultPrice = product.prices.find(p => p.type === 'sale' && p.isDefault) || product.prices[0];
      if (defaultPrice) {
        editingItem.unitPrice = defaultPrice.price;
      }

      // 设置默认规格
      const defaultSpec = product.specifications.find(s => s.isDefault);
      editingItem.specification = defaultSpec ? defaultSpec.name : (product.specifications[0]?.name || '');

      console.log('📋 使用产品默认信息:', {
        product: product.name,
        unit: editingItem.unit,
        price: editingItem.unitPrice,
        spec: editingItem.specification
      });
    }

    // 计算金额
    editingItem.amount = calculateItemAmount(editingItem.quantity, editingItem.unitPrice);
    console.log('pick - 创建编辑项:', editingItem.productName, '数量:', editingItem.quantity, '单价:', editingItem.unitPrice, '金额:', editingItem.amount);
    editingCartIndex = -1; // 新增项目
    showEditModal = true;
  };

  // 添加到购物车
  const addToCart = (item: InvoiceItem) => {
    cart = [...cart, item];
    console.log('🛒 添加到购物车:', item.productName, '数量:', item.quantity, '单价:', item.unitPrice, '金额:', item.amount, '当前购物车数量:', cart.length);
  };

  // 编辑购物车项目
  const editCartItem = (index: number) => {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    editingProduct = product;
    editingItem = { ...item };
    editingCartIndex = index;
    showEditModal = true;
  };

  // 更新购物车项目
  const updateCartItem = (index: number, item: InvoiceItem) => {
    cart[index] = item;
    cart = [...cart];
    console.log('📝 更新购物车项目:', index, item.productName);
  };

  // 删除购物车项目
  const removeCartItem = (index: number) => {
    cart = cart.filter((_, i) => i !== index);
    console.log('🗑️ 删除购物车项目:', index, '剩余:', cart.length);
  };

  // 计算购物车总金额（响应式）
  $: cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  // 调试日志
  $: if (cart.length > 0) {
    console.log('购物车商品数量:', cart.length, '总金额:', cartTotal);
    cart.forEach(item => {
      console.log('  -', item.productName, '数量:', item.quantity, '单价:', item.unitPrice, '金额:', item.amount);
    });
  }

  // 完成选择，返回销售单页面
  const finishSelection = () => {
    if (cart.length === 0) {
      goto('/mobile/sales/new');
      return;
    }

    // 将购物车数据保存到 sessionStorage
    sessionStorage.setItem('selectedProducts', JSON.stringify(cart));
    console.log('✅ 完成选择，保存购物车:', cart.length, '个商品');

    const cid = $page?.url?.searchParams?.get('customerId');
    goto(`/mobile/sales/new${cid ? `?customerId=${cid}` : ''}`);
  };

  // 处理返回按钮
  const handleBack = () => {
    // 返回到新建销售单页面（不保存购物车）
    const cid = $page?.url?.searchParams?.get('customerId');
    goto(`/mobile/sales/new${cid ? `?customerId=${cid}` : ''}`);
  };

  const handleClose = () => {
    showEditModal = false;
    editingProduct = null;
    editingItem = null;
  };

  const saveProductChanges = () => {
    // 保存产品的规格变化到 localStorage
    if (editingProduct) {
      try {
        const stored = localStorage.getItem('products');
        const allProducts: Product[] = stored ? JSON.parse(stored) : [];
        const productIndex = allProducts.findIndex(p => p.id === editingProduct.id);

        if (productIndex >= 0) {
          allProducts[productIndex] = editingProduct;
          localStorage.setItem('products', JSON.stringify(allProducts));
          console.log('✅ 产品规格已保存');
        }
      } catch (e) {
        console.error('保存产品失败:', e);
      }
    }
  };

  const handleSave = (event: CustomEvent) => {
    const { item } = event.detail;
    if (!item) return;

    console.log('handleSave - 接收到的 item:', item);
    console.log('handleSave - item.amount:', item.amount);

    try {
      // 保存产品的规格变化
      saveProductChanges();

      // 添加或更新购物车
      if (editingCartIndex >= 0) {
        updateCartItem(editingCartIndex, item);
      } else {
        addToCart(item);
      }

      // 关闭模态框
      showEditModal = false;
    } catch (e) {
      console.error('保存项目失败:', e);
    }
  };

  const handleSaveAndReturn = (event: CustomEvent) => {
    const { item } = event.detail;
    if (!item) return;

    try {
      // 保存产品的规格变化
      saveProductChanges();

      // 添加或更新购物车
      if (editingCartIndex >= 0) {
        updateCartItem(editingCartIndex, item);
      } else {
        addToCart(item);
      }

      // 关闭模态框并返回
      showEditModal = false;
      finishSelection();
    } catch (e) {
      console.error('保存项目失败:', e);
    }
  };

  // 响应式搜索 - 当 keyword 或 products 变化时触发
  $: if (keyword !== undefined && products) {
    handleSearch();
  }

  // 打开购物车查看模态框
  const openCartModal = () => {
    if (cart.length === 0) return;
    showCartModal = true;
  };

  // 关闭购物车查看模态框
  const closeCartModal = () => {
    showCartModal = false;
  };

</script>

<MobileHeader
  title="选择产品"
  showBack={true}
  backgroundColor="bg-orange-500"
  on:back={handleBack}
>
</MobileHeader>

<!-- 搜索框 - sticky定位在header下方 -->
<div class="sticky top-16 z-30 bg-white border-b border-gray-200 p-3">
  <div class="flex gap-2">
    <input
      type="text"
      bind:value={keyword}
      placeholder="搜索产品名称、分类、条码、标签"
      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
    <!-- 添加产品按钮 - 右上角 -->
    <a
      href="/mobile/products/new?returnUrl={encodeURIComponent($page.url.pathname + $page.url.search)}"
      class="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
      aria-label="添加新产品"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </a>
  </div>
</div>

<!-- 列表 -->
<div class="p-3 pb-32">
  {#if filtered.length === 0}
    <div class="text-center text-gray-500 py-12">没有匹配的产品</div>
  {:else}
    <div class="space-y-2 pb-20">
      {#each filtered as p}
        <button class="w-full text-left bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                on:click={() => pick(p)} aria-label={`选择 ${p.name}`}>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900">{p.name}</div>
              <div class="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {#if p.category}<span>分类: {p.category}</span>{/if}
                <span>单位: {p.unit}</span>
                {#if p.specifications.length > 0}
                  <span>规格: {p.specifications.find(s => s.isDefault)?.name || p.specifications[0]?.name}</span>
                {/if}
                {#if p.prices.length > 0}
                  <span class="text-orange-600">¥{(p.prices.find(pp => pp.type==='sale' && pp.isDefault) || p.prices[0])?.price.toFixed(2)}</span>
                {/if}
                {#if p.barcode}
                  <span class="font-mono text-xs text-gray-500">{p.barcode}</span>
                {/if}
              </div>
              {#if p.tags.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each p.tags.slice(0, 4) as tag}
                    <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- 购物车固定底部栏 - 当编辑模态框打开时隐藏 -->
{#if !showEditModal}
  <div class="fixed bottom-0 left-0 right-0 bg-blue-500 shadow-lg z-[60]" style="padding-bottom: env(safe-area-inset-bottom, 0px);">
    <div class="flex items-center justify-between px-4 py-3">
      <!-- 左侧：购物车图标和金额 - 可点击 -->
      <button
        on:click={openCartModal}
        class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        disabled={cart.length === 0}
      >
        <!-- 购物车图标带数量徽章 -->
        <div class="relative">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <!-- 数量徽章 -->
          {#if cart.length > 0}
            <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </div>
          {/if}
        </div>

        <!-- 金额 -->
        <div class="text-white">
          <div class="text-xs opacity-90">金额:</div>
          <div class="text-lg font-bold">¥{cartTotal.toFixed(2)}</div>
        </div>
      </button>

      <!-- 右侧：选好了按钮 -->
      <button
        on:click={finishSelection}
        class="bg-white text-blue-500 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
      >
        选好了
      </button>
    </div>
  </div>
{/if}



<!-- 使用独立的编辑模态框组件 -->
<ProductEditModal
  bind:show={showEditModal}
  bind:product={editingProduct}
  bind:item={editingItem}
  on:close={handleClose}
  on:save={handleSave}
  on:saveAndReturn={handleSaveAndReturn}
/>

<!-- 购物车查看模态框 -->
{#if showCartModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-end" on:click={closeCartModal} role="dialog" aria-modal="true">
    <div class="bg-white w-full rounded-t-2xl max-h-[80vh] flex flex-col" on:click|stopPropagation role="document">
      <!-- 标题栏 -->
      <div class="bg-blue-500 text-white px-4 py-4 rounded-t-2xl flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h2 class="text-lg font-medium">已选产品</h2>
        </div>
        <button on:click={closeCartModal} class="text-white hover:bg-blue-600 rounded-lg p-1" aria-label="关闭购物车">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 商品列表 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        {#each cart as item, index}
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <!-- 第一行：序号、产品名称、规格和删除按钮 -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="flex items-center space-x-2 flex-wrap">
                  <span class="text-blue-500 font-medium">{index + 1}</span>
                  <span class="font-medium text-gray-900">{item.productName}</span>
                  {#if item.specification}
                    <span class="text-gray-600 text-sm">规格: {item.specification}</span>
                  {/if}
                </div>
              </div>
              <!-- 删除按钮 -->
              <button
                on:click={() => removeCartItem(index)}
                class="text-red-500 hover:bg-red-50 rounded p-1 ml-2"
                aria-label="删除商品"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            <!-- 第二行：单价、销售、金额 -->
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-4">
                <div class="text-gray-600">
                  <span>单价:</span>
                  <span class="ml-1 text-gray-900">¥{item.unitPrice.toFixed(2)}</span>
                </div>
                <div class="text-gray-600">
                  <span>销售:</span>
                  <span class="ml-1 text-gray-900">{item.quantity}{item.unit}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs text-gray-500">金额:</span>
                <span class="ml-1 text-red-500 font-bold text-lg">¥{item.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- 底部操作栏 -->
      <div class="border-t border-gray-200 p-4 bg-white">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-gray-700">金额:</span>
            <span class="text-xl font-bold text-red-500">¥{cartTotal.toFixed(2)}</span>
          </div>
          <button
            on:click={() => { closeCartModal(); finishSelection(); }}
            class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

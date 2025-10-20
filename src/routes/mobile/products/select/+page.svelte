<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import ProductEditModal from '$lib/components/ProductEditModal.svelte';
  import type { Product, InvoiceItem } from '$lib/types/invoice.ts';
  import { createEmptyInvoiceItem, calculateItemAmount } from '$lib/types/invoice.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let products: Product[] = [];
  let filtered: Product[] = [];
  let keyword = '';

  // 购物车状态
  let cart: InvoiceItem[] = [];

  // 编辑模态框状态
  let showEditModal = false;
  let editingProduct: Product | null = null;
  let editingItem: InvoiceItem | null = null;
  let editingCartIndex = -1; // 正在编辑的购物车项目索引

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
    editingItem.unit = product.unit;
    editingItem.quantity = 1;

    // 设置默认单价
    const defaultPrice = product.prices.find(p => p.type === 'sale' && p.isDefault) || product.prices[0];
    if (defaultPrice) {
      editingItem.unitPrice = defaultPrice.price;
    }

    // 规格不设置默认值，用户可以选择或不选
    editingItem.specification = '';

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

  // 响应式搜索
  $: handleSearch();

</script>

<MobileHeader
  title="选择产品"
  showBack={true}
  backgroundColor="bg-orange-500"
>
</MobileHeader>

<!-- 搜索框 -->
<div class="bg-white border-b border-gray-200 p-3 sticky top-0 z-10">
  <div class="relative">
    <input
      type="text"
      bind:value={keyword}
      placeholder="搜索产品名称、分类、条码、标签"
      class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
    <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
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

<!-- 购物车固定底部栏 - 始终显示 -->
<div class="fixed bottom-0 left-0 right-0 bg-blue-500 shadow-lg z-[60]">
  <div class="flex items-center justify-between px-4 py-3">
    <!-- 左侧：购物车图标和金额 -->
    <div class="flex items-center space-x-3">
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
    </div>

    <!-- 右侧：选好了按钮 -->
    <button
      on:click={finishSelection}
      class="bg-white text-blue-500 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
    >
      选好了
    </button>
  </div>
</div>

<!-- 底部占位，防止内容被购物车遮挡 -->
<div class="h-16"></div>

<!-- 使用独立的编辑模态框组件 -->
<ProductEditModal
  bind:show={showEditModal}
  bind:product={editingProduct}
  bind:item={editingItem}
  on:close={handleClose}
  on:save={handleSave}
  on:saveAndReturn={handleSaveAndReturn}
/>

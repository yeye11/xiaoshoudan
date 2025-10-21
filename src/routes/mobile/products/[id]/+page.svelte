<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Product } from '$lib/types/invoice';
  import { createEmptySpecification, createEmptyPrice } from '$lib/types/invoice';

  // 从 URL 获取产品 ID
  $: productId = $page.params.id;

  // 产品数据
  let product: Product | null = null;
  let originalProduct: Product | null = null;

  // 选项数据
  let categories: string[] = ['未分类', '装饰材料', '建筑材料', '五金配件'];
  let units: string[] = ['张', '件', '个', '套', '米', '平方米', '立方米', '吨', '公斤', '盒', '包'];

  // UI 状态
  let showCategoryPicker = false;
  let showUnitPicker = false;
  let isSubmitting = false;

  // 错误信息
  let errors: Record<string, string> = {};

  onMount(() => {
    loadProduct();
    loadOptions();
  });

  // 加载产品数据
  const loadProduct = () => {
    try {
      const stored = localStorage.getItem('products');
      const products: Product[] = stored ? JSON.parse(stored) : [];
      const found = products.find(p => p.id === productId);

      if (found) {
        product = JSON.parse(JSON.stringify(found)); // 深拷贝
        originalProduct = JSON.parse(JSON.stringify(found));
      } else {
        // 产品不存在，返回列表
        goto('/mobile/products');
      }
    } catch (error) {
      console.error('加载产品失败:', error);
      goto('/mobile/products');
    }
  };

  // 加载选项
  const loadOptions = () => {
    try {
      // 加载产品分类
      const storedCategories = localStorage.getItem('product_categories');
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        categories = [...new Set([...categories, ...parsed])];
      }

      // 加载单位选项
      const storedUnits = localStorage.getItem('product_units');
      if (storedUnits) {
        const parsed = JSON.parse(storedUnits);
        units = [...new Set([...units, ...parsed])];
      }
    } catch (error) {
      console.error('加载选项数据失败:', error);
    }
  };

  // 保存选项
  const saveOptions = () => {
    try {
      localStorage.setItem('product_categories', JSON.stringify(categories));
      localStorage.setItem('product_units', JSON.stringify(units));
    } catch (error) {
      console.error('保存选项失败:', error);
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    errors = {};

    if (!product) return false;

    if (!product.name.trim()) {
      errors.name = '请输入产品名称';
    }

    if (!product.unit) {
      errors.unit = '请选择单位';
    }

    return Object.keys(errors).length === 0;
  };

  // 保存产品
  const saveProduct = async () => {
    if (!validateForm() || !product) {
      return;
    }

    isSubmitting = true;

    try {
      // 如果分类为空，设置默认分类
      if (!product.category.trim()) {
        product.category = '未分类';
      }

      // 加载现有产品
      const stored = localStorage.getItem('products');
      const products: Product[] = stored ? JSON.parse(stored) : [];

      // 检查产品名称是否重复（排除当前产品）
      if (products.some(p => p.id !== productId && p.name === product.name.trim())) {
        errors.name = '产品名称已存在';
        isSubmitting = false;
        return;
      }

      // 更新产品
      product.name = product.name.trim();
      product.updatedAt = new Date().toISOString();

      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex >= 0) {
        products[productIndex] = product;
        localStorage.setItem('products', JSON.stringify(products));

        // 保存选项
        if (product.category && !categories.includes(product.category)) {
          categories.push(product.category);
        }
        if (product.unit && !units.includes(product.unit)) {
          units.push(product.unit);
        }
        saveOptions();

        // 返回产品列表
        goto('/mobile/products');
      } else {
        errors.general = '产品不存在';
      }
    } catch (error) {
      console.error('保存产品失败:', error);
      errors.general = '保存失败，请重试';
    } finally {
      isSubmitting = false;
    }
  };

  // 选择分类
  const selectCategory = (category: string) => {
    if (product) {
      product.category = category;
    }
    showCategoryPicker = false;
  };

  // 选择单位
  const selectUnit = (unit: string) => {
    if (product) {
      product.unit = unit;
    }
    showUnitPicker = false;
  };

  // 添加新分类
  const addNewCategory = () => {
    const newCategory = prompt('请输入新的产品分类:');
    if (newCategory && newCategory.trim()) {
      const category = newCategory.trim();
      if (!categories.includes(category)) {
        categories.push(category);
      }
      if (product) {
        product.category = category;
      }
    }
    showCategoryPicker = false;
  };

  // 添加新单位
  const addNewUnit = () => {
    const newUnit = prompt('请输入新的单位:');
    if (newUnit && newUnit.trim()) {
      const unit = newUnit.trim();
      if (!units.includes(unit)) {
        units.push(unit);
      }
      if (product) {
        product.unit = unit;
      }
    }
    showUnitPicker = false;
  };

  // 规格管理
  const addSpecification = () => {
    if (product) {
      product.specifications = [...product.specifications, createEmptySpecification()];
    }
  };

  const removeSpecification = (index: number) => {
    if (product && product.specifications.length > 1) {
      product.specifications = product.specifications.filter((_, i) => i !== index);
    }
  };

  const setDefaultSpecification = (index: number) => {
    if (product) {
      product.specifications = product.specifications.map((spec, i) => ({
        ...spec,
        isDefault: i === index
      }));
    }
  };

  // 价格管理
  const addPrice = (type: 'sale' | 'purchase' | 'wholesale') => {
    if (product) {
      product.prices = [...product.prices, createEmptyPrice(type)];
    }
  };

  const removePrice = (index: number) => {
    if (product && product.prices.length > 1) {
      product.prices = product.prices.filter((_, i) => i !== index);
    }
  };

  const setDefaultPrice = (index: number) => {
    if (product) {
      product.prices = product.prices.map((price, i) => ({
        ...price,
        isDefault: i === index
      }));
    }
  };

  // 标签管理
  const addTag = () => {
    const newTag = prompt('请输入新标签:');
    if (newTag && newTag.trim() && product) {
      const tag = newTag.trim();
      if (!product.tags.includes(tag)) {
        product.tags = [...product.tags, tag];
      }
    }
  };

  const removeTag = (index: number) => {
    if (product) {
      product.tags = product.tags.filter((_, i) => i !== index);
    }
  };

  // 返回
  const goBack = () => {
    goto('/mobile/products');
  };
</script>

{#if product}
<div class="min-h-screen bg-gray-50 pb-20">
  <!-- 头部 -->
  <div class="sticky top-0 bg-orange-500 text-white px-4 py-3 flex items-center justify-between z-10">
    <button on:click={goBack} class="p-2 -ml-2">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    <h1 class="text-lg font-medium">编辑产品</h1>
    <div class="w-10"></div>
  </div>

  <!-- 表单内容 -->
  <div class="p-4 space-y-4">
    
    <!-- 产品名称 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        名称 <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        bind:value={product.name}
        placeholder="请输入产品名称"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        class:border-red-500={errors.name}
      />
      {#if errors.name}
        <p class="text-red-500 text-xs mt-1">{errors.name}</p>
      {/if}
    </div>

    <!-- 条形码 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">条形码</label>
      <input
        type="text"
        bind:value={product.barcode}
        placeholder="请输入条形码"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>

    <!-- 产品分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
      <button
        type="button"
        on:click={() => showCategoryPicker = true}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        {product.category || '请选择分类'}
      </button>
    </div>

    <!-- 单位 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        单位 <span class="text-red-500">*</span>
      </label>
      <button
        type="button"
        on:click={() => showUnitPicker = true}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        class:border-red-500={errors.unit}
      >
        {product.unit || '请选择单位'}
      </button>
      {#if errors.unit}
        <p class="text-red-500 text-xs mt-1">{errors.unit}</p>
      {/if}
    </div>

    <!-- 规格型号 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">规格型号</label>
        <button
          type="button"
          on:click={addSpecification}
          class="text-orange-500 text-sm font-medium hover:text-orange-600"
        >
          + 添加
        </button>
      </div>
      {#each product.specifications as spec, index}
        <div class="flex items-center space-x-2 mb-2">
          <input
            type="text"
            bind:value={spec.name}
            placeholder="如：1220*2440"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="button"
            on:click={() => setDefaultSpecification(index)}
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            class:bg-orange-500={spec.isDefault}
            class:text-white={spec.isDefault}
            class:bg-gray-100={!spec.isDefault}
            class:text-gray-700={!spec.isDefault}
          >
            默认
          </button>
          {#if product.specifications.length > 1}
            <button
              type="button"
              on:click={() => removeSpecification(index)}
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <!-- 价格管理 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">价格管理</label>
        <div class="flex space-x-2">
          <button
            type="button"
            on:click={() => addPrice('sale')}
            class="text-orange-500 text-sm font-medium hover:text-orange-600"
          >
            + 销售价
          </button>
          <button
            type="button"
            on:click={() => addPrice('wholesale')}
            class="text-orange-500 text-sm font-medium hover:text-orange-600"
          >
            + 批发价
          </button>
        </div>
      </div>
      {#each product.prices as price, index}
        <div class="flex items-center space-x-2 mb-2">
          <select
            bind:value={price.type}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="sale">销售价</option>
            <option value="purchase">采购价</option>
            <option value="wholesale">批发价</option>
          </select>
          <input
            type="number"
            bind:value={price.price}
            placeholder="0.00"
            step="0.01"
            min="0"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="button"
            on:click={() => setDefaultPrice(index)}
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            class:bg-orange-500={price.isDefault}
            class:text-white={price.isDefault}
            class:bg-gray-100={!price.isDefault}
            class:text-gray-700={!price.isDefault}
          >
            默认
          </button>
          {#if product.prices.length > 1}
            <button
              type="button"
              on:click={() => removePrice(index)}
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <!-- 标签 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">标签</label>
        <button
          type="button"
          on:click={addTag}
          class="text-orange-500 text-sm font-medium hover:text-orange-600"
        >
          + 添加
        </button>
      </div>
      {#if product.tags.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each product.tags as tag, index}
            <div class="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {tag}
              <button
                type="button"
                on:click={() => removeTag(index)}
                class="ml-2 text-gray-500 hover:text-red-500"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 text-sm">暂无标签</p>
      {/if}
    </div>

    <!-- 备注 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
      <textarea
        bind:value={product.notes}
        placeholder="请输入备注信息"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- 错误信息 -->
    {#if errors.general}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {errors.general}
      </div>
    {/if}

    <!-- 保存按钮 -->
    <button
      type="button"
      on:click={saveProduct}
      disabled={isSubmitting}
      class="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</div>

<!-- 分类选择器 -->
{#if showCategoryPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full max-h-96 overflow-y-auto rounded-t-2xl">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 class="text-lg font-medium">选择分类</h3>
        <button on:click={() => showCategoryPicker = false} class="p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-4 space-y-2">
        {#each categories as category}
          <button
            on:click={() => selectCategory(category)}
            class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            class:bg-orange-50={product.category === category}
            class:text-orange-600={product.category === category}
          >
            {category}
          </button>
        {/each}
        <button
          on:click={addNewCategory}
          class="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          + 添加新分类
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- 单位选择器 -->
{#if showUnitPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full max-h-96 overflow-y-auto rounded-t-2xl">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 class="text-lg font-medium">选择单位</h3>
        <button on:click={() => showUnitPicker = false} class="p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-4 space-y-2">
        {#each units as unit}
          <button
            on:click={() => selectUnit(unit)}
            class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            class:bg-orange-50={product.unit === unit}
            class:text-orange-600={product.unit === unit}
          >
            {unit}
          </button>
        {/each}
        <button
          on:click={addNewUnit}
          class="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          + 添加新单位
        </button>
      </div>
    </div>
  </div>
{/if}
{/if}


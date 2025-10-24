<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { Product } from '$lib/types/invoice';
  import { createEmptySpecification } from '$lib/types/invoice';

  // 从 URL 获取产品 ID
  $: productId = $page.params.id;

  // 产品数据
  let product: Product | null = null;
  let originalProduct: Product | null = null;

  // 选项数据
  let categories: string[] = ['未分类', '装饰材料', '建筑材料', '五金配件'];
  let units: string[] = ['张', '件', '个', '套', '米', '平方米', '立方米', '吨', '公斤', '盒', '包'];

  // 全局标签和规格列表
  let globalTags: string[] = [];
  let globalSpecs: string[] = [];

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

      // 加载全局标签
      const storedTags = localStorage.getItem('global_tags');
      if (storedTags) {
        globalTags = JSON.parse(storedTags);
      }

      // 加载全局规格
      const storedSpecs = localStorage.getItem('global_specifications');
      if (storedSpecs) {
        globalSpecs = JSON.parse(storedSpecs);
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

  // 标签管理
  const removeTag = (tag: string) => {
    if (product) {
      product.tags = product.tags.filter(t => t !== tag);
    }
  };

</script>

{#if product}
<MobileHeader title="编辑产品" showBack={true} backgroundColor="bg-orange-500">
  <div slot="actions">
    <button
      on:click={saveProduct}
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
  <!-- 错误提示 -->
  {#if errors.general}
    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-600 text-sm">{errors.general}</p>
    </div>
  {/if}

  <!-- 基本信息 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <h3 class="font-medium text-gray-900">基本信息</h3>

    <!-- 产品名称 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        产品名称 <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          type="text"
          bind:value={product.name}
          maxlength="50"
          placeholder="请输入产品名称"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          class:border-red-500={errors.name}
        />
        <div class="text-xs text-gray-500 mt-1 text-right">{product.name?.length || 0}/50</div>
      </div>
      {#if errors.name}
        <p class="text-red-500 text-xs mt-1">{errors.name}</p>
      {/if}
    </div>

    <!-- 产品分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
      <div class="flex gap-2">
        <select
          bind:value={product.category}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">请选择分类</option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <button
          type="button"
          on:click={addNewCategory}
          class="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>

    <!-- 产品单位 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">产品单位</label>
      <div class="flex gap-2">
        <select
          bind:value={product.unit}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">请选择单位</option>
          {#each units as unit}
            <option value={unit}>{unit}</option>
          {/each}
        </select>
        <button
          type="button"
          on:click={addNewUnit}
          class="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>

    <!-- 条形码 -->
    <FormField
      label="条形码"
      type="text"
      bind:value={product.barcode}
      placeholder="请输入条形码"
    />
  </div>

  <!-- 规格型号 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">规格型号</h3>
      <button
        type="button"
        on:click={addSpecification}
        class="text-orange-500 text-sm font-medium hover:text-orange-600"
      >
        + 添加
      </button>
    </div>

    <!-- 全局规格列表 -->
    {#if globalSpecs.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">全局规格（点击添加）</div>
        <div class="flex flex-wrap gap-2">
          {#each globalSpecs as spec}
            <button
              type="button"
              on:click={() => {
                const exists = product.specifications.some(s => s.name === spec);
                if (!exists) {
                  product.specifications = [...product.specifications, {
                    id: crypto.randomUUID(),
                    name: spec,
                    isDefault: product.specifications.length === 0
                  }];
                }
              }}
              class="px-3 py-1.5 rounded-lg text-sm transition-colors border
                     {product.specifications.some(s => s.name === spec)
                       ? 'bg-orange-500 text-white border-orange-500'
                       : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}"
            >
              {spec}
              {#if product.specifications.some(s => s.name === spec)}
                <span class="ml-1">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 当前产品规格 -->
    {#if product.specifications.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">当前产品规格</div>
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
                aria-label="删除规格"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 标签 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">标签</h3>
    </div>

    <!-- 全局标签列表 -->
    {#if globalTags.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">全局标签（点击添加）</div>
        <div class="flex flex-wrap gap-2">
          {#each globalTags as tag}
            <button
              type="button"
              on:click={() => {
                if (!product.tags.includes(tag)) {
                  product.tags = [...product.tags, tag];
                }
              }}
              class="px-3 py-1.5 rounded-lg text-sm transition-colors border
                     {product.tags.includes(tag)
                       ? 'bg-orange-500 text-white border-orange-500'
                       : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}"
            >
              {tag}
              {#if product.tags.includes(tag)}
                <span class="ml-1">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 当前产品标签 -->
    {#if product.tags.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">当前产品标签</div>
        <div class="flex flex-wrap gap-2">
          {#each product.tags as tag}
            <div class="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm">
              <span>{tag}</span>
              <button
                type="button"
                on:click={() => removeTag(tag)}
                class="text-orange-700 hover:text-orange-900"
                aria-label="删除标签"
              >
                ×
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- 备注 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
    <textarea
      bind:value={product.notes}
      placeholder="请输入备注信息"
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
    ></textarea>
  </div>

  <!-- 保存按钮 -->
  <div class="flex space-x-3 pb-6">
    <button
      type="button"
      on:click={() => goto('/mobile/products')}
      class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
    >
      取消
    </button>
    <button
      type="button"
      on:click={saveProduct}
      disabled={isSubmitting}
      class="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
    >
      {isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</div>

{/if}


<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Product, ProductSpecification, ProductPrice } from '$lib/types/invoice.ts';
  import { createEmptyProduct, createEmptySpecification, createEmptyPrice } from '$lib/types/invoice.ts';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // 表单数据
  let product: Product = createEmptyProduct();
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  // 选择器状态
  let showCategoryPicker = false;
  let showUnitPicker = false;

  // 选项数据
  let categories: string[] = ['未分类', '装饰材料', '建筑材料', '五金配件'];
  let units: string[] = ['张', '件', '个', '套', '米', '平方米', '立方米', '吨', '公斤', '盒', '包'];

  onMount(() => {
    loadOptions();
    // 默认添加一个规格
    if (product.specifications.length === 0) {
      product.specifications.push(createEmptySpecification());
    }
    // 确保三个价格类型都存在
    ensureAllPriceTypes();
  });

  // 确保三个价格类型都存在
  const ensureAllPriceTypes = () => {
    const priceTypes: Array<'sale' | 'purchase' | 'wholesale'> = ['sale', 'purchase', 'wholesale'];
    priceTypes.forEach(type => {
      if (!product.prices.find(p => p.type === type)) {
        product.prices.push(createEmptyPrice(type));
      }
    });
  };

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

  const saveOptions = () => {
    try {
      localStorage.setItem('product_categories', JSON.stringify(categories));
      localStorage.setItem('product_units', JSON.stringify(units));
    } catch (error) {
      console.error('保存选项数据失败:', error);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    errors = {};

    // 只验证产品名称是必填的
    if (!product.name.trim()) {
      errors.name = '产品名称不能为空';
    }

    // 其他字段都是可选的，不进行验证
    // 单位、规格、价格等都可以为空

    return Object.keys(errors).length === 0;
  };

  // 保存产品
  const saveProduct = async () => {
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      // 检查是否输入了多个产品名称（用逗号分割）
      const productNames = product.name.split(/[,，]/).map(name => name.trim()).filter(name => name);

      if (productNames.length === 0) {
        errors.name = '产品名称不能为空';
        isSubmitting = false;
        return;
      }

      // 加载现有产品
      const stored = localStorage.getItem('products');
      const products: Product[] = stored ? JSON.parse(stored) : [];

      // 检查是否有重复的产品名称
      const duplicateNames = productNames.filter(name => products.some(p => p.name === name));
      if (duplicateNames.length > 0) {
        errors.name = `以下产品名称已存在: ${duplicateNames.join(', ')}`;
        isSubmitting = false;
        return;
      }

      // 清理规格数据（移除空的规格）
      const cleanedSpecifications = product.specifications.filter(spec => spec.name.trim());

      // 清理价格数据（移除无效的价格）
      const cleanedPrices = product.prices.filter(price => price.price > 0);

      // 如果有规格，确保至少有一个默认规格
      if (cleanedSpecifications.length > 0) {
        if (!cleanedSpecifications.some(spec => spec.isDefault)) {
          cleanedSpecifications[0].isDefault = true;
        }
      }

      // 如果没有价格，添加一个默认价格
      let finalPrices = cleanedPrices;
      if (finalPrices.length === 0) {
        finalPrices = [{
          ...createEmptyPrice('sale'),
          price: 0,
          isDefault: true
        }];
      } else {
        // 确保至少有一个默认价格
        if (!finalPrices.some(price => price.isDefault)) {
          finalPrices[0].isDefault = true;
        }
      }

      // 如果单位为空，设置默认单位
      const finalUnit = product.unit.trim() || '件';

      // 如果分类为空，设置默认分类
      const finalCategory = product.category.trim() || '未分类';

      // 为每个产品名称创建一个产品
      const newProducts: Product[] = productNames.map(name => ({
        id: crypto.randomUUID(),
        name: name,
        barcode: product.barcode,
        category: finalCategory,
        unit: finalUnit,
        specifications: cleanedSpecifications.map(spec => ({
          ...spec,
          id: crypto.randomUUID() // 每个产品的规格都有独立的ID
        })),
        prices: finalPrices.map(price => ({
          ...price,
          id: crypto.randomUUID() // 每个产品的价格都有独立的ID
        })),
        tags: [...product.tags],
        notes: product.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // 添加所有新产品
      products.push(...newProducts);

      // 保存到localStorage
      localStorage.setItem('products', JSON.stringify(products));

      // 保存选项
      if (finalCategory && !categories.includes(finalCategory)) {
        categories.push(finalCategory);
      }
      if (finalUnit && !units.includes(finalUnit)) {
        units.push(finalUnit);
      }
      saveOptions();

      // 显示成功消息
      if (productNames.length > 1) {
        alert(`成功创建 ${productNames.length} 个产品！`);
      }

      // 返回产品列表
      goto('/mobile/products');
    } catch (error) {
      console.error('保存产品失败:', error);
      errors.general = '保存失败，请重试';
    } finally {
      isSubmitting = false;
    }
  };

  // 选择分类
  const selectCategory = (category: string) => {
    product.category = category;
    showCategoryPicker = false;
  };

  // 选择单位
  const selectUnit = (unit: string) => {
    product.unit = unit;
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
      product.category = category;
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
      product.unit = unit;
    }
    showUnitPicker = false;
  };

  // 规格管理
  const addSpecification = () => {
    product.specifications = [...product.specifications, createEmptySpecification()];
  };

  const removeSpecification = (index: number) => {
    if (product.specifications.length > 1) {
      product.specifications = product.specifications.filter((_, i) => i !== index);
    }
  };

  const setDefaultSpecification = (index: number) => {
    product.specifications = product.specifications.map((spec, i) => ({
      ...spec,
      isDefault: i === index
    }));
  };

  // 价格管理

  // 根据类型设置默认价格
  const setDefaultPriceByType = (type: 'sale' | 'purchase' | 'wholesale') => {
    const priceIndex = product.prices.findIndex(p => p.type === type);
    if (priceIndex !== -1) {
      product.prices.forEach((price, i) => {
        if (price.type === type) {
          price.isDefault = i === priceIndex;
        }
      });
    }
  };

  // 获取指定类型的价格对象
  const getPriceByType = (type: 'sale' | 'purchase' | 'wholesale') => {
    return product.prices.find(p => p.type === type);
  };

  // 更新指定类型的价格值
  const updatePriceByType = (type: 'sale' | 'purchase' | 'wholesale', value: number) => {
    const price = product.prices.find(p => p.type === type);
    if (price) {
      price.price = value;
    }
  };

  // 标签管理
  const addTag = () => {
    product.tags = [...product.tags, ''];
  };

  const removeTag = (index: number) => {
    product.tags = product.tags.filter((_, i) => i !== index);
  };

  // 生成条形码
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    product.barcode = `${timestamp.slice(-8)}${random}`.toUpperCase();
  };
</script>

<MobileHeader 
  title="新建产品" 
  showBack={true}
  backgroundColor="bg-orange-500"
>
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
        名称 <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        bind:value={product.name}
        placeholder="请输入产品名称（可用逗号分割多个产品）"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
               {errors.name ? 'border-red-500' : ''}"
      />
      {#if errors.name}
        <p class="text-red-500 text-sm mt-1">{errors.name}</p>
      {:else}
        <p class="text-gray-500 text-xs mt-1">提示：可输入多个产品名称，用逗号分割，如：苹果,香蕉,橙子</p>
      {/if}
    </div>

    <!-- 条形码 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">条形码</label>
      <div class="flex space-x-2">
        <input
          type="text"
          bind:value={product.barcode}
          placeholder="请输入条形码"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="button"
          on:click={generateBarcode}
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          生成
        </button>
      </div>
    </div>

    <!-- 产品分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          bind:value={product.category}
          placeholder="请输入或选择产品分类"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="button"
          on:click={() => showCategoryPicker = true}
          class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="选择产品分类"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 单位 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        单位
      </label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          bind:value={product.unit}
          placeholder="请输入或选择单位"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
                 {errors.unit ? 'border-red-500' : ''}"
        />
        <button
          type="button"
          on:click={() => showUnitPicker = true}
          class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      {#if errors.unit}
        <p class="text-red-500 text-sm mt-1">{errors.unit}</p>
      {/if}
    </div>
  </div>

  <!-- 规格型号 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">规格型号</h3>
      <button
        type="button"
        on:click={addSpecification}
        class="text-orange-500 text-sm font-medium"
      >
        + 添加
      </button>
    </div>

    {#if errors.specifications}
      <p class="text-red-500 text-sm">{errors.specifications}</p>
    {/if}

    <div class="space-y-3">
      {#each product.specifications as spec, index}
        <div class="flex items-center space-x-2">
          <input
            type="text"
            bind:value={spec.name}
            placeholder="如: 1220*2440"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="button"
            on:click={() => setDefaultSpecification(index)}
            class="px-3 py-2 text-sm rounded-lg transition-colors
                   {spec.isDefault ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
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
  </div>

  <!-- 价格管理 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <h3 class="font-medium text-gray-900">价格管理</h3>

    {#if errors.prices}
      <p class="text-red-500 text-sm">{errors.prices}</p>
    {/if}

    <div class="space-y-3">
      <!-- 吊牌价 -->
      <div class="flex items-center space-x-2">
        <div class="w-16 text-sm text-gray-700 flex-shrink-0">吊牌价</div>
        <input
          type="number"
          value={getPriceByType('sale')?.price ?? 0}
          on:input={(e) => updatePriceByType('sale', parseFloat(e.currentTarget.value) || 0)}
          placeholder="0"
          step="0.01"
          min="0"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="button"
          on:click={() => setDefaultPriceByType('sale')}
          class="px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0
                 {getPriceByType('sale')?.isDefault ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          默认
        </button>
      </div>

      <!-- 采购价 -->
      <div class="flex items-center space-x-2">
        <div class="w-16 text-sm text-gray-700 flex-shrink-0">采购价</div>
        <input
          type="number"
          value={getPriceByType('purchase')?.price ?? 0}
          on:input={(e) => updatePriceByType('purchase', parseFloat(e.currentTarget.value) || 0)}
          placeholder="0"
          step="0.01"
          min="0"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="button"
          on:click={() => setDefaultPriceByType('purchase')}
          class="px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0
                 {getPriceByType('purchase')?.isDefault ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          默认
        </button>
      </div>

      <!-- 批发价 -->
      <div class="flex items-center space-x-2">
        <div class="w-16 text-sm text-gray-700 flex-shrink-0">批发价</div>
        <input
          type="number"
          value={getPriceByType('wholesale')?.price ?? 0}
          on:input={(e) => updatePriceByType('wholesale', parseFloat(e.currentTarget.value) || 0)}
          placeholder="0"
          step="0.01"
          min="0"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="button"
          on:click={() => setDefaultPriceByType('wholesale')}
          class="px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0
                 {getPriceByType('wholesale')?.isDefault ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          默认
        </button>
      </div>
    </div>
  </div>

  <!-- 标签 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">标签</h3>
      <button
        type="button"
        on:click={addTag}
        class="text-orange-500 text-sm font-medium"
      >
        + 添加
      </button>
    </div>

    <div class="space-y-2">
      {#each product.tags as tag, index}
        <div class="flex items-center space-x-2">
          <input
            type="text"
            bind:value={product.tags[index]}
            placeholder="请输入标签"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {#if product.tags.length > 1}
            <button
              type="button"
              on:click={() => removeTag(index)}
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

<!-- 分类选择器 -->
{#if showCategoryPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full rounded-t-lg max-h-96 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择产品分类</h3>
          <button
            on:click={() => showCategoryPicker = false}
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4 space-y-2">
        {#each categories as category}
          <button
            on:click={() => selectCategory(category)}
            class="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {category}
          </button>
        {/each}
        <button
          on:click={addNewCategory}
          class="w-full text-left p-3 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
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
    <div class="bg-white w-full rounded-t-lg max-h-96 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择单位</h3>
          <button
            on:click={() => showUnitPicker = false}
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4 grid grid-cols-3 gap-2">
        {#each units as unit}
          <button
            on:click={() => selectUnit(unit)}
            class="p-3 text-center rounded-lg hover:bg-gray-100 transition-colors border"
          >
            {unit}
          </button>
        {/each}
        <button
          on:click={addNewUnit}
          class="p-3 text-center rounded-lg text-orange-500 hover:bg-orange-50 transition-colors border border-orange-200"
        >
          + 新单位
        </button>
      </div>
    </div>
  </div>
{/if}

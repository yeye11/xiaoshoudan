<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { Product } from '$lib/types/invoice.ts';
  import { createEmptyProduct, createEmptySpecification } from '$lib/types/invoice.ts';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { validators } from '$lib/utils/validation';
  import { useForm } from '$lib/composables/useForm';
  import { productCategoryStore, productUnitStore } from '$lib/stores/categoryStore';

  // 获取返回URL
  let returnUrl = '/mobile/products';

  // 批量模式
  let isBatchMode = false;
  let batchNames = '';

  // 初始化表单
  const form = useForm({
    initialData: createEmptyProduct(),
    validators: {
      name: validators.name
    },
    onSave: async (data) => {
      if (isBatchMode) {
        // 批量模式：创建多个产品
        const names = batchNames
          .split(/[,，;；\n\r]+/)
          .map(name => name.trim())
          .filter(name => name.length > 0);

        if (names.length === 0) {
          form.setFieldError('general', '请输入至少一个产品名称');
          throw new Error('请输入至少一个产品名称');
        }

        console.log('批量创建产品，数量:', names.length);
        for (const name of names) {
          const newProduct = { ...data };
          newProduct.id = crypto.randomUUID();
          newProduct.name = name;
          newProduct.updatedAt = new Date().toISOString();
          StorageManager.addProduct(newProduct);
          console.log('已添加产品:', name);
        }
        console.log('批量创建完成');
      } else {
        // 单个模式
        data.name = data.name.trim();
        data.updatedAt = new Date().toISOString();
        StorageManager.addProduct(data);
        console.log('已添加产品:', data.name);
      }

      // 保存分类和单位
      if (data.category && !$productCategoryStore.includes(data.category)) {
        productCategoryStore.add(data.category);
      }
      if (data.unit && !$productUnitStore.includes(data.unit)) {
        productUnitStore.add(data.unit);
      }

      // 保存当前选择（分类、单位、标签）
      saveCurrentSelection();
    },
    onSuccess: () => {
      goto(returnUrl);
    }
  });

  const { data, errors, isSubmitting } = form;

  // 自定义保存处理函数，支持批量模式
  const handleCustomSave = async () => {
    // 清除之前的错误
    form.clearFieldError('general');

    if (isBatchMode) {
      // 批量模式：验证批量名称
      const names = batchNames
        .split(/[,，;；\n\r]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (names.length === 0) {
        form.setFieldError('general', '请输入至少一个产品名称');
        return;
      }

      // 批量模式下，临时设置一个假的 name 值来通过验证
      // 这个值会在 onSave 中被替换
      $data.name = '批量模式临时名称';

      // 调用保存
      await form.handleSave();
    } else {
      // 单个模式：使用正常的表单验证
      await form.handleSave();
    }
  };

  // 全局标签和规格列表
  let globalTags: string[] = [];
  let globalSpecs: string[] = [];

  onMount(() => {
    // 获取返回URL参数
    const urlReturnUrl = $page.url.searchParams.get('returnUrl');
    if (urlReturnUrl) {
      returnUrl = decodeURIComponent(urlReturnUrl);
    }

    productCategoryStore.load();
    productUnitStore.load();
    loadOptions();

    // 加载上次选择的分类、单位和标签
    loadLastSelection();
  });

  // 加载上次选择的分类、单位和标签
  const loadLastSelection = () => {
    try {
      const lastCategory = localStorage.getItem('last_product_category');
      if (lastCategory) {
        $data.category = lastCategory;
      }

      const lastUnit = localStorage.getItem('last_product_unit');
      if (lastUnit) {
        $data.unit = lastUnit;
      }

      const lastTags = localStorage.getItem('last_product_tags');
      if (lastTags) {
        $data.tags = JSON.parse(lastTags);
      }
    } catch (error) {
      console.error('加载上次选择失败:', error);
    }
  };

  // 保存当前选择
  const saveCurrentSelection = () => {
    try {
      if ($data.category) {
        localStorage.setItem('last_product_category', $data.category);
      }
      if ($data.unit) {
        localStorage.setItem('last_product_unit', $data.unit);
      }
      if ($data.tags && $data.tags.length > 0) {
        localStorage.setItem('last_product_tags', JSON.stringify($data.tags));
      }
    } catch (error) {
      console.error('保存选择失败:', error);
    }
  };

  // 加载选项
  const loadOptions = () => {
    try {
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

  // 添加新分类
  const addNewCategory = () => {
    const newCategory = prompt('请输入新的产品分类:');
    if (newCategory && newCategory.trim()) {
      productCategoryStore.add(newCategory.trim());
    }
  };

  // 添加新单位
  const addNewUnit = () => {
    const newUnit = prompt('请输入新的产品单位:');
    if (newUnit && newUnit.trim()) {
      productUnitStore.add(newUnit.trim());
    }
  };

  // 添加规格
  const addSpecification = () => {
    if ($data.specifications) {
      $data.specifications = [...$data.specifications, {
        id: crypto.randomUUID(),
        name: '',
        isDefault: $data.specifications.length === 0
      }];
    }
  };

  // 删除规格
  const removeSpecification = (index: number) => {
    if ($data.specifications) {
      $data.specifications = $data.specifications.filter((_, i) => i !== index);
      // 如果删除了默认规格，设置第一个为默认
      if ($data.specifications.length > 0 && !$data.specifications.some(s => s.isDefault)) {
        $data.specifications[0].isDefault = true;
      }
    }
  };

  // 设置默认规格
  const setDefaultSpecification = (index: number) => {
    if ($data.specifications) {
      $data.specifications = $data.specifications.map((s, i) => ({
        ...s,
        isDefault: i === index
      }));
    }
  };

  // 添加标签
  const addTag = (tag: string) => {
    if ($data.tags && !$data.tags.includes(tag)) {
      $data.tags = [...$data.tags, tag];
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    if ($data.tags) {
      $data.tags = $data.tags.filter(t => t !== tag);
    }
  };
</script>

<MobileHeader 
  title="新建产品" 
  showBack={true}
  backgroundColor="bg-green-500"
>
  <div slot="actions">
    <button
      on:click={handleCustomSave}
      disabled={$isSubmitting}
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
  {#if $errors.general}
    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-600 text-sm">{$errors.general}</p>
    </div>
  {/if}

  <!-- 基本信息 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <h3 class="font-medium text-gray-900">基本信息</h3>
    
    <!-- 产品名称 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">
          产品名称 <span class="text-red-500">*</span>
        </label>
        <button
          type="button"
          on:click={() => (isBatchMode = !isBatchMode)}
          class="text-xs px-2 py-1 rounded transition-colors"
          class:bg-green-500={isBatchMode}
          class:text-white={isBatchMode}
          class:bg-gray-100={!isBatchMode}
          class:text-gray-700={!isBatchMode}
        >
          {isBatchMode ? '批量模式' : '单个模式'}
        </button>
      </div>

      {#if isBatchMode}
        <!-- 批量模式 -->
        <div class="relative">
          <textarea
            bind:value={batchNames}
            placeholder="输入多个产品名称，用逗号、分号或换行符分隔&#10;例如：产品A,产品B;产品C"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            class:border-red-500={$errors.general}
          ></textarea>
          <div class="text-xs text-gray-500 mt-1">
            {batchNames.split(/[,，;；\n\r]+/).filter(n => n.trim().length > 0).length} 个产品
          </div>
        </div>
      {:else}
        <!-- 单个模式 -->
        <div class="relative">
          <input
            type="text"
            bind:value={$data.name}
            maxlength="50"
            placeholder="请输入产品名称"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            class:border-red-500={$errors.name}
          />
          <div class="text-xs text-gray-500 mt-1 text-right">{$data.name?.length || 0}/50</div>
        </div>
        {#if $errors.name}
          <p class="text-red-500 text-xs mt-1">{$errors.name}</p>
        {/if}
      {/if}

      {#if $errors.general}
        <p class="text-red-500 text-xs mt-1">{$errors.general}</p>
      {/if}
    </div>

    <!-- 产品分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
      <div class="flex gap-2">
        <select
          bind:value={$data.category}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">请选择分类</option>
          {#each $productCategoryStore as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <button
          type="button"
          on:click={addNewCategory}
          class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
          bind:value={$data.unit}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">请选择单位</option>
          {#each $productUnitStore as unit}
            <option value={unit}>{unit}</option>
          {/each}
        </select>
        <button
          type="button"
          on:click={addNewUnit}
          class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>

    <!-- 条形码 -->
    <FormField
      label="条形码"
      type="text"
      bind:value={$data.barcode}
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
        class="text-green-500 text-sm font-medium hover:text-green-600"
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
                const exists = $data.specifications.some(s => s.name === spec);
                if (!exists) {
                  $data.specifications = [...$data.specifications, {
                    id: crypto.randomUUID(),
                    name: spec,
                    isDefault: $data.specifications.length === 0
                  }];
                }
              }}
              class="px-3 py-1.5 rounded-lg text-sm transition-colors border
                     {$data.specifications.some(s => s.name === spec)
                       ? 'bg-green-500 text-white border-green-500'
                       : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}"
            >
              {spec}
              {#if $data.specifications.some(s => s.name === spec)}
                <span class="ml-1">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 当前产品规格 -->
    {#if $data.specifications.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">当前产品规格</div>
        {#each $data.specifications as spec, index}
          <div class="flex items-center space-x-2 mb-2">
            <input
              type="text"
              bind:value={spec.name}
              placeholder="如：1220*2440"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              on:click={() => setDefaultSpecification(index)}
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              class:bg-green-500={spec.isDefault}
              class:text-white={spec.isDefault}
              class:bg-gray-100={!spec.isDefault}
              class:text-gray-700={!spec.isDefault}
            >
              默认
            </button>
            {#if $data.specifications.length > 1}
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
              on:click={() => addTag(tag)}
              class="px-3 py-1.5 rounded-lg text-sm transition-colors border
                     {$data.tags.includes(tag)
                       ? 'bg-green-500 text-white border-green-500'
                       : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}"
            >
              {tag}
              {#if $data.tags.includes(tag)}
                <span class="ml-1">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 当前产品标签 -->
    {#if $data.tags.length > 0}
      <div>
        <div class="text-xs text-gray-500 mb-2">当前产品标签</div>
        <div class="flex flex-wrap gap-2">
          {#each $data.tags as tag}
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm">
              <span>{tag}</span>
              <button
                type="button"
                on:click={() => removeTag(tag)}
                class="text-green-700 hover:text-green-900"
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
      bind:value={$data.notes}
      placeholder="请输入备注信息"
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
      on:click={handleCustomSave}
      disabled={$isSubmitting}
      class="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
    >
      {#if $isSubmitting}
        {isBatchMode ? '批量保存中...' : '保存中...'}
      {:else}
        {isBatchMode ? `批量保存 (${batchNames.split(/[,，;；\n\r]+/).filter(n => n.trim().length > 0).length})` : '保存'}
      {/if}
    </button>
  </div>
</div>

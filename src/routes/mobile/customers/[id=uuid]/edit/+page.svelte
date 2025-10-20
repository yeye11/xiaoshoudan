<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import type { Customer } from '$lib/types/invoice.ts';
  import { createEmptyCustomer } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // 表单数据
  let customer: Customer = createEmptyCustomer();
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  let customerId: string;

  // 客户分类选项
  let categories: string[] = ['未分类', '重要客户', '普通客户', '潜在客户'];
  let showCategoryPicker = false;

  onMount(() => {
    customerId = $page.params.id;
    loadCustomer();
    loadCategories();
  });

  const loadCustomer = () => {
    try {
      const stored = localStorage.getItem('customers');
      if (stored) {
        const customers: Customer[] = JSON.parse(stored);
        const foundCustomer = customers.find(c => c.id === customerId);
        if (foundCustomer) {
          customer = { ...foundCustomer };
        } else {
          errors.general = '客户不存在';
        }
      }
    } catch (error) {
      console.error('加载客户失败:', error);
      errors.general = '加载客户信息失败';
    }
  };

  const loadCategories = () => {
    try {
      const stored = localStorage.getItem('customer_categories');
      if (stored) {
        const storedCategories = JSON.parse(stored);
        categories = [...new Set([...categories, ...storedCategories])];
      }
    } catch (error) {
      console.error('加载客户分类失败:', error);
    }
  };

  const saveCategories = () => {
    try {
      localStorage.setItem('customer_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('保存客户分类失败:', error);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    errors = {};

    // 只有客户名称是必填项
    if (!customer.name.trim()) {
      errors.name = '客户名称不能为空';
    }

    // 电话号码可以为空，但如果填写了需要验证格式
    if (customer.phone.trim() && !/^1[3-9]\d{9}$/.test(customer.phone.replace(/[-\s]/g, ''))) {
      errors.phone = '请输入有效的手机号码';
    }

    // 邮箱可以为空，但如果填写了需要验证格式
    if (customer.email && customer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 期初欠款不能为负数
    if (customer.initialDebt < 0) {
      errors.initialDebt = '期初欠款不能为负数';
    }

    return Object.keys(errors).length === 0;
  };

  // 保存客户
  const saveCustomer = async () => {
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      const stored = localStorage.getItem('customers');
      const customers: Customer[] = stored ? JSON.parse(stored) : [];

      // 检查客户名称是否重复（排除当前客户）
      if (customers.some(c => c.id !== customerId && c.name === customer.name.trim())) {
        errors.name = '客户名称已存在';
        isSubmitting = false;
        return;
      }

      // 更新客户信息
      customer.name = customer.name.trim();
      customer.updatedAt = new Date().toISOString();

      const customerIndex = customers.findIndex(c => c.id === customerId);
      if (customerIndex >= 0) {
        customers[customerIndex] = customer;
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // 返回客户详情页面
        goto(`/mobile/customers/${customerId}`);
      } else {
        errors.general = '客户不存在';
      }
    } catch (error) {
      console.error('保存客户失败:', error);
      errors.general = '保存失败，请重试';
    } finally {
      isSubmitting = false;
    }
  };

  // 电话号码格式化
  const formatPhoneInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length > 3 && value.length <= 7) {
      value = value.replace(/(\d{3})(\d+)/, '$1-$2');
    } else if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
    
    customer.phone = value;
  };

  // 选择分类
  const selectCategory = (category: string) => {
    customer.category = category;
    showCategoryPicker = false;
  };

  // 添加新分类
  const addNewCategory = () => {
    const newCategory = prompt('请输入新的客户分类:');
    if (newCategory && newCategory.trim()) {
      const trimmedCategory = newCategory.trim();
      if (!categories.includes(trimmedCategory)) {
        categories.push(trimmedCategory);
        saveCategories();
        customer.category = trimmedCategory;
      }
      showCategoryPicker = false;
    }
  };
</script>

<MobileHeader 
  title="编辑客户" 
  showBack={true}
  backgroundColor="bg-blue-500"
>
  <div slot="actions">
    <button
      on:click={saveCustomer}
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
    
    <!-- 客户名称 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        客户名称 <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        bind:value={customer.name}
        placeholder="请输入客户名称"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
               {errors.name ? 'border-red-500' : ''}"
      />
      {#if errors.name}
        <p class="text-red-500 text-sm mt-1">{errors.name}</p>
      {/if}
    </div>

    <!-- 客户分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">客户分类</label>
      <button
        type="button"
        on:click={() => showCategoryPicker = true}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
      >
        {customer.category || '请选择客户分类'}
      </button>
    </div>

    <!-- 期初欠款 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">期初欠款</label>
      <input
        type="number"
        bind:value={customer.initialDebt}
        placeholder="请输入期初欠款"
        step="0.01"
        min="0"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
               {errors.initialDebt ? 'border-red-500' : ''}"
      />
      {#if errors.initialDebt}
        <p class="text-red-500 text-sm mt-1">{errors.initialDebt}</p>
      {/if}
    </div>
  </div>

  <!-- 联系信息 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <h3 class="font-medium text-gray-900">联系信息</h3>
    
    <!-- 电话 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">电话</label>
      <input
        type="tel"
        on:input={formatPhoneInput}
        placeholder="请输入电话"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
               {errors.phone ? 'border-red-500' : ''}"
      />
      {#if errors.phone}
        <p class="text-red-500 text-sm mt-1">{errors.phone}</p>
      {/if}
    </div>

    <!-- 备用电话 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">备用电话</label>
      <input
        type="tel"
        bind:value={customer.backupPhone}
        placeholder="请输入备用电话"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <!-- 地址 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
      <textarea
        bind:value={customer.address}
        placeholder="请输入地址"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- 传真 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">传真</label>
      <input
        type="text"
        bind:value={customer.fax}
        placeholder="请输入传真"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <!-- 邮箱 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
      <input
        type="email"
        bind:value={customer.email}
        placeholder="请输入邮箱"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
               {errors.email ? 'border-red-500' : ''}"
      />
      {#if errors.email}
        <p class="text-red-500 text-sm mt-1">{errors.email}</p>
      {/if}
    </div>
  </div>

  <!-- 备注 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
    <textarea
      bind:value={customer.notes}
      placeholder="请输入备注信息"
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    ></textarea>
  </div>

  <!-- 保存按钮 -->
  <div class="flex space-x-3 pb-6">
    <button
      type="button"
      on:click={() => goto(`/mobile/customers/${customerId}`)}
      class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
    >
      取消
    </button>
    <button
      type="button"
      on:click={saveCustomer}
      disabled={isSubmitting}
      class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
    >
      {isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</div>

<!-- 客户分类选择器 -->
{#if showCategoryPicker}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
    <div class="bg-white w-full rounded-t-lg max-h-96 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">选择客户分类</h3>
          <button
            on:click={() => showCategoryPicker = false}
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
        <div class="space-y-2">
          {#each categories as category}
            <button
              on:click={() => selectCategory(category)}
              class="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors
                     {customer.category === category ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'border border-gray-200'}"
            >
              {category}
            </button>
          {/each}

          <button
            on:click={addNewCategory}
            class="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
          >
            + 添加新分类
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

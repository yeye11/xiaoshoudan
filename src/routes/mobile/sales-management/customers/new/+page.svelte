<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import { createEmptyCustomer } from '$lib/types/invoice';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { validators } from '$lib/utils/validation';
  import { useFormWithDuplicateCheck } from '$lib/composables/useForm';
  import { customerCategoryStore } from '$lib/stores/categoryStore';

  // 初始化表单
  const form = useFormWithDuplicateCheck({
    initialData: createEmptyCustomer(),
    validators: {
      name: validators.name
    },
    checkDuplicate: (name: string) => {
      return StorageManager.getCustomers().some(c => c.name === name.trim());
    },
    onSave: async (data) => {
      data.name = data.name.trim();
      data.updatedAt = new Date().toISOString();
      StorageManager.addCustomer(data);

      // 保存分类
      if (data.category && !$customerCategoryStore.includes(data.category)) {
        customerCategoryStore.add(data.category);
      }
    },
    onSuccess: () => {
      goto('/mobile/sales-management/customers');
    }
  });

  const { data, errors, isSubmitting } = form;

  onMount(() => {
    customerCategoryStore.load();
  });

  // 格式化电话号码输入
  const formatPhoneInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{4})/, '$1-$2');
    }

    input.value = value;
    $data.phone = value;
  };

  // 添加新分类
  const addNewCategory = () => {
    const newCategory = prompt('请输入新的客户分类:');
    if (newCategory && newCategory.trim()) {
      customerCategoryStore.add(newCategory.trim());
    }
  };
</script>

<MobileHeader
  title="新建客户"
  showBack={true}
  backgroundColor="bg-blue-500"
>
  <div slot="actions">
    <button
      on:click={() => form.handleSave()}
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

    <!-- 客户名称 -->
    <FormField
      label="客户名称"
      type="text"
      bind:value={$data.name}
      error={$errors.name}
      required
      placeholder="请输入客户名称"
    />

    <!-- 客户分类 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">客户分类</label>
      <div class="flex gap-2">
        <select
          bind:value={$data.category}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择分类</option>
          {#each $customerCategoryStore as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <button
          type="button"
          on:click={addNewCategory}
          class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>

    <!-- 期初欠款 -->
    <FormField
      label="期初欠款"
      type="number"
      bind:value={$data.initialDebt}
      error={$errors.initialDebt}
      placeholder="请输入期初欠款"
      min="0"
      step="0.01"
    />
  </div>

  <!-- 联系信息 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4">
    <h3 class="font-medium text-gray-900">联系信息</h3>

    <!-- 电话 -->
    <FormField
      label="电话"
      type="tel"
      bind:value={$data.phone}
      error={$errors.phone}
      placeholder="请输入电话"
      on:input={formatPhoneInput}
    />

    <!-- 备用电话 -->
    <FormField
      label="备用电话"
      type="tel"
      bind:value={$data.backupPhone}
      placeholder="请输入备用电话"
    />

    <!-- 地址 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
      <textarea
        bind:value={$data.address}
        placeholder="请输入地址"
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- 传真 -->
    <FormField
      label="传真"
      type="text"
      bind:value={$data.fax}
      placeholder="请输入传真"
    />

    <!-- 邮箱 -->
    <FormField
      label="邮箱"
      type="email"
      bind:value={$data.email}
      error={$errors.email}
      placeholder="请输入邮箱"
    />
  </div>

  <!-- 备注 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
    <textarea
      bind:value={$data.notes}
      placeholder="请输入备注信息"
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    ></textarea>
  </div>

  <!-- 保存按钮 -->
  <div class="flex space-x-3 pb-6">
    <button
      type="button"
      on:click={() => goto('/mobile/sales-management/customers')}
      class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
    >
      取消
    </button>
    <button
      type="button"
      on:click={() => form.handleSave()}
      disabled={$isSubmitting}
      class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
    >
      {$isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</div>

<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { Invoice, Customer } from '$lib/types/invoice.ts';
  import { createEmptyInvoice, calculateTotalAmount } from '$lib/types/invoice.ts';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { validators } from '$lib/utils/validation';
  import { useForm } from '$lib/composables/useForm';
  import { saveCustomerOrderHistory } from '$lib/utils/customerHistory';

  let invoiceId: string = '';
  let initialInvoice: Invoice;
  let customers: Customer[] = [];
  let showCustomerPicker = false;
  let fromPage: string | null = null; // 记录来源页面
  let returnCustomerId: string | null = null; // 记录返回的客户ID

  // 初始化表单
  const form = useForm({
    initialData: createEmptyInvoice({
      name: '公司名称',
      address: '公司地址',
      phone: '公司电话'
    }),
    validators: {
      customerName: validators.name
    },
    onSave: async (data) => {
      data.customerInfo.name = data.customerInfo.name.trim();
      data.updatedAt = new Date().toISOString();

      // 保存客户购买历史
      if (data.customerId && data.items && data.items.length > 0) {
        // 过滤出有 productId 的项目
        const itemsWithProductId = data.items
          .filter(item => item.productId)
          .map(item => ({
            productId: item.productId!,
            unitPrice: item.unitPrice,
            unit: item.unit,
            specification: item.specification,
            quantity: item.quantity
          }));

        if (itemsWithProductId.length > 0) {
          saveCustomerOrderHistory(data.customerId, itemsWithProductId);
          console.log('💾 已更新客户购买历史:', data.customerInfo.name, itemsWithProductId.length, '个产品');
        }
      }

      StorageManager.updateInvoice(data.id, data);
    },
    onSuccess: (data) => {
      // 如果是从客户详情页面来的，返回到销售单详情页面并传递 from 参数
      if (fromPage === 'customer' && returnCustomerId) {
        goto(`/mobile/sales/${data.id}?from=customer&customerId=${returnCustomerId}`);
      } else {
        goto('/mobile/sales');
      }
    }
  });

  // 解构 form 的 stores
  const { data, errors, isSubmitting } = form;

  const handleRemoveItem = (index: number) => {
    $data.items.splice(index, 1);
    $data.items = $data.items; // 触发响应式更新
    $data.totalAmount = calculateTotalAmount($data.items);
  };

  const handleSelectCustomer = (customer: Customer) => {
    $data.customerId = customer.id;
    $data.customerInfo = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      email: customer.email || ''
    };
    showCustomerPicker = false;
  };

  const handleSelectProducts = () => {
    // 将当前已有的产品保存到 sessionStorage，以便在产品选择页面预加载
    if ($data.items.length > 0) {
      sessionStorage.setItem('selectedProducts', JSON.stringify($data.items));
    }

    // 导航到产品选择页面
    const customerId = $data.customerId || '';
    goto(`/mobile/products/select?customerId=${customerId}&returnTo=edit&invoiceId=${invoiceId}`);
  };

  onMount(async () => {
    invoiceId = $page.params.id || '';

    // 检查 URL 参数，判断是否从客户详情页面来的
    fromPage = $page.url.searchParams.get('from');
    returnCustomerId = $page.url.searchParams.get('customerId');

    try {
      const invoice = StorageManager.getInvoice(invoiceId);
      if (invoice) {
        initialInvoice = invoice;
        data.set(invoice);

        // 如果没有从 URL 获取 customerId，使用销售单的 customerId
        if (!returnCustomerId && invoice.customerId) {
          returnCustomerId = invoice.customerId;
        }
      } else {
        form.setFieldError('general', '销售单不存在');
      }

      // 加载所有客户
      customers = StorageManager.getCustomers();
    } catch (error) {
      console.error('加载销售单失败:', error);
      form.setFieldError('general', '加载销售单信息失败');
    }

    // 检查 sessionStorage 中是否有选中的产品
    const selectedProducts = sessionStorage.getItem('selectedProducts');
    if (selectedProducts) {
      try {
        const items = JSON.parse(selectedProducts);
        if (items.length > 0) {
          $data.items = items;
          $data.totalAmount = calculateTotalAmount(items);
          // 清除 sessionStorage
          sessionStorage.removeItem('selectedProducts');
        }
      } catch (e) {
        console.error('加载选中产品失败:', e);
      }
    }
  });
</script>

<MobileHeader 
  title="编辑销售单" 
  showBack={true}
  backgroundColor="bg-purple-500"
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

    <!-- 销售单号 -->
    <FormField
      label="销售单号"
      type="text"
      bind:value={$data.invoiceNumber}
      placeholder="自动生成"
      readonly
    />

    <!-- 客户选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">选择客户</label>
      <button
        type="button"
        on:click={() => (showCustomerPicker = !showCustomerPicker)}
        class="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
      >
        {$data.customerId ? '更换客户' : '选择客户'}
      </button>

      {#if showCustomerPicker}
        <div class="mt-2 border border-gray-300 rounded-lg bg-white max-h-64 overflow-y-auto">
          {#if customers.length === 0}
            <div class="p-4 text-center text-gray-500">
              暂无客户数据
            </div>
          {:else}
            {#each customers as customer}
              <button
                type="button"
                on:click={() => handleSelectCustomer(customer)}
                class="w-full text-left p-3 border-b border-gray-200 hover:bg-blue-50 transition-colors last:border-b-0"
              >
                <div class="font-medium text-gray-900">{customer.name}</div>
                <div class="text-sm text-gray-500">{customer.phone}</div>
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- 客户名称（只读，从选择的客户自动填充） -->
    <FormField
      label="客户名称"
      type="text"
      bind:value={$data.customerInfo.name}
      error={$errors.customerName}
      required
      placeholder="请选择客户或输入客户名称"
    />

    <!-- 销售日期 -->
    <FormField
      label="销售日期"
      type="date"
      bind:value={$data.date}
      error={$errors.date}
    />
  </div>

  <!-- 产品项目 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-medium text-gray-900">产品项目</h3>
      <button
        type="button"
        on:click={handleSelectProducts}
        class="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
      >
        + 选择产品
      </button>
    </div>

    <!-- 产品列表 -->
    {#if $data.items.length === 0}
      <div class="text-center text-gray-500 py-8">
        <p>暂无产品项目</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-3">
        {#each $data.items as item, index (item.id)}
          <div class="border border-gray-200 rounded-lg p-3 space-y-1">
            <!-- 第一行：产品名 + 规格 + 删除按钮 -->
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm flex-1">
                <span class="font-medium text-gray-900">{item.productName}</span>
                <span class="text-gray-600 ml-2">规格: {item.specification || '-'}</span>
              </div>
              <button
                type="button"
                on:click={() => handleRemoveItem(index)}
                class="text-red-500 text-xs hover:text-red-700 whitespace-nowrap"
              >
                删除
              </button>
            </div>
            <!-- 第二行：数量 + 单价 + 金额 -->
            <div class="flex justify-between text-sm text-gray-600">
              <span>{item.quantity}{item.unit}</span>
              <span class="text-gray-900 font-medium">单价: {item.unitPrice.toFixed(2)}, 金额: {item.amount.toFixed(2)}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 销售金额统计 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-gray-600">销售总额</span>
      <span class="text-lg font-bold text-purple-600">{$data.totalAmount.toFixed(2)}</span>
    </div>

    <!-- 已收金额 -->
    <FormField
      label="已收金额"
      type="number"
      bind:value={$data.paidAmount}
      error={$errors.paidAmount}
      placeholder="请输入已收金额"
      min="0"
      step="0.01"
    />

    <div class="flex items-center justify-between pt-2 border-t">
      <span class="text-gray-600">欠款金额</span>
      <span class="text-lg font-bold text-red-600">{Math.max(0, $data.totalAmount - $data.paidAmount).toFixed(2)}</span>
    </div>
  </div>

  <!-- 备注 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
    <textarea
      bind:value={$data.notes}
      placeholder="请输入备注信息"
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
    ></textarea>
  </div>

  <!-- 保存按钮 -->
  <div class="flex space-x-3 pb-6">
    <button
      type="button"
      on:click={() => goto('/mobile/sales')}
      class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
    >
      取消
    </button>
    <button
      type="button"
      on:click={() => form.handleSave()}
      disabled={$isSubmitting}
      class="flex-1 bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
    >
      {$isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</div>

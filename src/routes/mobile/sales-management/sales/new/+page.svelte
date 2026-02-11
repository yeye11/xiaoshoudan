<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { Customer, InvoiceItem } from '$lib/types/invoice.ts';
  import { createEmptyInvoice, calculateTotalAmount } from '$lib/types/invoice.ts';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { useForm } from '$lib/composables/useForm';
  import { saveCustomerOrderHistory } from '$lib/utils/customerHistory';

  type UserProfile = {
    name?: string;
    company?: string;
    companies?: string[];
    address?: string;
    addresses?: string[];
    phone?: string;
  };

  const LAST_SELECTED_SALES_COMPANY_KEY = 'last_selected_sales_company';
  const LAST_SELECTED_SALES_ADDRESS_KEY = 'last_selected_sales_address';
  const COMPANY_NAME_PLACEHOLDERS = ['公司名称'];
  const COMPANY_ADDRESS_PLACEHOLDERS = ['公司地址'];
  const COMPANY_PHONE_PLACEHOLDERS = ['公司电话'];

  const normalizeAddressList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length > 0);
    }

    if (typeof value === 'string') {
      return value
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  };

  const normalizeAddressOptions = (profile: UserProfile): string[] => {
    const fromAddresses = normalizeAddressList(profile.addresses);
    const fromAddress = normalizeAddressList(profile.address);
    return [...new Set([...fromAddresses, ...fromAddress])];
  };

  const normalizeCompanyOptions = (profile: UserProfile): string[] => {
    const fromCompanies = normalizeAddressList(profile.companies);
    const fromCompany = normalizeAddressList(profile.company);
    return [...new Set([...fromCompanies, ...fromCompany])];
  };

  const isMeaningfulText = (value: unknown, placeholders: string[] = []) => {
    const text = String(value ?? '').trim();
    return text.length > 0 && !placeholders.includes(text);
  };

  const readLastSelectedSalesAddress = (): string => {
    try {
      return String(localStorage.getItem(LAST_SELECTED_SALES_ADDRESS_KEY) ?? '').trim();
    } catch {
      return '';
    }
  };

  const readLastSelectedSalesCompany = (): string => {
    try {
      return String(localStorage.getItem(LAST_SELECTED_SALES_COMPANY_KEY) ?? '').trim();
    } catch {
      return '';
    }
  };

  const saveLastSelectedSalesAddress = (address: string) => {
    const normalized = String(address ?? '').trim();
    if (!normalized) return;
    try {
      localStorage.setItem(LAST_SELECTED_SALES_ADDRESS_KEY, normalized);
    } catch (error) {
      console.warn('保存上次选择地址失败:', error);
    }
  };

  const saveLastSelectedSalesCompany = (company: string) => {
    const normalized = String(company ?? '').trim();
    if (!normalized) return;
    try {
      localStorage.setItem(LAST_SELECTED_SALES_COMPANY_KEY, normalized);
    } catch (error) {
      console.warn('保存上次选择公司失败:', error);
    }
  };

  let selectedCustomer: Customer | null = null;
  let customers: Customer[] = [];
  let showCustomerPicker = false;
  let showCompanyPicker = false;
  let showAddressPicker = false;
  let fromPage: string | null = null; // 记录来源页面
  let userProfile: UserProfile = {};
  let companyOptions: string[] = [];
  let companyAddressOptions: string[] = [];

  const ensureCompanyOptionExists = (company: string) => {
    const normalized = String(company ?? '').trim();
    if (!normalized) return;
    if (!companyOptions.includes(normalized)) {
      companyOptions = [normalized, ...companyOptions];
    }
  };

  const ensureAddressOptionExists = (address: string) => {
    const normalized = String(address ?? '').trim();
    if (!normalized) return;
    if (!companyAddressOptions.includes(normalized)) {
      companyAddressOptions = [normalized, ...companyAddressOptions];
    }
  };

  const resolveDefaultCompany = (currentCompany: string) => {
    if (isMeaningfulText(currentCompany, COMPANY_NAME_PLACEHOLDERS)) {
      return currentCompany;
    }

    const lastSelectedCompany = readLastSelectedSalesCompany();
    if (lastSelectedCompany && companyOptions.includes(lastSelectedCompany)) {
      return lastSelectedCompany;
    }

    return companyOptions[0] || '';
  };

  const resolveDefaultAddress = (currentAddress: string) => {
    if (isMeaningfulText(currentAddress, COMPANY_ADDRESS_PLACEHOLDERS)) {
      return currentAddress;
    }

    const lastSelectedAddress = readLastSelectedSalesAddress();
    if (lastSelectedAddress && companyAddressOptions.includes(lastSelectedAddress)) {
      return lastSelectedAddress;
    }

    return companyAddressOptions[0] || '';
  };

  const buildInvoiceCompanyInfo = (companyInfo: { name?: string; address?: string; phone?: string }) => {
    const currentName = String(companyInfo?.name ?? '').trim();
    const currentPhone = String(companyInfo?.phone ?? '').trim();
    const currentAddress = String(companyInfo?.address ?? '').trim();

    const profilePhone = String(userProfile.phone ?? '').trim();
    const resolvedCompany = resolveDefaultCompany(currentName);
    const resolvedAddress = resolveDefaultAddress(currentAddress);

    ensureCompanyOptionExists(resolvedCompany);
    ensureAddressOptionExists(resolvedAddress);

    return {
      name: resolvedCompany,
      phone: isMeaningfulText(currentPhone, COMPANY_PHONE_PLACEHOLDERS) ? currentPhone : profilePhone,
      address: resolvedAddress
    };
  };

  const handleCompanyNameChange = () => {
    const company = String($data.companyInfo?.name ?? '').trim();
    if (!company) return;
    ensureCompanyOptionExists(company);
    saveLastSelectedSalesCompany(company);
  };

  const toggleCompanyPicker = () => {
    showCompanyPicker = !showCompanyPicker;
    if (showCompanyPicker) {
      showAddressPicker = false;
      showCustomerPicker = false;
    }
  };

  const toggleAddressPicker = () => {
    showAddressPicker = !showAddressPicker;
    if (showAddressPicker) {
      showCompanyPicker = false;
      showCustomerPicker = false;
    }
  };

  const handleSelectCompanyOption = (company: string) => {
    $data.companyInfo.name = company;
    handleCompanyNameChange();
    showCompanyPicker = false;
  };

  const handleSelectAddressOption = (address: string) => {
    $data.companyInfo.address = address;
    handleCompanyAddressChange();
    showAddressPicker = false;
  };

  const handleCompanyAddressChange = () => {
    const address = String($data.companyInfo?.address ?? '').trim();
    if (!address) return;
    ensureAddressOptionExists(address);
    saveLastSelectedSalesAddress(address);
  };

  // 初始化表单
  const form = useForm({
    initialData: createEmptyInvoice({
      name: '公司名称',
      address: '公司地址',
      phone: '公司电话'
    }),
    validators: {},
    onSave: async (data) => {
      data.updatedAt = new Date().toISOString();
      data.companyInfo = buildInvoiceCompanyInfo(data.companyInfo || {});

      if (!String(data.createdBy || '').trim()) {
        data.createdBy = String(userProfile.name ?? '').trim();
      }

      if (data.companyInfo.address) {
        saveLastSelectedSalesAddress(data.companyInfo.address);
      }
      if (data.companyInfo.name) {
        saveLastSelectedSalesCompany(data.companyInfo.name);
      }

      // 如果选择了客户，更新客户ID和客户信息
      if (selectedCustomer) {
        data.customerId = selectedCustomer.id;
        data.customerInfo = {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address || ''
        };

        // 保存客户购买历史
        if (data.items && data.items.length > 0) {
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
            saveCustomerOrderHistory(selectedCustomer.id, itemsWithProductId);
            console.log('💾 已保存客户购买历史:', selectedCustomer.name, itemsWithProductId.length, '个产品');
          }
        }
      }

      StorageManager.addInvoice(data);
    },
    onSuccess: (data) => {
      // 如果是从客户详情页面来的，返回到销售单详情页面并传递 from 参数
      if (fromPage === 'customer' && selectedCustomer) {
        goto(`/mobile/sales-management/sales/${data.id}?from=customer&customerId=${selectedCustomer.id}`);
      } else {
        goto('/mobile/sales');
      }
    }
  });

  const { data, errors, isSubmitting } = form;

  onMount(() => {
    userProfile = StorageManager.getUserInfo() || {};
    companyOptions = normalizeCompanyOptions(userProfile);
    companyAddressOptions = normalizeAddressOptions(userProfile);
    $data.companyInfo = buildInvoiceCompanyInfo($data.companyInfo || {});

    if (!String($data.createdBy || '').trim()) {
      $data.createdBy = String(userProfile.name ?? '').trim();
    }

    // 设置默认日期为今天（使用本地时间）
    const now = new Date();
    const today = now.getFullYear() + '-' +
                  String(now.getMonth() + 1).padStart(2, '0') + '-' +
                  String(now.getDate()).padStart(2, '0');
    $data.date = today;

    // 加载所有客户
    customers = StorageManager.getCustomers();

    // 检查URL参数中是否有customerId
    const customerId = $page.url.searchParams.get('customerId');
    if (customerId) {
      // 标记来源为客户详情页面
      fromPage = 'customer';

      const customer = StorageManager.getCustomer(customerId);
      if (customer) {
        selectedCustomer = customer;
        $data.customerId = customer.id;
        $data.customerInfo = {
          name: customer.name,
          phone: customer.phone,
          address: customer.address || ''
        };
      }
    }

    // 检查 sessionStorage 中是否有选中的产品
    const selectedProducts = sessionStorage.getItem('selectedProducts');
    if (selectedProducts) {
      try {
        const items: InvoiceItem[] = JSON.parse(selectedProducts);
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

  const handleSelectProducts = () => {
    // 将当前已有的产品保存到 sessionStorage，以便在产品选择页面预加载
    if ($data.items.length > 0) {
      sessionStorage.setItem('selectedProducts', JSON.stringify($data.items));
    }

    // 导航到产品选择页面
    const customerId = selectedCustomer?.id || '';
    goto(`/mobile/sales-management/products/select?customerId=${customerId}`);
  };

  const handleRemoveItem = (index: number) => {
    $data.items.splice(index, 1);
    $data.items = $data.items; // 触发响应式更新
    $data.totalAmount = calculateTotalAmount($data.items);
  };

  const handleSelectCustomer = (customer: Customer) => {
    selectedCustomer = customer;
    $data.customerId = customer.id;
    $data.customerInfo = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address || ''
    };
    showCustomerPicker = false;
    showCompanyPicker = false;
    showAddressPicker = false;
  };

  const handleClearCustomer = () => {
    selectedCustomer = null;
    $data.customerId = '';
    $data.customerInfo = { name: '', phone: '', address: '' };
  };
</script>

<MobileHeader 
  title="新建销售单" 
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

    <!-- 客户选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">选择客户</label>
      <button
        type="button"
        on:click={() => (showCustomerPicker = !showCustomerPicker)}
        class="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
      >
        {selectedCustomer ? '更换客户' : '选择客户'}
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

    <!-- 销售公司（大按钮选择） -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">销售公司</label>
      <button
        type="button"
        on:click={toggleCompanyPicker}
        class="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
      >
        {$data.companyInfo.name || '请选择销售公司'}
      </button>

      {#if showCompanyPicker}
        <div class="mt-2 border border-gray-300 rounded-lg bg-white max-h-64 overflow-y-auto">
          {#if companyOptions.length === 0}
            <div class="p-4 text-center text-gray-500">
              请先在“我的资料”添加公司
            </div>
          {:else}
            {#each companyOptions as company}
              <button
                type="button"
                on:click={() => handleSelectCompanyOption(company)}
                class="w-full text-left p-3 border-b border-gray-200 hover:bg-blue-50 transition-colors last:border-b-0 {company === $data.companyInfo.name ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <div class="font-medium">{company}</div>
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- 销售地址（大按钮选择） -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">销售地址</label>
      <button
        type="button"
        on:click={toggleAddressPicker}
        class="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
      >
        {$data.companyInfo.address || '请选择销售地址'}
      </button>

      {#if showAddressPicker}
        <div class="mt-2 border border-gray-300 rounded-lg bg-white max-h-64 overflow-y-auto">
          {#if companyAddressOptions.length === 0}
            <div class="p-4 text-center text-gray-500">
              请先在“我的资料”添加地址
            </div>
          {:else}
            {#each companyAddressOptions as address}
              <button
                type="button"
                on:click={() => handleSelectAddressOption(address)}
                class="w-full text-left p-3 border-b border-gray-200 hover:bg-blue-50 transition-colors last:border-b-0 {address === $data.companyInfo.address ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <div class="text-sm break-all">{address}</div>
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

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

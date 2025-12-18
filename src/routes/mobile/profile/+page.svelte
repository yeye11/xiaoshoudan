<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import { onMount } from 'svelte';
  import { StorageManager } from '$lib/utils/storage';
  import { validators, validateForm, hasErrors } from '$lib/utils/validation';

  // 用户信息
  let userInfo = {
    name: '张总',
    company: '佛山市仁腾装饰材料有限公司',
    phone: '18575852698',
    address: '',
    email: '',
    avatar: ''
  };

  // 应用设置
  let settings = {
    autoSave: true,
    notifications: true,
    darkMode: false,
    language: 'zh-CN'
  };

  // 数据统计
  let dataStats = {
    customers: 0,
    products: 0,
    invoices: 0,
    dataSize: '0 KB'
  };

  // 编辑界面状态与表单
  let showEdit = false;
  let editForm: typeof userInfo = { ...userInfo };
  let editErrors: Record<string, string> = {};

  const openEdit = () => {
    editForm = { ...userInfo };
    editErrors = {};
    showEdit = true;
  };

  const closeEdit = () => {
    showEdit = false;
  };

  const onAvatarChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        editForm.avatar = String(reader.result || '');
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const validateEdit = () => {
    editErrors = validateForm(editForm, {
      name: validators.name,
      phone: validators.phone
    });
    return !hasErrors(editErrors);
  };

  const saveEdit = () => {
    if (!validateEdit()) return;
    userInfo = { ...userInfo, ...editForm };
    StorageManager.saveUserInfo(userInfo);
    showEdit = false;
  };

  onMount(() => {
    userInfo = { ...userInfo, ...StorageManager.getUserInfo() };
    settings = { ...settings, ...StorageManager.getSettings() };
    calculateDataStats();
  });

  const calculateDataStats = () => {
    const customers = StorageManager.getCustomers();
    const products = StorageManager.getProducts();
    const invoices = StorageManager.getInvoices();

    dataStats.customers = customers.length;
    dataStats.products = products.length;
    dataStats.invoices = invoices.length;

    const allData = { customers, products, invoices, userInfo, settings };
    const dataSize = new Blob([JSON.stringify(allData)]).size;
    dataStats.dataSize = formatFileSize(dataSize);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 导出数据
  const exportData = async () => {
    try {
      console.log('📊 开始导出数据...');

      const allData = {
        customers: StorageManager.getCustomers(),
        products: StorageManager.getProducts(),
        invoices: StorageManager.getInvoices(),
        quotations: StorageManager.getQuotations(),
        customerHistory: JSON.parse(localStorage.getItem('customer_product_history') || '[]'),
        globalTags: JSON.parse(localStorage.getItem('global_tags') || '[]'),
        globalSpecifications: JSON.parse(localStorage.getItem('global_specifications') || '[]'),
        customerCategories: StorageManager.getCustomerCategories(),
        productCategories: StorageManager.getProductCategories(),
        productUnits: JSON.parse(localStorage.getItem('product_units') || '[]'),
        userInfo,
        settings,
        exportTime: new Date().toISOString(),
        version: '1.0.0'
      };

      const { exportJsonData } = await import('$lib/utils/jsonExport');
      const fileName = `cypridina-data-${new Date().toISOString().split('T')[0]}`;

      await exportJsonData(allData, fileName);
      console.log('✅ 数据导出成功！');
    } catch (error) {
      console.error('❌ 导出数据失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 导入数据
  let fileInput: HTMLInputElement;

  const triggerImport = () => {
    fileInput?.click();
  };

  const handleImport = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // 验证数据格式
      if (!importedData.customers || !importedData.products || !importedData.invoices) {
        alert('数据格式不正确，请选择有效的导出文件');
        return;
      }

      // 询问导入方式
      const mode = confirm(
        '选择导入方式：\n\n' +
        '【确定】= 合并模式（保留现有数据，添加新数据）\n' +
        '【取消】= 覆盖模式（清除现有数据，完全替换）'
      );

      if (mode) {
        // 合并模式
        mergeImportData(importedData);
      } else {
        // 覆盖模式
        const confirmOverwrite = confirm(
          '⚠️ 警告：覆盖模式将删除所有现有数据！\n\n' +
          '确定要继续吗？此操作不可恢复！'
        );

        if (confirmOverwrite) {
          overwriteImportData(importedData);
        } else {
          return;
        }
      }

      // 重新加载数据
      userInfo = { ...userInfo, ...StorageManager.getUserInfo() };
      settings = { ...settings, ...StorageManager.getSettings() };
      calculateDataStats();

      alert('数据导入成功！');

      // 清空文件选择
      input.value = '';
    } catch (error) {
      console.error('导入数据失败:', error);
      alert('导入失败：文件格式错误或数据损坏');
      input.value = '';
    }
  };

  // 合并导入数据
  const mergeImportData = (importedData: any) => {
    try {
      // 合并客户数据
      const existingCustomers = StorageManager.getCustomers();
      const mergedCustomers = [...existingCustomers];

      importedData.customers.forEach((newCustomer: any) => {
        const exists = mergedCustomers.find(c => c.id === newCustomer.id);
        if (!exists) {
          mergedCustomers.push(newCustomer);
        }
      });
      StorageManager.saveCustomers(mergedCustomers);

      // 合并产品数据
      const existingProducts = StorageManager.getProducts();
      const mergedProducts = [...existingProducts];

      importedData.products.forEach((newProduct: any) => {
        const exists = mergedProducts.find(p => p.id === newProduct.id);
        if (!exists) {
          mergedProducts.push(newProduct);
        }
      });
      StorageManager.saveProducts(mergedProducts);

      // 合并销售单数据
      const existingInvoices = StorageManager.getInvoices();
      const mergedInvoices = [...existingInvoices];

      importedData.invoices.forEach((newInvoice: any) => {
        const exists = mergedInvoices.find(i => i.id === newInvoice.id);
        if (!exists) {
          mergedInvoices.push(newInvoice);
        }
      });
      StorageManager.saveInvoices(mergedInvoices);

      // 合并报价单数据
      if (importedData.quotations && importedData.quotations.length > 0) {
        const existingQuotations = StorageManager.getQuotations();
        const mergedQuotations = [...existingQuotations];

        importedData.quotations.forEach((newQuotation: any) => {
          const exists = mergedQuotations.find(q => q.id === newQuotation.id);
          if (!exists) {
            mergedQuotations.push(newQuotation);
          }
        });
        StorageManager.saveQuotations(mergedQuotations);
      }

      // 合并其他数据
      if (importedData.customerHistory) {
        const existingHistory = JSON.parse(localStorage.getItem('customer_product_history') || '[]');
        const mergedHistory = [...existingHistory];

        importedData.customerHistory.forEach((newHistory: any) => {
          const exists = mergedHistory.find(h =>
            h.customerId === newHistory.customerId && h.productId === newHistory.productId
          );
          if (!exists) {
            mergedHistory.push(newHistory);
          }
        });
        localStorage.setItem('customer_product_history', JSON.stringify(mergedHistory));
      }

      // 合并全局标签和规格
      if (importedData.globalTags) {
        const existingTags = JSON.parse(localStorage.getItem('global_tags') || '[]');
        const mergedTags = [...new Set([...existingTags, ...importedData.globalTags])];
        localStorage.setItem('global_tags', JSON.stringify(mergedTags));
      }

      if (importedData.globalSpecifications) {
        const existingSpecs = JSON.parse(localStorage.getItem('global_specifications') || '[]');
        const mergedSpecs = [...new Set([...existingSpecs, ...importedData.globalSpecifications])];
        localStorage.setItem('global_specifications', JSON.stringify(mergedSpecs));
      }

      console.log('✅ 数据合并完成');
    } catch (error) {
      console.error('合并数据失败:', error);
      throw error;
    }
  };

  // 覆盖导入数据
  const overwriteImportData = (importedData: any) => {
    try {
      // 直接覆盖所有数据
      localStorage.setItem('customers', JSON.stringify(importedData.customers || []));
      localStorage.setItem('products', JSON.stringify(importedData.products || []));
      localStorage.setItem('invoice_history', JSON.stringify(importedData.invoices || []));
      localStorage.setItem('quotations', JSON.stringify(importedData.quotations || []));

      if (importedData.customerHistory) {
        localStorage.setItem('customer_product_history', JSON.stringify(importedData.customerHistory));
      }

      if (importedData.globalTags) {
        localStorage.setItem('global_tags', JSON.stringify(importedData.globalTags));
      }

      if (importedData.globalSpecifications) {
        localStorage.setItem('global_specifications', JSON.stringify(importedData.globalSpecifications));
      }

      if (importedData.customerCategories) {
        localStorage.setItem('customer_categories', JSON.stringify(importedData.customerCategories));
      }

      if (importedData.productCategories) {
        localStorage.setItem('product_categories', JSON.stringify(importedData.productCategories));
      }

      if (importedData.productUnits) {
        localStorage.setItem('product_units', JSON.stringify(importedData.productUnits));
      }

      // 可选：导入用户信息和设置
      if (importedData.userInfo) {
        StorageManager.saveUserInfo(importedData.userInfo);
      }

      if (importedData.settings) {
        StorageManager.saveSettings(importedData.settings);
      }

      console.log('✅ 数据覆盖完成');
    } catch (error) {
      console.error('覆盖数据失败:', error);
      throw error;
    }
  };

  // 清除数据
  const clearData = () => {
    const confirmed = confirm('确定要清除所有数据吗？此操作不可恢复！');
    if (confirmed) {
      const secondConfirm = confirm('请再次确认：这将删除所有客户、产品和销售单数据！');
      if (secondConfirm) {
        StorageManager.clearAllData();
        calculateDataStats();
        alert('数据已清除');
      }
    }
  };

  // 切换设置
  const toggleSetting = (key: keyof typeof settings) => {
    settings[key] = !settings[key];
    StorageManager.saveSettings(settings);
  };
</script>

<MobileHeader
  title="我的"
  showBack={true}
  backgroundColor="bg-purple-500"
/>

<div class="p-4 space-y-6">
  <!-- 用户信息 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <div class="flex items-center space-x-4 mb-4">
      <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-medium text-gray-900">{userInfo.name}</h3>
        <p class="text-sm text-gray-600">{userInfo.company}</p>
        {#if userInfo.address}
          <p class="text-sm text-gray-600">{userInfo.address}</p>
        {/if}
        <p class="text-sm text-gray-600">{userInfo.phone}</p>
      </div>
    </div>

    <button on:click={openEdit} class="w-full bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors">
      编辑资料
    </button>
  </div>

  <!-- 数据统计 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">数据统计</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-lg font-bold text-blue-600">{dataStats.customers}</div>
        <div class="text-sm text-gray-500">客户</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-orange-600">{dataStats.products}</div>
        <div class="text-sm text-gray-500">产品</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-green-600">{dataStats.invoices}</div>
        <div class="text-sm text-gray-500">销售单</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-purple-600">{dataStats.dataSize}</div>
        <div class="text-sm text-gray-500">数据大小</div>
      </div>
    </div>
  </div>

  <!-- 应用设置 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">应用设置</h3>

    <!-- 标签和规格管理入口 -->
    <div class="mb-4 pb-4 border-b border-gray-200">
      <a
        href="/mobile/settings/tags-specs"
        class="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          <div>
            <div class="font-medium text-gray-900">标签和规格管理</div>
            <div class="text-xs text-gray-600">管理全局标签和规格</div>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </a>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium text-gray-900">自动保存</div>
          <div class="text-sm text-gray-500">自动保存表单数据</div>
        </div>
        <button
          on:click={() => toggleSetting('autoSave')}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                 {settings.autoSave ? 'bg-purple-500' : 'bg-gray-200'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                   {settings.autoSave ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium text-gray-900">消息通知</div>
          <div class="text-sm text-gray-500">接收应用通知</div>
        </div>
        <button
          on:click={() => toggleSetting('notifications')}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                 {settings.notifications ? 'bg-purple-500' : 'bg-gray-200'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                   {settings.notifications ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium text-gray-900">深色模式</div>
          <div class="text-sm text-gray-500">使用深色主题</div>
        </div>
        <button
          on:click={() => toggleSetting('darkMode')}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                 {settings.darkMode ? 'bg-purple-500' : 'bg-gray-200'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                   {settings.darkMode ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
    </div>
  </div>

  <!-- 数据管理 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">数据管理</h3>
    <div class="space-y-3">
      <!-- 隐藏的文件选择器 -->
      <input
        type="file"
        accept=".json"
        bind:this={fileInput}
        on:change={handleImport}
        class="hidden"
      />

      <button
        on:click={triggerImport}
        class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <span>导入数据</span>
      </button>

      <button
        on:click={exportData}
        class="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>导出数据</span>
      </button>

      <button
        on:click={clearData}
        class="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        <span>清除数据</span>
      </button>
    </div>
  </div>

  <!-- 关于应用 -->
  <div class="bg-white rounded-lg p-4 shadow-sm border">
    <h3 class="font-medium text-gray-900 mb-4">关于应用</h3>
    <div class="space-y-3 text-sm text-gray-600">
      <div class="flex justify-between">
        <span>应用名称</span>
        <span>Cypridina Client</span>
      </div>
      <div class="flex justify-between">
        <span>版本号</span>
        <span>v1.0.0</span>
      </div>
      <div class="flex justify-between">
        <span>构建时间</span>
        <span>2025-10-14</span>
      </div>
      <div class="flex justify-between">
        <span>技术栈</span>
        <span>SvelteKit + Tauri</span>
      </div>
    </div>
  </div>
</div>

{#if showEdit}
  <div class="fixed inset-0 z-[60] flex items-end md:items-center md:justify-center">
    <div class="absolute inset-0 bg-black/40" role="button" tabindex="0" aria-label="关闭编辑" on:click={closeEdit} on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (e.preventDefault(), closeEdit())}></div>

    <div class="relative w-full md:w-[480px] bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 max-h-[85vh] overflow-auto">
      <div class="h-1.5 w-12 bg-gray-300 rounded-full mx-auto md:hidden mb-2"></div>
      <h3 class="text-base font-medium text-gray-900 mb-4">编辑资料</h3>

      <div class="space-y-4">
        <!-- 头像 -->
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {#if editForm.avatar}
              <img src={editForm.avatar} alt="avatar" class="w-full h-full object-cover" />
            {:else}
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            {/if}
          </div>
          <label class="text-sm font-medium text-purple-600">
            <input type="file" accept="image/*" class="hidden" on:change={onAvatarChange} />
            更换头像
          </label>
        </div>

        <!-- 姓名 -->
        <div>
          <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">姓名 <span class="text-red-500">*</span></label>
          <input id="edit-name"
            type="text"
            bind:value={editForm.name}
            placeholder="请输入姓名"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent {editErrors.name ? 'border-red-500' : ''}"
          />
          {#if editErrors.name}
            <p class="text-red-500 text-sm mt-1">{editErrors.name}</p>
          {/if}
        </div>

        <!-- 公司 -->
        <div>
          <label for="edit-company" class="block text-sm font-medium text-gray-700 mb-1">公司</label>
          <input id="edit-company"
            type="text"
            bind:value={editForm.company}
            placeholder="请输入公司名称"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <!-- 地址 -->
        <div>
          <label for="edit-address" class="block text-sm font-medium text-gray-700 mb-1">地址</label>
          <input id="edit-address"
            type="text"
            bind:value={editForm.address}
            placeholder="请输入公司地址"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <!-- 电话 -->
        <div>
          <label for="edit-phone" class="block text-sm font-medium text-gray-700 mb-1">电话</label>
          <input id="edit-phone"
            type="tel"
            bind:value={editForm.phone}
            placeholder="请输入电话号码"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent {editErrors.phone ? 'border-red-500' : ''}"
          />
          {#if editErrors.phone}
            <p class="text-red-500 text-sm mt-1">{editErrors.phone}</p>
          {/if}
        </div>

        <!-- 邮箱 -->
        <div>
          <label for="edit-email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input id="edit-email"
            type="email"
            bind:value={editForm.email}
            placeholder="请输入邮箱（可选）"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="grid grid-cols-2 gap-3 mt-5">
        <button on:click={closeEdit} class="py-2 rounded-lg border border-gray-300 text-gray-700">取消</button>
        <button on:click={saveEdit} class="py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600">保存</button>
      </div>
    </div>
  </div>
{/if}


<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import { onMount } from 'svelte';

  // 用户信息
  let userInfo = {
    name: '张总',
    company: '佛山市仁腾装饰材料有限公司',
    phone: '18575852698',
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

  onMount(() => {
    loadUserInfo();
    loadSettings();
    calculateDataStats();
  });

  const loadUserInfo = () => {
    try {
      const stored = localStorage.getItem('user_info');
      if (stored) {
        userInfo = { ...userInfo, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const saveUserInfo = () => {
    try {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const calculateDataStats = () => {
    try {
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const invoices = JSON.parse(localStorage.getItem('invoice_history') || '[]');

      dataStats.customers = customers.length;
      dataStats.products = products.length;
      dataStats.invoices = invoices.length;

      // 计算数据大小
      const allData = {
        customers,
        products,
        invoices,
        userInfo,
        settings
      };
      const dataSize = new Blob([JSON.stringify(allData)]).size;
      dataStats.dataSize = formatFileSize(dataSize);
    } catch (error) {
      console.error('计算数据统计失败:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 导出数据
  const exportData = () => {
    try {
      const allData = {
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        invoices: JSON.parse(localStorage.getItem('invoice_history') || '[]'),
        userInfo,
        settings,
        exportTime: new Date().toISOString()
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cypridina-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('数据导出成功！');
    } catch (error) {
      console.error('导出数据失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 清除数据
  const clearData = () => {
    const confirmed = confirm('确定要清除所有数据吗？此操作不可恢复！');
    if (confirmed) {
      const secondConfirm = confirm('请再次确认：这将删除所有客户、产品和销售单数据！');
      if (secondConfirm) {
        localStorage.removeItem('customers');
        localStorage.removeItem('products');
        localStorage.removeItem('invoice_history');
        localStorage.removeItem('customer_categories');
        localStorage.removeItem('product_categories');
        localStorage.removeItem('product_units');
        
        calculateDataStats();
        alert('数据已清除');
      }
    }
  };

  // 切换设置
  const toggleSetting = (key: keyof typeof settings) => {
    settings[key] = !settings[key];
    saveSettings();
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
        <p class="text-sm text-gray-600">{userInfo.phone}</p>
      </div>
    </div>
    
    <button class="w-full bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors">
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

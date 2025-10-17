<script lang="ts">
  import { page } from '$app/stores';
  
  $: currentPath = $page.url.pathname;
  
  const navItems = [
    { href: '/', label: '首页' },
    { href: '/invoice', label: '销售单生成器' },
    { href: '/sales-invoice-demo', label: '销售单演示' },
    { href: '/delivery', label: '送货单管理' },
    { href: '/delivery-demo', label: '送货单演示' },
    { href: '/final-image-solution', label: '图片保存方案' },
    { href: '/test-product-validation', label: '产品验证测试' },
    { href: '/android-build-guide', label: '📱 Android构建' },
    { href: '/build-summary', label: '🚀 构建总结' },
    { href: '/demo', label: '演示' },
    { href: '/colors', label: '颜色' },
    { href: '/test-colors', label: '测试颜色' }
  ];
</script>

<nav class="bg-white shadow-sm border-b border-gray-200 mb-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900">
          <span class="text-blue-600">Cypridina</span> Client
        </a>
      </div>
      <div class="flex items-center space-x-1">
        {#each navItems as item}
          <a 
            href={item.href} 
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors {
              currentPath === item.href 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }"
          >
            {item.label}
          </a>
        {/each}
      </div>
    </div>
  </div>
</nav>

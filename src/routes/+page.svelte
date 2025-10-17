<script>
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<Navigation />

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">Cypridina Client</h1>
    <p class="text-xl text-gray-600 mb-8">专业的销售单生成工具</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="text-blue-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">销售单生成器</h3>
        <p class="text-gray-600 mb-4">快速创建专业的销售单据，支持商品明细管理、自动计算和打印功能</p>
        <a href="/invoice" class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          开始使用
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="text-green-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">功能特性</h3>
        <ul class="text-gray-600 text-left space-y-1">
          <li>• 动态商品明细管理</li>
          <li>• 自动金额计算</li>
          <li>• 历史记录保存</li>
          <li>• 打印和导出功能</li>
          <li>• 响应式界面设计</li>
        </ul>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">基于图片的销售单示例</h3>
      <p class="text-gray-600 mb-4">
        本应用参考了传统的销售单格式，包含完整的公司信息、客户信息和商品明细。
        支持多种商品规格和计量单位，自动计算金额总计。
      </p>
      <div class="flex justify-center space-x-4">
        <a href="/invoice" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          桌面版体验
        </a>
        <a href="/mobile" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          移动端体验
        </a>
      </div>
    </div>
  </div>
</div>
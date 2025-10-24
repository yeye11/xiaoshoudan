<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // 底部导航项目
  const navItems = [
    {
      id: 'business',
      name: '买卖',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7l9 6 9-6',
      href: '/mobile',
      activeColor: 'text-blue-500'
    },
    {
      id: 'data',
      name: '数据',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      href: '/mobile/data',
      activeColor: 'text-green-500'
    },
    {
      id: 'service',
      name: '客服',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      href: '/mobile/service',
      activeColor: 'text-orange-500'
    },
    {
      id: 'profile',
      name: '我的',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      href: '/mobile/profile',
      activeColor: 'text-purple-500'
    }
  ];

  // 当前活跃的导航项
  $: currentPath = $page.url.pathname;
  $: activeItem = navItems.find(item => currentPath.startsWith(item.href)) || navItems[0];

  // 导航处理函数
  const handleNavClick = (href: string, event: MouseEvent) => {
    event.preventDefault();
    goto(href);
  };

  // 移动端布局始终显示底部导航
</script>

<div class="min-h-screen bg-white flex flex-col" style="min-height: 100svh;">
  <!-- 主内容区域 -->
  <main class="flex-1" style="padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));">
    <slot />
  </main>

  <!-- 底部导航栏 -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white z-50" style="height: calc(64px + env(safe-area-inset-bottom, 0px));">
    <div class="flex items-center justify-around h-16">
      {#each navItems as item}
        <button
          on:click={(e) => handleNavClick(item.href, e)}
          class="flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200
                 {currentPath.startsWith(item.href) ? item.activeColor : 'text-gray-500'}"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
          </svg>
          <span class="text-xs font-medium">{item.name}</span>
        </button>
      {/each}
    </div>
  </nav>

  <!-- 兜底填充层：safe-area + 1px 防抖动，上盖到内容内部 -->
  <div class="fixed left-0 right-0 bg-white pointer-events-none" style="bottom: 0; height: calc(env(safe-area-inset-bottom, 0px) + 1px); z-index: 51;"></div>

  <!-- 最底部向下延伸 2px，覆盖任何底缘发丝线 -->



</div>


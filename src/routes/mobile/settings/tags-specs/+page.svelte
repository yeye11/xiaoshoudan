<script lang="ts">
  import MobileHeader from '$lib/components/MobileHeader.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 全局标签列表
  let globalTags: string[] = [];
  // 全局规格列表
  let globalSpecs: string[] = [];

  // 编辑状态
  let editingTagIndex: number | null = null;
  let editingSpecIndex: number | null = null;
  let editingTagValue = '';
  let editingSpecValue = '';

  onMount(() => {
    loadData();
  });

  const loadData = () => {
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
      console.error('加载数据失败:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('global_tags', JSON.stringify(globalTags));
      localStorage.setItem('global_specifications', JSON.stringify(globalSpecs));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  // 标签管理
  const addTag = () => {
    globalTags = [...globalTags, ''];
    editingTagIndex = globalTags.length - 1;
    editingTagValue = '';
  };

  const startEditTag = (index: number) => {
    editingTagIndex = index;
    editingTagValue = globalTags[index];
  };

  const saveTag = (index: number) => {
    if (editingTagValue.trim()) {
      // 检查是否重复
      const isDuplicate = globalTags.some((tag, i) => i !== index && tag === editingTagValue.trim());
      if (isDuplicate) {
        alert('该标签已存在');
        return;
      }
      globalTags[index] = editingTagValue.trim();
      globalTags = [...globalTags];
      saveData();
    } else {
      // 如果为空，删除该标签
      globalTags = globalTags.filter((_, i) => i !== index);
      saveData();
    }
    editingTagIndex = null;
    editingTagValue = '';
  };

  const deleteTag = (index: number) => {
    if (confirm('确定要删除这个标签吗？')) {
      globalTags = globalTags.filter((_, i) => i !== index);
      saveData();
    }
  };

  // 规格管理
  const addSpec = () => {
    globalSpecs = [...globalSpecs, ''];
    editingSpecIndex = globalSpecs.length - 1;
    editingSpecValue = '';
  };

  const startEditSpec = (index: number) => {
    editingSpecIndex = index;
    editingSpecValue = globalSpecs[index];
  };

  const saveSpec = (index: number) => {
    if (editingSpecValue.trim()) {
      // 检查是否重复
      const isDuplicate = globalSpecs.some((spec, i) => i !== index && spec === editingSpecValue.trim());
      if (isDuplicate) {
        alert('该规格已存在');
        return;
      }
      globalSpecs[index] = editingSpecValue.trim();
      globalSpecs = [...globalSpecs];
      saveData();
    } else {
      // 如果为空，删除该规格
      globalSpecs = globalSpecs.filter((_, i) => i !== index);
      saveData();
    }
    editingSpecIndex = null;
    editingSpecValue = '';
  };

  const deleteSpec = (index: number) => {
    if (confirm('确定要删除这个规格吗？')) {
      globalSpecs = globalSpecs.filter((_, i) => i !== index);
      saveData();
    }
  };
</script>

<div class="min-h-screen bg-gray-50 pb-20">
  <MobileHeader title="标签和规格管理" showBack={true} />

  <div class="p-4 space-y-6">
    <!-- 全局标签管理 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">全局标签</h2>
        <button
          type="button"
          on:click={addTag}
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          + 添加标签
        </button>
      </div>

      <div class="text-sm text-gray-600 mb-4">
        在这里添加的标签可以在创建产品时快速选择使用
      </div>

      {#if globalTags.length === 0}
        <div class="text-center py-8 text-gray-400">
          暂无全局标签，点击上方按钮添加
        </div>
      {:else}
        <div class="space-y-2">
          {#each globalTags as tag, index}
            <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {#if editingTagIndex === index}
                <input
                  type="text"
                  bind:value={editingTagValue}
                  on:blur={() => saveTag(index)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      saveTag(index);
                    }
                  }}
                  class="flex-1 px-3 py-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="输入标签名称"
                  autofocus
                />
              {:else}
                <div
                  class="flex-1 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                  on:click={() => startEditTag(index)}
                >
                  {tag || '(空)'}
                </div>
              {/if}
              <button
                type="button"
                on:click={() => deleteTag(index)}
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="删除标签"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- 全局规格管理 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">全局规格</h2>
        <button
          type="button"
          on:click={addSpec}
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          + 添加规格
        </button>
      </div>

      <div class="text-sm text-gray-600 mb-4">
        在这里添加的规格可以在创建产品时快速选择使用
      </div>

      {#if globalSpecs.length === 0}
        <div class="text-center py-8 text-gray-400">
          暂无全局规格，点击上方按钮添加
        </div>
      {:else}
        <div class="space-y-2">
          {#each globalSpecs as spec, index}
            <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {#if editingSpecIndex === index}
                <input
                  type="text"
                  bind:value={editingSpecValue}
                  on:blur={() => saveSpec(index)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      saveSpec(index);
                    }
                  }}
                  class="flex-1 px-3 py-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="输入规格名称"
                  autofocus
                />
              {:else}
                <div
                  class="flex-1 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                  on:click={() => startEditSpec(index)}
                >
                  {spec || '(空)'}
                </div>
              {/if}
              <button
                type="button"
                on:click={() => deleteSpec(index)}
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="删除规格"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- 使用说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-semibold text-blue-900 mb-2">💡 使用说明</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• 在这里添加的标签和规格是<strong>全局的</strong>，可以在所有产品中使用</li>
        <li>• 创建产品时可以从全局列表中选择，也可以输入新的</li>
        <li>• 输入框中输入的新标签/规格仅用于当前产品</li>
        <li>• 如果要让新输入的成为全局的，请在这里添加</li>
      </ul>
    </div>
  </div>
</div>


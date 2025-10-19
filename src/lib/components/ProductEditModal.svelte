<script lang="ts">
  import type { Product, InvoiceItem } from '$lib/types/invoice';
  import { calculateItemAmount } from '$lib/types/invoice';
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let product: Product | null = null;
  export let item: InvoiceItem | null = null;

  const dispatch = createEventDispatcher();

  // 新建规格弹窗状态
  let showNewSpecModal = false;
  let newSpecName = '';
  let newSpecCode = '';

  const close = () => {
    dispatch('close');
  };

  const save = () => {
    dispatch('save', { item });
  };

  const saveAndReturn = () => {
    dispatch('saveAndReturn', { item });
  };

  const openNewSpecModal = () => {
    newSpecName = '';
    newSpecCode = '';
    showNewSpecModal = true;
  };

  const closeNewSpecModal = () => {
    showNewSpecModal = false;
  };

  const confirmNewSpec = () => {
    if (!newSpecName.trim()) {
      alert('请输入规格型号');
      return;
    }
    if (product && item) {
      console.log('添加规格前:', product.specifications);
      // 使用响应式赋值来触发 Svelte 更新
      product.specifications = [...product.specifications, {
        id: crypto.randomUUID(),
        name: newSpecName.trim(),
        isDefault: false
      }];
      console.log('添加规格后:', product.specifications);
      item.specification = newSpecName.trim();
      closeNewSpecModal();
    }
  };

  // 响应式计算金额
  $: if (item) {
    item.amount = calculateItemAmount(item.quantity, item.unitPrice);
  }
</script>

<!-- 新建规格弹窗 -->
{#if showNewSpecModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-80 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">新建规格型号</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">规格型号</label>
          <input
            type="text"
            bind:value={newSpecName}
            placeholder="如: 120*200"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">编号</label>
          <input
            type="text"
            bind:value={newSpecCode}
            placeholder="最大编号 +1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          type="button"
          on:click={closeNewSpecModal}
          class="flex-1 px-4 py-2 text-blue-500 font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          on:click={confirmNewSpec}
          class="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          确认
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- 编辑模态框 -->
{#if show && product && item}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" on:click={close} role="dialog" aria-modal="true">
    <div class="bg-white w-full max-h-[90vh] overflow-y-auto flex flex-col rounded-t-2xl" on:click|stopPropagation role="document">
      <!-- 头部 -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <!-- 拖动条 -->
        <div class="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
        <h3 class="text-base font-semibold text-gray-900 flex-1">{product.name}</h3>
        <button
          type="button"
          on:click={close}
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
          aria-label="关闭"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <!-- 库存数量 -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div class="text-sm text-orange-700 font-medium">库存数量</div>
          <div class="text-2xl font-bold text-orange-600 mt-1">0</div>
        </div>

        <!-- 单价 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">单价</label>
          <input
            type="number"
            bind:value={item.unitPrice}
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <!-- 单位 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
          <select
            bind:value={item.unit}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="件">件</option>
            <option value="个">个</option>
            <option value="台">台</option>
            <option value="套">套</option>
            <option value="箱">箱</option>
            <option value="盒">盒</option>
            <option value="瓶">瓶</option>
            <option value="包">包</option>
            <option value="袋">袋</option>
            <option value="张">张</option>
            <option value="米">米</option>
            <option value="千克">千克</option>
            <option value="克">克</option>
            <option value="升">升</option>
            <option value="毫升">毫升</option>
          </select>
        </div>

        <!-- 规格型号 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">规格型号</label>
          <div class="flex flex-wrap gap-2">
            {#if product.specifications && product.specifications.length > 0}
              {#each product.specifications as spec (spec.id)}
                <button
                  type="button"
                  on:click={() => item.specification = spec.name}
                  class="w-35 h-10 flex items-center justify-center text-sm rounded-lg border-2 transition-colors overflow-hidden {item.specification === spec.name ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'}"
                >
                  <span class="truncate px-2">{spec.name}</span>
                </button>
              {/each}
            {/if}
            <button
              type="button"
              on:click={openNewSpecModal}
              class="w-24 h-10 flex items-center justify-center text-sm rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              + 新建规格
            </button>
          </div>
        </div>

        <!-- 销售数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">销售数量</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              on:click={() => {
                if (item.quantity > 1) {
                  item.quantity--;
                }
              }}
              class="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              bind:value={item.quantity}
              min="1"
              step="1"
              class="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="button"
              on:click={() => {
                item.quantity++;
              }}
              class="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-4 pt-3 pb-24 flex-shrink-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-lg font-bold text-gray-900">¥{item.amount.toFixed(2)}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            on:click={save}
            class="flex-1 bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            保存
          </button>
          <button
            type="button"
            on:click={saveAndReturn}
            class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            保存并返回
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}


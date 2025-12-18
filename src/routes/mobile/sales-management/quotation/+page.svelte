<script lang="ts">
  import MobilePageLayout from '$lib/components/MobilePageLayout.svelte';
  import { StorageManager } from '$lib/utils/storage';
  import type { Quotation } from '$lib/types/invoice';
  import { createEmptyQuotation } from '$lib/types/invoice';

  let quotations: Quotation[] = [];
  let isLoading = true;

  const load = () => {
    quotations = StorageManager.getQuotations();
    isLoading = false;
  };
  load();

  const createNew = () => {
    const q = createEmptyQuotation();
    sessionStorage.setItem('current_quotation', JSON.stringify(q));
    window.location.href = '/mobile/sales-management/quotation/edit';
  };

  const view = (id: string) => {
    const q = quotations.find(i => i.id === id);
    if (q) {
      sessionStorage.setItem('current_quotation', JSON.stringify(q));
      window.location.href = `/mobile/sales-management/quotation/${id}`;
    }
  };

  const edit = (id: string) => {
    const q = quotations.find(i => i.id === id);
    if (q) {
      sessionStorage.setItem('current_quotation', JSON.stringify(q));
      window.location.href = '/mobile/sales-management/quotation/edit';
    }
  };

  const duplicate = (id: string) => {
    const q = quotations.find(i=>i.id===id);
    if (!q) return;
    const copy: Quotation = { ...q, id: crypto.randomUUID(), quotationNumber: `${q.quotationNumber}-副本`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    quotations = [copy, ...quotations];
    StorageManager.saveQuotations(quotations);
  };

  const remove = (id: string) => {
    if (!confirm('确认删除该报价单？')) return;
    StorageManager.deleteQuotation(id);
    load();
  };
</script>

<MobilePageLayout title="报价单管理">
  <div class="space-y-4">
    <button class="w-full bg-blue-600 text-white py-3 rounded" on:click={createNew}>+ 创建新报价单</button>

    {#if isLoading}
      <div class="text-center text-gray-500 py-8">加载中...</div>
    {:else if !quotations.length}
      <div class="text-center text-gray-500 py-8">暂无报价单</div>
    {:else}
      <div class="space-y-2">
        {#each quotations as q (q.id)}
          <div class="bg-white border rounded p-3 shadow-sm">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-semibold text-blue-600">{q.customName || q.headerInfo.title || '未命名报价单'}</div>
                <div class="text-xs text-gray-500">编号：{q.quotationNumber}</div>
                <div class="text-xs text-gray-500">项目：{q.items.length}</div>
              </div>
              <span class="text-xs bg-gray-200 px-2 py-1 rounded">{new Date(q.updatedAt).toLocaleString()}</span>
            </div>
            <div class="mt-3 grid grid-cols-4 gap-2">
              <button class="bg-green-500 text-white py-1 rounded" on:click={() => view(q.id)}>查看</button>
              <button class="bg-blue-500 text-white py-1 rounded" on:click={() => edit(q.id)}>编辑</button>
              <button class="bg-orange-500 text-white py-1 rounded" on:click={() => duplicate(q.id)}>复制</button>
              <button class="bg-red-500 text-white py-1 rounded" on:click={() => remove(q.id)}>删除</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</MobilePageLayout>

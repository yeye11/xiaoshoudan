<script lang="ts">
  import MobilePageLayout from '$lib/components/MobilePageLayout.svelte';
  import { StorageManager } from '$lib/utils/storage';
  import type { QuotationProduct } from '$lib/types/invoice';

  let products: QuotationProduct[] = [];
  let form: Partial<QuotationProduct> = { id: '', name: '', specification: '', defaultPrice: undefined, notes: '' };
  let editingId: string | null = null;

  const load = () => (products = StorageManager.getQuotationProducts());
  load();

  const resetForm = () => {
    form = { id: '', name: '', specification: '', defaultPrice: undefined, notes: '' };
    editingId = null;
  };

  const submit = () => {
    if (!form.name || !String(form.name).trim()) { alert('请输入产品/型号名称'); return; }
    const now = new Date().toISOString();
    if (editingId) {
      StorageManager.updateQuotationProduct(editingId, { ...form, updatedAt: now } as QuotationProduct);
    } else {
      const item: QuotationProduct = {
        id: crypto.randomUUID(),
        name: String(form.name),
        specification: form.specification || '',
        defaultPrice: typeof form.defaultPrice === 'number' ? form.defaultPrice : undefined,
        notes: form.notes || '',
        createdAt: now,
        updatedAt: now
      };
      StorageManager.addQuotationProduct(item);
    }
    resetForm();
    load();
  };

  const edit = (id: string) => {
    const p = products.find(i => i.id === id);
    if (!p) return;
    form = { ...p };
    editingId = id;
  };

  const remove = (id: string) => {
    if (!confirm('确认删除该产品？')) return;
    StorageManager.deleteQuotationProduct(id);
    load();
  };
</script>

<MobilePageLayout title="报价产品管理">
  <div class="space-y-4">
    <!-- 表单 -->
    <div class="bg-white border rounded p-3 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label class="block text-sm font-semibold">
          <span class="mb-1 inline-block">产品/型号名称</span>
          <input class="w-full border rounded px-3 py-2" bind:value={form.name} placeholder="如：2.5(足2.0)" />
        </label>
        <label class="block text-sm font-semibold">
          <span class="mb-1 inline-block">规格</span>
          <input class="w-full border rounded px-3 py-2" bind:value={form.specification} placeholder="如：1220*2440" />
        </label>
        <label class="block text-sm font-semibold">
          <span class="mb-1 inline-block">参考单价</span>
          <input class="w-full border rounded px-3 py-2" type="number" step="0.01" bind:value={form.defaultPrice} placeholder="0.00" />
        </label>
        <label class="block text-sm font-semibold">
          <span class="mb-1 inline-block">备注</span>
          <input class="w-full border rounded px-3 py-2" bind:value={form.notes} />
        </label>
      </div>
      <div class="mt-3 flex gap-2">
        <button class="bg-blue-600 text-white px-4 py-2 rounded" on:click={submit}>{editingId ? '保存修改' : '添加产品'}</button>
        {#if editingId}
          <button class="bg-gray-400 text-white px-4 py-2 rounded" on:click={resetForm}>取消编辑</button>
        {/if}
      </div>
    </div>

    <!-- 列表 -->
    <div class="space-y-2">
      {#each products as p (p.id)}
        <div class="bg-white border rounded p-3 shadow-sm">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-semibold">{p.name}</div>
              <div class="text-xs text-gray-500">规格：{p.specification || '-'} | 参考单价：{typeof p.defaultPrice==='number' ? p.defaultPrice.toFixed(2) : '-'}</div>
            </div>
            <div class="flex gap-2">
              <button class="bg-blue-500 text-white px-3 py-1 rounded" on:click={() => edit(p.id)}>编辑</button>
              <button class="bg-red-500 text-white px-3 py-1 rounded" on:click={() => remove(p.id)}>删除</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</MobilePageLayout>

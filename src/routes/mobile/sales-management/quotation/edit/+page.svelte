<script lang="ts">
  import MobilePageLayout from '$lib/components/MobilePageLayout.svelte';
  import QuotationEditor from '$lib/components/QuotationEditor.svelte';
  import QuotationView from '$lib/components/QuotationView.svelte';
  import type { Quotation } from '$lib/types/invoice';
  import { createEmptyQuotation, validateQuotation } from '$lib/types/invoice';
  import { StorageManager } from '$lib/utils/storage';

  let quotation: Quotation = createEmptyQuotation();
  let isPreview = false;

  // 从 session 读取
  const stored = sessionStorage.getItem('current_quotation');
  if (stored) quotation = JSON.parse(stored);

  const handleSave = (q: Quotation) => {
    const errors = validateQuotation(q);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const list = StorageManager.getQuotations();
    const idx = list.findIndex(i => i.id === q.id);
    if (idx >= 0) list[idx] = q; else list.unshift(q);
    StorageManager.saveQuotations(list);
    sessionStorage.removeItem('current_quotation');
    alert('保存成功');
  };
</script>

<MobilePageLayout title={isPreview ? '报价单预览' : '报价单编辑'}>
  <div class="flex gap-2 justify-center mb-3">
    <button class="px-4 py-2 rounded bg-gray-500 text-white" on:click={() => (isPreview = !isPreview)}>{isPreview ? '返回编辑' : '预览'}</button>
    <a href="/mobile/sales-management/quotation" class="px-4 py-2 rounded bg-gray-400 text-white">返回列表</a>
  </div>

  {#if isPreview}
    <QuotationView {quotation} showActions={true} />
  {:else}
    <QuotationEditor {quotation} onSave={handleSave} />
  {/if}
</MobilePageLayout>

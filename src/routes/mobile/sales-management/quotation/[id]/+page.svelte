<script lang="ts">
  import MobilePageLayout from '$lib/components/MobilePageLayout.svelte';
  import QuotationView from '$lib/components/QuotationView.svelte';
  import type { Quotation } from '$lib/types/invoice';
  import { StorageManager } from '$lib/utils/storage';
  import { page } from '$app/stores';

  let quotation: Quotation | null = null;

  const load = () => {
    const stored = sessionStorage.getItem('current_quotation');
    if (stored) { quotation = JSON.parse(stored); return; }
    const id = (/** @type any */($page)).params.id;
    quotation = StorageManager.getQuotation(id);
  };
  load();

  const back = () => history.back();
</script>

<MobilePageLayout title="查看报价单">
  {#if !quotation}
    <div class="text-center text-gray-500 py-8">报价单不存在</div>
  {:else}
    <div class="flex gap-2 justify-center mb-3">
      <a href="/mobile/sales-management/quotation/edit" class="px-4 py-2 rounded bg-blue-500 text-white" on:click={() => sessionStorage.setItem('current_quotation', JSON.stringify(quotation))}>编辑</a>
      <button class="px-4 py-2 rounded bg-gray-400 text-white" on:click={back}>返回</button>
    </div>
    <QuotationView {quotation} showActions={true} />
  {/if}
</MobilePageLayout>

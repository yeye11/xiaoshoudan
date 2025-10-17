<script lang="ts">
  import { toastStore } from './index';
  import type { ToastItem } from './index';
  import { onDestroy } from 'svelte';

  let toasts: ToastItem[] = [];
  const unsub = toastStore.subscribe((v) => (toasts = v));
  onDestroy(unsub);
</script>

<!-- 固定在屏幕中心，消息从中间淡入并向上漂移后消失 -->
<div class="toast-layer" aria-live="polite" aria-atomic="true">
  {#each toasts as t, i (t.id)}
    <div class="toast-item {t.type}" style="--offset: {i * 56}px">
      {t.message}
    </div>
  {/each}
</div>

<style>
  .toast-layer {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    pointer-events: none;
  }
  .toast-item {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: 120px;
    max-width: 70vw;
    text-align: center;
    color: #fff;
    font-weight: 700;
    letter-spacing: .5px;
    padding: .6rem .9rem;
    border-radius: 12px;
    background: rgba(0,0,0,0.85);
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
    /* 从中心淡入，缓慢向上漂移并逐渐消失 */
    animation: floatUpFade 1.8s ease-out forwards;
  }
  .toast-item.success { background: rgba(34,197,94,.95); }
  .toast-item.error { background: rgba(239,68,68,.95); }

  @keyframes floatUpFade {
    0% { opacity: 0; transform: translate(-50%, -40%); }
    15% { opacity: 1; transform: translate(-50%, -50%); }
    100% { opacity: 0; transform: translate(-50%, calc(-50% - var(--offset, 56px) - 40px)); }
  }
</style>


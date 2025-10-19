<script lang="ts">
  import { goto } from '$app/navigation';
  export let status: number;
  export let error: Error & { message?: string };
  let countdown = 2;

  const is404 = status === 404;
  const title = is404 ? '页面不存在' : '出错了';
  const desc = is404 ? '你访问的地址不存在或已被移动。' : (error?.message || '发生未知错误');

  // 404 时自动跳转到移动首页（带可视倒计时）
  if (is404) {
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        goto('/mobile');
      }
    }, 1000);
  }

  function goHome(){ goto('/mobile'); }
  function goBack(){ if (history.length > 1) history.back(); else goto('/mobile'); }
</script>

<svelte:head>
  <title>{status} | {title}</title>
</svelte:head>

<div class="err-wrap">
  <div class="err-card">
    <div class="err-status">{status}</div>
    <h1 class="err-title">{title}</h1>
    <p class="err-desc">{desc}</p>
    {#if is404}
      <p class="hint">{countdown}s 后自动返回到移动首页</p>
    {/if}

    <div class="err-actions">
      <button type="button" class="btn" on:click={goBack} aria-label="返回上一页">返回上一页</button>
      <button type="button" class="btn btn-primary" on:click={goHome} aria-label="回到首页">回到首页</button>
    </div>
  </div>
</div>

<style>
  .err-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;padding:24px}
  .err-card{max-width:640px;width:100%;text-align:center;color:#111827}
  .err-status{font-size:56px;font-weight:700}
  .err-title{margin-top:12px;font-size:24px;font-weight:600}
  .err-desc{margin-top:8px;color:#6b7280}
  .err-actions{margin-top:24px;display:flex;justify-content:center;gap:12px}
  .btn{padding:8px 16px;border-radius:8px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#111827}
  .btn:hover{background:#f3f4f6}
  .btn-primary{background:#2563eb;color:#fff;border-color:#2563eb}
  .btn-primary:hover{background:#1d4ed8}
  .hint{margin-top:8px;font-size:12px;color:#6b7280}
</style>

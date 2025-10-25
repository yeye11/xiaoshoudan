<script lang="ts">
  import { goto } from '$app/navigation';
  import { login, register, error as authError, isLoading } from '$lib/stores/authStore';
  import { onMount } from 'svelte';

  let isLoginMode = true;
  let email = '';
  let password = '';
  let name = '';
  let company = '';
  let localError = '';

  onMount(() => {
    // 检查是否已登录，如果已登录则重定向到首页
    const token = localStorage.getItem('auth_token');
    if (token) {
      goto('/mobile');
    }
  });

  async function handleLogin() {
    try {
      localError = '';
      await login(email, password);
      goto('/mobile');
    } catch (err) {
      localError = err instanceof Error ? err.message : '登录失败';
    }
  }

  async function handleRegister() {
    try {
      localError = '';
      if (!name) {
        localError = '请输入姓名';
        return;
      }
      await register(email, password, name, company);
      goto('/mobile');
    } catch (err) {
      localError = err instanceof Error ? err.message : '注册失败';
    }
  }

  function toggleMode() {
    isLoginMode = !isLoginMode;
    localError = '';
    email = '';
    password = '';
    name = '';
    company = '';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
    <!-- Logo/Title -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Cypridina</h1>
      <p class="text-gray-600">销售管理系统</p>
    </div>

    <!-- Error Message -->
    {#if localError || $authError}
      <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {localError || $authError}
      </div>
    {/if}

    <!-- Login Form -->
    {#if isLoginMode}
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="请输入邮箱"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="请输入密码"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={$isLoading}
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
        >
          {$isLoading ? '登录中...' : '登录'}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-gray-600 text-sm">
          还没有账户？
          <button
            on:click={toggleMode}
            class="text-blue-500 hover:text-blue-600 font-medium"
          >
            立即注册
          </button>
        </p>
      </div>
    {:else}
      <!-- Register Form -->
      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div>
          <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            id="reg-email"
            type="email"
            bind:value={email}
            placeholder="请输入邮箱"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="reg-password"
            type="password"
            bind:value={password}
            placeholder="请输入密码（至少8个字符）"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            姓名
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="请输入姓名"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
            公司名称（可选）
          </label>
          <input
            id="company"
            type="text"
            bind:value={company}
            placeholder="请输入公司名称"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={$isLoading}
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
        >
          {$isLoading ? '注册中...' : '注册'}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-gray-600 text-sm">
          已有账户？
          <button
            on:click={toggleMode}
            class="text-blue-500 hover:text-blue-600 font-medium"
          >
            立即登录
          </button>
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>


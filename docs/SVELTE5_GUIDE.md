# Svelte 5 使用指南

## 主要变化

Svelte 5 引入了许多重要的语法变化，这里是最常用的更新。

## 1. 响应式状态 (Runes)

### `$state` - 响应式变量

**旧语法 (Svelte 4):**
```svelte
<script>
  let count = 0;
</script>
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let count = $state(0);
</script>
```

### `$derived` - 派生状态

**旧语法 (Svelte 4):**
```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
</script>
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

### `$effect` - 副作用

**旧语法 (Svelte 4):**
```svelte
<script>
  let count = 0;
  
  $: {
    console.log('Count changed:', count);
  }
</script>
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let count = $state(0);
  
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

## 2. 事件处理

### 标准 DOM 事件

**旧语法 (Svelte 4):**
```svelte
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
<form on:submit|preventDefault={handleSubmit}>
```

**新语法 (Svelte 5):**
```svelte
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
```

### 常用事件

| Svelte 4 | Svelte 5 |
|----------|----------|
| `on:click` | `onclick` |
| `on:input` | `oninput` |
| `on:change` | `onchange` |
| `on:submit` | `onsubmit` |
| `on:keydown` | `onkeydown` |
| `on:keyup` | `onkeyup` |
| `on:mouseenter` | `onmouseenter` |
| `on:mouseleave` | `onmouseleave` |
| `on:focus` | `onfocus` |
| `on:blur` | `onblur` |

## 3. Props

### 接收 Props

**旧语法 (Svelte 4):**
```svelte
<script>
  export let name;
  export let age = 18;
</script>
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let { name, age = 18 } = $props();
</script>
```

### 带类型的 Props

```svelte
<script lang="ts">
  interface Props {
    name: string;
    age?: number;
    onclick?: () => void;
  }
  
  let { name, age = 18, onclick }: Props = $props();
</script>
```

## 4. 双向绑定

### `$bindable` - 可绑定的 Props

**父组件:**
```svelte
<script lang="ts">
  let value = $state('');
</script>

<Input bind:value />
```

**子组件 (Input.svelte):**
```svelte
<script lang="ts">
  let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

## 5. Slots (插槽)

### 默认插槽

**旧语法 (Svelte 4):**
```svelte
<slot />
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let { children } = $props();
</script>

{@render children?.()}
```

### 命名插槽

**旧语法 (Svelte 4):**
```svelte
<slot name="header" />
<slot />
<slot name="footer" />
```

**新语法 (Svelte 5):**
```svelte
<script lang="ts">
  let { header, children, footer } = $props();
</script>

{@render header?.()}
{@render children?.()}
{@render footer?.()}
```

**使用:**
```svelte
<Card>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}
  
  <p>Content</p>
  
  {#snippet footer()}
    <button>OK</button>
  {/snippet}
</Card>
```

## 6. 完整示例

### 计数器组件

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  function increment() {
    count++;
  }
  
  function decrement() {
    count--;
  }
  
  function reset() {
    count = 0;
  }
  
  $effect(() => {
    console.log('Count changed to:', count);
  });
</script>

<div class="space-y-4">
  <div class="text-2xl font-bold">
    Count: {count}
  </div>
  
  <div class="text-lg text-muted-foreground">
    Doubled: {doubled}
  </div>
  
  <div class="flex gap-2">
    <Button onclick={increment}>+1</Button>
    <Button onclick={decrement} variant="outline">-1</Button>
    <Button onclick={reset} variant="ghost">Reset</Button>
  </div>
</div>
```

### 表单组件

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  
  let name = $state('');
  let email = $state('');
  let isValid = $derived(name.length > 0 && email.includes('@'));
  
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log('Submitted:', { name, email });
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="name">Name</label>
    <Input id="name" bind:value={name} placeholder="Enter your name" />
  </div>
  
  <div>
    <label for="email">Email</label>
    <Input id="email" type="email" bind:value={email} placeholder="Enter your email" />
  </div>
  
  <Button type="submit" disabled={!isValid}>
    Submit
  </Button>
</form>
```

### 可复用组件

```svelte
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    title?: string;
    children: any;
  }
  
  let { title, children }: Props = $props();
</script>

<div class="border rounded-lg p-6 space-y-4">
  {#if title}
    <h2 class="text-2xl font-semibold">{title}</h2>
  {/if}
  
  {@render children()}
</div>
```

**使用:**
```svelte
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="My Card">
  <p>This is the card content.</p>
</Card>
```

## 7. 常见模式

### 条件渲染

```svelte
<script lang="ts">
  let isLoggedIn = $state(false);
</script>

{#if isLoggedIn}
  <p>Welcome back!</p>
{:else}
  <button onclick={() => isLoggedIn = true}>Login</button>
{/if}
```

### 列表渲染

```svelte
<script lang="ts">
  let items = $state(['Apple', 'Banana', 'Cherry']);
  
  function addItem() {
    items = [...items, `Item ${items.length + 1}`];
  }
  
  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }
</script>

<ul>
  {#each items as item, index}
    <li>
      {item}
      <button onclick={() => removeItem(index)}>Remove</button>
    </li>
  {/each}
</ul>

<button onclick={addItem}>Add Item</button>
```

## 8. 迁移检查清单

从 Svelte 4 迁移到 Svelte 5：

- [ ] 将 `let count = 0` 改为 `let count = $state(0)`
- [ ] 将 `$: doubled = count * 2` 改为 `let doubled = $derived(count * 2)`
- [ ] 将 `$: { ... }` 改为 `$effect(() => { ... })`
- [ ] 将 `on:click` 改为 `onclick`
- [ ] 将 `export let prop` 改为 `let { prop } = $props()`
- [ ] 将 `<slot />` 改为 `{@render children?.()}`
- [ ] 更新组件的类型定义

## 9. 参考资源

- [Svelte 5 官方文档](https://svelte.dev/docs/svelte/overview)
- [Svelte 5 迁移指南](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)

---

**提示**: 在 VS Code 中安装 Svelte 扩展以获得更好的类型提示和自动完成。


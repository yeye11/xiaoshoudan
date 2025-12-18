<script lang="ts">
  /**
   * 通用表单字段组件
   * 
   * 功能：
   * - 统一的表单字段样式
   * - 统一的错误显示
   * - 支持多种输入类型
   * - 支持必填标记
   */

  export let label: string = '';
  export let type: string = 'text';
  export let value: any = '';
  export let placeholder: string = '';
  export let error: string | null = null;
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let min: number | string | undefined = undefined;
  export let max: number | string | undefined = undefined;
  export let step: number | string | undefined = undefined;
  export let pattern: string | undefined = undefined;
  export let hint: string = '';
  export let list: string | undefined = undefined; // 支持 datalist

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    value = type === 'number' ? parseFloat(target.value) : target.value;
  };
</script>

<div class="form-field">
  <label class="block text-sm font-medium text-gray-700 mb-1">
    {#if label}
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    {/if}
    <input
      {type}
      {value}
      {placeholder}
      {list}
      {disabled}
      {readonly}
      {min}
      {max}
      {step}
      {pattern}
      on:change={handleChange}
      on:input={handleChange}
      on:blur
      on:focus
      class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors
             {error ? 'border-red-500' : ''}
             {disabled ? 'bg-gray-100 cursor-not-allowed' : ''}"
    />
  </label>

  {#if error}
    <p class="text-red-500 text-sm mt-1">{error}</p>
  {/if}

  {#if hint}
    <p class="text-gray-500 text-sm mt-1">{hint}</p>
  {/if}
</div>

<style>
  .form-field {
    margin-bottom: 1rem;
  }
</style>


<script lang="ts">
  /**
   * 通用列表项组件
   *
   * 功能：
   * - 统一的列表项样式
   * - 支持多个操作按钮
   * - 支持选择框
   * - 支持自定义内容
   */

  export let item: any;
  export let selected: boolean = false;
  export let onSelect: ((item: any) => void) | null = null;
  export let onEdit: ((item: any) => void) | null = null;
  export let onDelete: ((item: any) => void) | null = null;
  export let onClick: ((item: any) => void) | null = null;
  export let isDeleting: boolean = false;
  export let fields: Array<{ key: string; label: string; format?: (value: any) => string }> = [];

  const formatValue = (value: any, format?: (value: any) => string): string => {
    if (format) return format(value);
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  const handleClick = (e: MouseEvent) => {
    // 如果点击的是按钮，不触发行点击事件
    const target = e.target as HTMLElement;
    if (target?.closest('button')) return;
    // 调用 onClick 回调
    onClick?.(item);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    // 如果点击的是按钮，不触发行点击事件
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target?.closest('button')) return;
    }
  };
</script>

<div
  class="list-item border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <div class="flex items-center gap-3 p-4">
    {#if onSelect}
      <input
        type="checkbox"
        checked={selected}
        on:change={() => onSelect?.(item)}
        class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />
    {/if}

    <div class="flex-1 min-w-0">
      {#if fields.length > 0}
        <div class="space-y-1">
          {#each fields as field}
            <div class="flex justify-between items-start gap-2">
              <span class="text-sm font-medium text-gray-600">{field.label}:</span>
              <span class="text-sm text-gray-900 text-right">{formatValue(item[field.key], field.format)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <slot {item} />
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {#if onEdit}
        <button
          on:click={() => onEdit?.(item)}
          class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          编辑
        </button>
      {/if}

      {#if onDelete}
        <button
          on:click={() => onDelete?.(item)}
          disabled={isDeleting}
          class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? '删除中...' : '删除'}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .list-item {
    background-color: white;
  }
</style>


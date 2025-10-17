# 组件模块化管理

## 📁 目录结构

```
src/lib/components/
├── DeliveryNote.svelte       # 送货单组件
├── InvoiceHistory.svelte     # 销售单历史记录组件
├── InvoiceItemsTable.svelte  # 销售单商品明细表格组件
├── InvoicePreview.svelte     # 销售单预览组件
├── MobileHeader.svelte       # 移动端头部组件
├── MobileImageExport.svelte  # 移动端图片导出组件
├── MobileLayout.svelte       # 移动端布局组件
├── Navigation.svelte         # 导航组件
├── SalesInvoice.svelte       # 销售单组件
└── ui/                       # 通用UI组件
    ├── button/               # 按钮组件
    └── toast/                # 全局飘窗(Toast)
        ├── ToastHost.svelte  # 全局挂载宿主
        └── index.ts          # 导出 showToast / ToastHost
```

## 📋 当前组件说明

### 销售单相关组件
- **SalesInvoice** - 销售单组件，用于显示和打印销售单
- **DeliveryNote** - 送货单组件，用于显示和打印送货单
- **InvoiceItemsTable** - 商品明细表格组件，用于编辑销售单商品明细
- **InvoiceHistory** - 销售单历史记录组件
- **InvoicePreview** - 销售单预览组件

### 移动端组件
- **MobileHeader** - 移动端头部组件，包含标题和返回按钮
- **MobileLayout** - 移动端布局组件
- **MobileImageExport** - 移动端图片导出组件，用于将销售单/送货单导出为图片

### 通用组件
- **Navigation** - 导航组件

### ui/toast 模块（全局飘窗）
- **ToastHost** - 全局挂载组件（已在 src/routes/+layout.svelte 挂载）
- **showToast** - 任意组件调用即可飘提示：`showToast('文本', 'success'|'error'|'info', 1800)`
- 特性：中间淡入 → 缓慢上移 → 淡出自动消失，支持并发多条

## �� 使用示例

### 在页面中导入和使用：

```svelte
<script>
  import SalesInvoice from '$lib/components/SalesInvoice.svelte';
  import DeliveryNote from '$lib/components/DeliveryNote.svelte';
  import MobileImageExport from '$lib/components/MobileImageExport.svelte';
  import { showToast } from '$lib/components/ui/toast';

  let invoice = {
    invoiceNumber: 'INV001',
    customerName: '客户名称',
    items: []
  };

  const notify = () => showToast('操作成功', 'success');
</script>

<SalesInvoice {invoice} />
<MobileImageExport invoiceId={invoice.id} />
```

## 💡 最佳实践

1. **组件命名**：使用 PascalCase，清晰描述组件功能
2. **文档维护**：保持 README.md 与实际代码同步
3. **代码复用**：提取通用逻辑到独立组件

这种组件化管理方式让代码更加清晰、易维护！

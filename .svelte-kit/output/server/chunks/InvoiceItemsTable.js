import { V as ensure_array_like, a0 as attr, _ as bind_props } from "./index2.js";
import { f as formatCurrency } from "./invoice.js";
import { f as fallback, e as escape_html } from "./context.js";
function InvoiceItemsTable($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalAmount;
    let items = fallback($$props["items"], () => [], true);
    let onItemsChange = $$props["onItemsChange"];
    const unitOptions = [
      "件",
      "个",
      "套",
      "米",
      "平方米",
      "立方米",
      "公斤",
      "吨",
      "箱",
      "包",
      "张",
      "块"
    ];
    totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    $$renderer2.push(`<div class="mb-8"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-800">商品明细</h2> <div class="flex space-x-2"><button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> 添加商品</button></div></div> <div class="bg-white border border-gray-200 rounded-lg overflow-hidden"><div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50"><tr><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">序号</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">产品名称</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">规格型号</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">单位</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">数量</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">单价</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">金额</th><th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">操作</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><!--[-->`);
    const each_array = ensure_array_like(items);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let item = each_array[index];
      $$renderer2.push(`<tr class="hover:bg-gray-50 transition-colors"><td class="px-3 py-3 text-center text-sm text-gray-900">${escape_html(index + 1)}</td><td class="px-3 py-3"><input type="text"${attr("value", item.productName)} class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入产品名称"/></td><td class="px-3 py-3"><input type="text"${attr("value", item.specification)} class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="规格型号"/></td><td class="px-3 py-3">`);
      $$renderer2.select(
        {
          value: item.unit,
          class: "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(unitOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let unit = each_array_1[$$index];
            $$renderer3.option({ value: unit }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(unit)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</td><td class="px-3 py-3"><input type="number"${attr("value", item.quantity)} min="0" step="0.01" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"/></td><td class="px-3 py-3"><input type="number"${attr("value", item.unitPrice)} min="0" step="0.01" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"/></td><td class="px-3 py-3 text-right font-medium text-sm text-gray-900">¥${escape_html(formatCurrency(item.amount))}</td><td class="px-3 py-3"><div class="flex items-center space-x-1"><button${attr("disabled", index === 0, true)} class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" title="上移"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button> <button${attr("disabled", index === items.length - 1, true)} class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" title="下移"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> <button class="p-1 text-blue-400 hover:text-blue-600" title="复制"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button> <button${attr("disabled", items.length === 1, true)} class="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed" title="删除"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody><tfoot class="bg-gray-50"><tr><td colspan="6" class="px-3 py-4 text-right font-medium text-gray-900">合计：</td><td class="px-3 py-4 text-right font-bold text-lg text-gray-900">¥${escape_html(formatCurrency(totalAmount))}</td><td class="px-3 py-4"></td></tr></tfoot></table></div></div> <div class="mt-2 text-xs text-gray-500"><p>快捷键：Ctrl + Enter 添加新行，Ctrl + Delete 删除当前行</p></div></div>`);
    bind_props($$props, { items, onItemsChange });
  });
}
export {
  InvoiceItemsTable as I
};

import { V as ensure_array_like, a0 as attr } from "../../../chunks/index2.js";
import { c as createEmptyInvoice, a as calculateTotalAmount } from "../../../chunks/invoice.js";
import { I as InvoiceItemsTable } from "../../../chunks/InvoiceItemsTable.js";
import { N as Navigation } from "../../../chunks/Navigation.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let defaultCompanyInfo = {
      name: "佛山市仁腾装饰材料有限公司",
      address: "佛山市南海盐步大转弯夹板装饰第五期C1座12号",
      phone: "18575852698",
      email: "",
      taxId: ""
    };
    let invoice = createEmptyInvoice(defaultCompanyInfo);
    let errors = [];
    function handleItemsChange(items) {
      invoice.items = items;
      invoice.totalAmount = calculateTotalAmount(items);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Navigation($$renderer3);
      $$renderer3.push(`<!----> <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8"><div class="max-w-6xl mx-auto px-4"><div class="bg-white rounded-xl shadow-xl p-8"><div class="text-center mb-8"><h1 class="text-4xl font-bold text-gray-900 mb-2">销售单生成器</h1> <p class="text-gray-600">快速创建专业的销售单据</p></div> `);
      {
        $$renderer3.push("<!--[-->");
        if (errors.length > 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6"><h3 class="text-red-800 font-medium mb-2">请修正以下错误：</h3> <ul class="text-red-700 text-sm space-y-1"><!--[-->`);
          const each_array = ensure_array_like(errors);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let error = each_array[$$index];
            $$renderer3.push(`<li>• ${escape_html(error)}</li>`);
          }
          $$renderer3.push(`<!--]--></ul></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="mb-8"><h2 class="text-xl font-semibold text-gray-800 mb-4">公司信息</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">公司名称</label> <input type="text"${attr("value", invoice.companyInfo.name)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入公司名称"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">联系电话</label> <input type="text"${attr("value", invoice.companyInfo.phone)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入联系电话"/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">公司地址</label> <input type="text"${attr("value", invoice.companyInfo.address)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入公司地址"/></div></div></div> <div class="mb-8"><h2 class="text-xl font-semibold text-gray-800 mb-4">客户信息</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">客户名称 *</label> <input type="text"${attr("value", invoice.customerInfo.name)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入客户名称" required/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">制单人 *</label> <input type="text"${attr("value", invoice.createdBy)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入制单人" required/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">送货日期</label> <input type="date"${attr("value", invoice.date)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div></div></div> `);
        InvoiceItemsTable($$renderer3, {
          onItemsChange: handleItemsChange,
          get items() {
            return invoice.items;
          },
          set items($$value) {
            invoice.items = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"><button class="group bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"><svg class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 历史记录</button> <button class="group bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"><svg class="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> 重置</button> <button class="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center"><svg class="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 预览销售单</button></div>`);
      }
      $$renderer3.push(`<!--]--></div></div></div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};

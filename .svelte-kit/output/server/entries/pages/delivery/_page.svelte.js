import { a2 as head, a0 as attr, V as ensure_array_like } from "../../../chunks/index2.js";
import { c as createEmptyInvoice } from "../../../chunks/invoice.js";
import { I as InvoiceItemsTable } from "../../../chunks/InvoiceItemsTable.js";
import "html2canvas";
import "../../../chunks/MobileImageExport.svelte_svelte_type_style_lang.js";
import "../../../chunks/DeliveryNote.svelte_svelte_type_style_lang.js";
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
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>送货单管理 - 销售管理系统</title>`);
      });
    });
    Navigation($$renderer2);
    $$renderer2.push(`<!----> <div class="container mx-auto px-4 py-8"><div class="flex justify-between items-center mb-6"><h1 class="text-3xl font-bold text-gray-900">送货单管理</h1> <div class="flex space-x-3"><button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">${escape_html("预览模式")}</button> <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">保存送货单</button> <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">重置表单</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="bg-white rounded-lg shadow-md p-6"><div class="mb-6"><h2 class="text-xl font-semibold mb-4">公司信息</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">公司名称</label> <input type="text"${attr("value", invoice.companyInfo.name)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">联系电话</label> <input type="text"${attr("value", invoice.companyInfo.phone)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">公司地址</label> <input type="text"${attr("value", invoice.companyInfo.address)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div></div></div> <div class="mb-6"><h2 class="text-xl font-semibold mb-4">客户信息</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">客户名称 *</label> <input type="text"${attr("value", invoice.customerInfo.name)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入客户名称"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">客户电话</label> <input type="text"${attr("value", invoice.customerInfo.phone)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入客户电话"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">制单人</label> <input type="text"${attr("value", invoice.createdBy)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入制单人"/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">客户地址</label> <input type="text"${attr("value", invoice.customerInfo.address)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入客户地址"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">送货日期</label> <input type="date"${attr("value", invoice.deliveryDate)} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div></div></div> <div class="mb-6"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold">商品明细</h2> <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">添加商品</button></div> `);
      InvoiceItemsTable($$renderer2, { items: invoice.items });
      $$renderer2.push(`<!----></div> <div class="flex justify-end"><div class="bg-gray-50 p-4 rounded-lg"><div class="text-right"><span class="text-lg font-semibold">合计金额：</span> <span class="text-xl font-bold text-blue-600">¥${escape_html(invoice.totalAmount.toFixed(2))}</span></div></div></div> `);
      if (errors.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md"><h3 class="text-red-800 font-medium mb-2">请修正以下错误：</h3> <ul class="text-red-700 text-sm"><!--[-->`);
        const each_array = ensure_array_like(errors);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let error = each_array[$$index];
          $$renderer2.push(`<li>• ${escape_html(error)}</li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

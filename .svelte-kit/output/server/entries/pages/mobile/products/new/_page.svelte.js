import { a0 as attr, W as attr_class, V as ensure_array_like, Y as stringify } from "../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../chunks/MobileHeader.js";
import { d as createEmptyProduct } from "../../../../../chunks/invoice.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let product = createEmptyProduct();
    let errors = {};
    let isSubmitting = false;
    MobileHeader($$renderer2, {
      title: "新建产品",
      showBack: true,
      backgroundColor: "bg-orange-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button${attr("disabled", isSubmitting, true)} class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors disabled:opacity-50" aria-label="保存"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> <div class="p-4 space-y-6">`);
    if (errors.general) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-red-50 border border-red-200 rounded-lg p-3"><p class="text-red-600 text-sm">${escape_html(errors.general)}</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><h3 class="font-medium text-gray-900">基本信息</h3> <div><label class="block text-sm font-medium text-gray-700 mb-1">名称 <span class="text-red-500">*</span></label> <input type="text"${attr("value", product.name)} placeholder="请输入产品名称"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${stringify(errors.name ? "border-red-500" : "")}`)}/> `);
    if (errors.name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.name)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">条形码</label> <div class="flex space-x-2"><input type="text"${attr("value", product.barcode)} placeholder="请输入条形码" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"/> <button type="button" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">生成</button></div></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">产品分类</label> <button type="button" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between"><span${attr_class("text-gray-500")}>${escape_html("请选择产品分类")}</span> <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">单位</label> <button type="button"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between ${stringify(errors.unit ? "border-red-500" : "")}`)}><span${attr_class("text-gray-900")}>${escape_html(product.unit)}</span> <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> `);
    if (errors.unit) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.unit)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><div class="flex items-center justify-between"><h3 class="font-medium text-gray-900">规格型号</h3> <button type="button" class="text-orange-500 text-sm font-medium">+ 添加</button></div> `);
    if (errors.specifications) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm">${escape_html(errors.specifications)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="space-y-3"><!--[-->`);
    const each_array = ensure_array_like(product.specifications);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let spec = each_array[index];
      $$renderer2.push(`<div class="flex items-center space-x-2"><input type="text"${attr("value", spec.name)} placeholder="如: 1220*2440" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"/> <button type="button"${attr_class(`px-3 py-2 text-sm rounded-lg transition-colors ${stringify(spec.isDefault ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`)}>默认</button> `);
      if (product.specifications.length > 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button type="button" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><div class="flex items-center justify-between"><h3 class="font-medium text-gray-900">价格管理</h3> <div class="flex space-x-2"><button type="button" class="text-orange-500 text-sm font-medium">+ 销售价</button> <button type="button" class="text-orange-500 text-sm font-medium">+ 采购价</button></div></div> `);
    if (errors.prices) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm">${escape_html(errors.prices)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="space-y-3"><!--[-->`);
    const each_array_1 = ensure_array_like(product.prices);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let price = each_array_1[index];
      $$renderer2.push(`<div class="flex items-center space-x-2">`);
      $$renderer2.select(
        {
          value: price.type,
          class: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "sale" }, ($$renderer4) => {
            $$renderer4.push(`销售价`);
          });
          $$renderer3.option({ value: "purchase" }, ($$renderer4) => {
            $$renderer4.push(`采购价`);
          });
          $$renderer3.option({ value: "wholesale" }, ($$renderer4) => {
            $$renderer4.push(`批发价`);
          });
        }
      );
      $$renderer2.push(` <input type="number"${attr("value", price.price)} placeholder="0.00" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"/> <button type="button"${attr_class(`px-3 py-2 text-sm rounded-lg transition-colors ${stringify(price.isDefault ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`)}>默认</button> `);
      if (product.prices.length > 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button type="button" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><div class="flex items-center justify-between"><h3 class="font-medium text-gray-900">标签</h3> <button type="button" class="text-orange-500 text-sm font-medium">+ 添加</button></div> `);
    if (product.tags.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-wrap gap-2"><!--[-->`);
      const each_array_2 = ensure_array_like(product.tags);
      for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
        let tag = each_array_2[index];
        $$renderer2.push(`<span class="inline-flex items-center bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">${escape_html(tag)} <button type="button" class="ml-2 text-gray-400 hover:text-gray-600"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-gray-500 text-sm">暂无标签</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><label class="block text-sm font-medium text-gray-700 mb-1">备注</label> <textarea placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none">`);
    const $$body = escape_html(product.notes);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="flex space-x-3 pb-6"><button type="button" class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors">取消</button> <button type="button"${attr("disabled", isSubmitting, true)} class="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">${escape_html("保存")}</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

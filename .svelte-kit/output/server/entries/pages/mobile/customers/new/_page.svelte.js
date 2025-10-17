import { a0 as attr, W as attr_class, Y as stringify } from "../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../chunks/MobileHeader.js";
import { b as createEmptyCustomer } from "../../../../../chunks/invoice.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let customer = createEmptyCustomer();
    let errors = {};
    let isSubmitting = false;
    MobileHeader($$renderer2, {
      title: "新建客户",
      showBack: true,
      backgroundColor: "bg-blue-500",
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
    $$renderer2.push(`<!--]--> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><h3 class="font-medium text-gray-900">基本信息</h3> <div><label class="block text-sm font-medium text-gray-700 mb-1">客户名称 <span class="text-red-500">*</span></label> <input type="text"${attr("value", customer.name)} placeholder="请输入客户名称"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stringify(errors.name ? "border-red-500" : "")}`)}/> `);
    if (errors.name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.name)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">客户分类</label> <button type="button" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"><span${attr_class("text-gray-500")}>${escape_html("请选择客户分类")}</span> <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">期初欠款</label> <input type="number"${attr("value", customer.initialDebt)} placeholder="请输入期初欠款" step="0.01" min="0"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stringify(errors.initialDebt ? "border-red-500" : "")}`)}/> `);
    if (errors.initialDebt) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.initialDebt)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border space-y-4"><h3 class="font-medium text-gray-900">联系信息</h3> <div><label class="block text-sm font-medium text-gray-700 mb-1">电话</label> <input type="tel" placeholder="请输入电话"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stringify(errors.phone ? "border-red-500" : "")}`)}/> `);
    if (errors.phone) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.phone)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">备用电话</label> <input type="tel"${attr("value", customer.backupPhone)} placeholder="请输入备用电话" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">地址</label> <textarea placeholder="请输入地址" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none">`);
    const $$body = escape_html(customer.address);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">传真</label> <input type="text"${attr("value", customer.fax)} placeholder="请输入传真" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label> <input type="email"${attr("value", customer.email)} placeholder="请输入邮箱"${attr_class(`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stringify(errors.email ? "border-red-500" : "")}`)}/> `);
    if (errors.email) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-500 text-sm mt-1">${escape_html(errors.email)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><label class="block text-sm font-medium text-gray-700 mb-1">备注</label> <textarea placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none">`);
    const $$body_1 = escape_html(customer.notes);
    if ($$body_1) {
      $$renderer2.push(`${$$body_1}`);
    }
    $$renderer2.push(`</textarea></div> <div class="flex space-x-3 pb-6"><button type="button" class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors">取消</button> <button type="button"${attr("disabled", isSubmitting, true)} class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">${escape_html("保存")}</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

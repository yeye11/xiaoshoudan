import { a0 as attr, V as ensure_array_like } from "../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../chunks/MobileHeader.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let products = [];
    let filtered = [];
    let keyword = "";
    const handleSearch = () => {
      if (!keyword.trim()) {
        filtered = products;
        return;
      }
      const k = keyword.toLowerCase();
      filtered = products.filter((p) => p.name.toLowerCase().includes(k) || p.category.toLowerCase().includes(k) || (p.barcode || "").toLowerCase().includes(k) || p.tags.some((t) => t.toLowerCase().includes(k)));
    };
    handleSearch();
    MobileHeader($$renderer2, {
      title: "选择产品",
      showBack: true,
      backgroundColor: "bg-orange-500"
    });
    $$renderer2.push(`<!----> <div class="bg-white border-b border-gray-200 p-3 sticky top-0 z-10"><div class="relative"><input type="text"${attr("value", keyword)} placeholder="搜索产品名称、分类、条码、标签" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"/> <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div></div> <div class="p-3">`);
    if (filtered.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center text-gray-500 py-12">没有匹配的产品</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(filtered);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let p = each_array[$$index_1];
        $$renderer2.push(`<button class="w-full text-left bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"${attr("aria-label", `选择 ${p.name}`)}><div class="flex items-start justify-between"><div class="flex-1"><div class="font-medium text-gray-900">${escape_html(p.name)}</div> <div class="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">`);
        if (p.category) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span>分类: ${escape_html(p.category)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <span>单位: ${escape_html(p.unit)}</span> `);
        if (p.specifications.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span>规格: ${escape_html(p.specifications.find((s) => s.isDefault)?.name || p.specifications[0]?.name)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (p.prices.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-orange-600">¥${escape_html((p.prices.find((pp) => pp.type === "sale" && pp.isDefault) || p.prices[0])?.price.toFixed(2))}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (p.barcode) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="font-mono text-xs text-gray-500">${escape_html(p.barcode)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        if (p.tags.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex flex-wrap gap-1 mt-2"><!--[-->`);
          const each_array_1 = ensure_array_like(p.tags.slice(0, 4));
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let tag = each_array_1[$$index];
            $$renderer2.push(`<span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">${escape_html(tag)}</span>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

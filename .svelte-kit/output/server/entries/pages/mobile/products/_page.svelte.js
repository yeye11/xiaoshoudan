import { V as ensure_array_like } from "../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../chunks/MobileHeader.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import { e as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let products = [];
    let filteredProducts = [];
    let searchKeyword = "";
    let sortBy = "name";
    const handleSearch = () => {
      if (!searchKeyword.trim()) {
        filteredProducts = products;
      } else {
        const keyword = searchKeyword.toLowerCase();
        filteredProducts = products.filter((product) => product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword) || product.barcode?.toLowerCase().includes(keyword) || product.tags.some((tag) => tag.toLowerCase().includes(keyword)));
      }
      sortProducts();
    };
    const sortProducts = () => {
      filteredProducts.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "category":
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          case "price":
            aValue = getProductPrice(a);
            bValue = getProductPrice(b);
            break;
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }
        if (typeof aValue === "string") {
          return aValue.localeCompare(bValue);
        } else {
          return aValue - bValue;
        }
      });
    };
    const getProductPrice = (product) => {
      const salePrice = product.prices.find((p) => p.type === "sale" && p.isDefault);
      return salePrice ? salePrice.price : 0;
    };
    const getProductSpecification = (product) => {
      const defaultSpec = product.specifications.find((s) => s.isDefault);
      return defaultSpec ? defaultSpec.name : "";
    };
    const formatPrice = (price) => {
      return `¥${price.toFixed(2)}`;
    };
    {
      handleSearch();
    }
    MobileHeader($$renderer2, {
      title: "产品",
      showBack: true,
      showSearch: true,
      showActions: true,
      backgroundColor: "bg-orange-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="添加产品"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="p-4">`);
    if (filteredProducts.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center py-12"><svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> <p class="text-gray-500 mb-4">${escape_html("还没有产品数据")}</p> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">添加第一个产品</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(filteredProducts);
      for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
        let product = each_array_1[$$index_2];
        $$renderer2.push(`<div class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="font-medium text-gray-900 mb-1">${escape_html(product.name)}</h3> <div class="text-sm text-gray-600 space-y-1">`);
        if (product.category) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><span class="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span> ${escape_html(product.category)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (getProductSpecification(product)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> ${escape_html(getProductSpecification(product))}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> 单位: ${escape_html(product.unit)}</div> `);
        if (product.barcode) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path></svg> <span class="font-mono text-xs">${escape_html(product.barcode)}</span></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        if (product.tags.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex flex-wrap gap-1 mt-2"><!--[-->`);
          const each_array_2 = ensure_array_like(product.tags.slice(0, 3));
          for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
            let tag = each_array_2[$$index_1];
            $$renderer2.push(`<span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">${escape_html(tag)}</span>`);
          }
          $$renderer2.push(`<!--]--> `);
          if (product.tags.length > 3) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="text-xs text-gray-500">+${escape_html(product.tags.length - 3)}</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="text-right ml-4"><div class="text-xs text-gray-500">售价</div> <div class="text-sm font-medium text-orange-600">${escape_html(formatPrice(getProductPrice(product)))}</div> <div class="text-xs text-gray-500 mt-1">${escape_html(product.unit)}</div></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

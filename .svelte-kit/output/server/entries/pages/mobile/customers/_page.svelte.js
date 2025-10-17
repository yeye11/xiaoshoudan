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
    let customers = [];
    let filteredCustomers = [];
    let searchKeyword = "";
    let searchCategory = "all";
    const handleSearch = () => {
      if (!searchKeyword.trim()) {
        filteredCustomers = customers;
        return;
      }
      const keyword = searchKeyword.toLowerCase();
      filteredCustomers = customers.filter((customer) => {
        switch (searchCategory) {
          case "name":
            return customer.name.toLowerCase().includes(keyword);
          case "phone":
            return customer.phone.includes(keyword) || customer.backupPhone?.includes(keyword);
          case "attachment":
            return customer.attachments?.some((att) => att.toLowerCase().includes(keyword));
          default:
            return customer.name.toLowerCase().includes(keyword) || customer.phone.includes(keyword) || customer.backupPhone?.includes(keyword) || customer.email?.toLowerCase().includes(keyword) || customer.address?.toLowerCase().includes(keyword);
        }
      });
    };
    const formatPhone = (phone) => {
      if (!phone) return "";
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    };
    const getCustomerDebt = (customer) => {
      return customer.initialDebt;
    };
    {
      handleSearch();
    }
    MobileHeader($$renderer2, {
      title: "客户",
      showBack: true,
      showSearch: true,
      showActions: true,
      backgroundColor: "bg-blue-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="添加客户"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="p-4">`);
    if (filteredCustomers.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center py-12"><svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg> <p class="text-gray-500 mb-4">${escape_html("还没有客户数据")}</p> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">添加第一个客户</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(filteredCustomers);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let customer = each_array_1[$$index_1];
        $$renderer2.push(`<div class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="font-medium text-gray-900 mb-1">${escape_html(customer.name)}</h3> <div class="text-sm text-gray-600 space-y-1">`);
        if (customer.category) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span> ${escape_html(customer.category)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (customer.phone) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> ${escape_html(formatPhone(customer.phone))}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (customer.address) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span class="truncate">${escape_html(customer.address)}</span></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div> `);
        if (getCustomerDebt(customer) > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="text-right"><div class="text-xs text-gray-500">欠款</div> <div class="text-sm font-medium text-red-600">¥${escape_html(getCustomerDebt(customer).toFixed(2))}</div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

import { V as ensure_array_like, W as attr_class, Y as stringify } from "../../../../chunks/index2.js";
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
    let invoices = [];
    let filteredInvoices = [];
    let customers = [];
    let searchKeyword = "";
    let sortBy = "date";
    let statistics = {
      unpaidAmount: 0,
      todaySales: 0
    };
    const statusOptions = [
      { id: "all", name: "全部", color: "text-gray-600" },
      { id: "draft", name: "草稿", color: "text-yellow-600" },
      { id: "sent", name: "已发送", color: "text-blue-600" },
      { id: "paid", name: "已付款", color: "text-green-600" },
      { id: "cancelled", name: "已取消", color: "text-red-600" }
    ];
    const handleSearch = () => {
      let filtered = invoices;
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter((invoice) => invoice.invoiceNumber.toLowerCase().includes(keyword) || invoice.customerInfo.name.toLowerCase().includes(keyword) || invoice.createdBy.toLowerCase().includes(keyword));
      }
      filteredInvoices = filtered;
      sortInvoices();
    };
    const sortInvoices = () => {
      filteredInvoices.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "amount":
            aValue = a.totalAmount;
            bValue = b.totalAmount;
            break;
          case "customer":
            aValue = a.customerInfo.name.toLowerCase();
            bValue = b.customerInfo.name.toLowerCase();
            break;
          default:
            return 0;
        }
        if (typeof aValue === "string") {
          return bValue.localeCompare(aValue);
        } else {
          return bValue - aValue;
        }
      });
    };
    const getCustomerName = (invoice) => {
      if (invoice.customerId) {
        const customer = customers.find((c) => c.id === invoice.customerId);
        return customer ? customer.name : invoice.customerInfo.name;
      }
      return invoice.customerInfo.name;
    };
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("zh-CN");
    };
    const formatCurrency = (amount) => {
      return `¥${amount.toFixed(2)}`;
    };
    const getStatusDisplay = (invoice) => {
      const status = statusOptions.find((s) => s.id === invoice.status);
      return status || statusOptions[0];
    };
    {
      handleSearch();
    }
    MobileHeader($$renderer2, {
      title: "销售",
      showBack: true,
      showSearch: true,
      showActions: true,
      backgroundColor: "bg-red-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="创建销售单"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="p-4 bg-gray-50"><div class="grid grid-cols-2 gap-4"><div class="bg-white rounded-lg p-3 shadow-sm border"><div class="text-xs text-gray-500">今日销售</div> <div class="text-lg font-bold text-green-600">${escape_html(formatCurrency(statistics.todaySales))}</div></div> <div class="bg-white rounded-lg p-3 shadow-sm border"><div class="text-xs text-gray-500">未付金额</div> <div class="text-lg font-bold text-red-600">${escape_html(formatCurrency(statistics.unpaidAmount))}</div></div></div></div> <div class="p-4">`);
    if (filteredInvoices.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center py-12"><svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p class="text-gray-500 mb-4">${escape_html("还没有销售单")}</p> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">创建第一个销售单</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(filteredInvoices);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let invoice = each_array_1[$$index_1];
        $$renderer2.push(`<div class="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"><div class="flex items-start justify-between mb-3"><div><h3 class="font-medium text-gray-900">${escape_html(invoice.invoiceNumber)}</h3> <p class="text-sm text-gray-600">${escape_html(getCustomerName(invoice))}</p></div> <div class="text-right"><div class="text-lg font-bold text-gray-900">${escape_html(formatCurrency(invoice.totalAmount))}</div> <div${attr_class(`text-xs ${stringify(getStatusDisplay(invoice).color)}`)}>${escape_html(getStatusDisplay(invoice).name)}</div></div></div> <div class="flex items-center justify-between text-sm text-gray-500"><div class="flex items-center space-x-4"><span>${escape_html(formatDate(invoice.date))}</span> <span>制单人: ${escape_html(invoice.createdBy)}</span></div> <div class="flex items-center">`);
        if (invoice.paymentStatus !== "paid") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-red-600">未付: ${escape_html(formatCurrency(invoice.totalAmount - invoice.paidAmount))}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span class="text-green-600">已付款</span>`);
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

import { V as ensure_array_like, X as attr_style, Y as stringify } from "../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../chunks/MobileHeader.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let statistics = {
      todaySales: 0,
      weekSales: 0,
      monthSales: 0,
      yearSales: 0,
      // 客户统计
      totalCustomers: 0,
      activeCustomers: 0,
      totalDebt: 0,
      // 产品统计
      totalProducts: 0,
      activeProducts: 0,
      // 订单统计
      totalOrders: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      draftOrders: 0
    };
    let salesTrend = [];
    let topCustomers = [];
    let topProducts = [];
    const formatCurrency = (amount) => {
      return `¥${amount.toFixed(2)}`;
    };
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    MobileHeader($$renderer2, { title: "数据", showBack: true, backgroundColor: "bg-green-500" });
    $$renderer2.push(`<!----> <div class="p-4 space-y-6"><div class="grid grid-cols-2 gap-4"><div class="bg-white rounded-lg p-4 shadow-sm border"><div class="text-sm text-gray-500">今日销售</div> <div class="text-2xl font-bold text-green-600">${escape_html(formatCurrency(statistics.todaySales))}</div> <div class="text-xs text-gray-400 mt-1">本月: ${escape_html(formatCurrency(statistics.monthSales))}</div></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><div class="text-sm text-gray-500">总欠款</div> <div class="text-2xl font-bold text-red-600">${escape_html(formatCurrency(statistics.totalDebt))}</div> <div class="text-xs text-gray-400 mt-1">未付订单: ${escape_html(statistics.unpaidOrders)}</div></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><h3 class="font-medium text-gray-900 mb-4">销售统计</h3> <div class="grid grid-cols-2 gap-4"><div class="text-center"><div class="text-lg font-bold text-gray-900">${escape_html(formatCurrency(statistics.weekSales))}</div> <div class="text-sm text-gray-500">本周销售</div></div> <div class="text-center"><div class="text-lg font-bold text-gray-900">${escape_html(formatCurrency(statistics.yearSales))}</div> <div class="text-sm text-gray-500">本年销售</div></div></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><h3 class="font-medium text-gray-900 mb-4">近7天销售趋势</h3> <div class="space-y-2"><!--[-->`);
    const each_array = ensure_array_like(salesTrend);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let day = each_array[$$index];
      $$renderer2.push(`<div class="flex items-center justify-between"><span class="text-sm text-gray-600">${escape_html(formatDate(day.date))}</span> <div class="flex items-center space-x-2"><div class="w-20 bg-gray-200 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full"${attr_style(`width: ${stringify(Math.max(5, day.amount / Math.max(...salesTrend.map((d) => d.amount)) * 100))}%`)}></div></div> <span class="text-sm font-medium text-gray-900 w-16 text-right">${escape_html(formatCurrency(day.amount))}</span></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><h3 class="font-medium text-gray-900 mb-4">客户排行榜</h3> `);
    if (topCustomers.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-500 text-center py-4">暂无数据</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(topCustomers);
      for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
        let customer = each_array_1[index];
        $$renderer2.push(`<div class="flex items-center justify-between"><div class="flex items-center space-x-3"><div class="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">${escape_html(index + 1)}</div> <div><div class="font-medium text-gray-900">${escape_html(customer.name)}</div> <div class="text-xs text-gray-500">${escape_html(customer.count)} 笔订单</div></div></div> <div class="text-right"><div class="font-medium text-gray-900">${escape_html(formatCurrency(customer.amount))}</div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><h3 class="font-medium text-gray-900 mb-4">产品排行榜</h3> `);
    if (topProducts.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-500 text-center py-4">暂无数据</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_2 = ensure_array_like(topProducts);
      for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
        let product = each_array_2[index];
        $$renderer2.push(`<div class="flex items-center justify-between"><div class="flex items-center space-x-3"><div class="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">${escape_html(index + 1)}</div> <div><div class="font-medium text-gray-900">${escape_html(product.name)}</div> <div class="text-xs text-gray-500">销量: ${escape_html(product.count)}</div></div></div> <div class="text-right"><div class="font-medium text-gray-900">${escape_html(formatCurrency(product.amount))}</div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="bg-white rounded-lg p-4 shadow-sm border"><h3 class="font-medium text-gray-900 mb-4">业务概览</h3> <div class="grid grid-cols-2 gap-4"><div class="text-center"><div class="text-lg font-bold text-blue-600">${escape_html(statistics.totalCustomers)}</div> <div class="text-sm text-gray-500">总客户数</div> <div class="text-xs text-gray-400">活跃: ${escape_html(statistics.activeCustomers)}</div></div> <div class="text-center"><div class="text-lg font-bold text-orange-600">${escape_html(statistics.totalProducts)}</div> <div class="text-sm text-gray-500">总产品数</div> <div class="text-xs text-gray-400">在售: ${escape_html(statistics.activeProducts)}</div></div> <div class="text-center"><div class="text-lg font-bold text-green-600">${escape_html(statistics.totalOrders)}</div> <div class="text-sm text-gray-500">总订单数</div> <div class="text-xs text-gray-400">已付: ${escape_html(statistics.paidOrders)}</div></div> <div class="text-center"><div class="text-lg font-bold text-red-600">${escape_html(statistics.unpaidOrders)}</div> <div class="text-sm text-gray-500">未付订单</div> <div class="text-xs text-gray-400">草稿: ${escape_html(statistics.draftOrders)}</div></div></div></div></div>`);
  });
}
export {
  _page as default
};

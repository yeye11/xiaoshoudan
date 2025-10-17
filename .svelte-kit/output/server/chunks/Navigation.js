import { $ as store_get, V as ensure_array_like, a0 as attr, W as attr_class, Y as stringify, a1 as unsubscribe_stores } from "./index2.js";
import { p as page } from "./stores.js";
import { e as escape_html } from "./context.js";
function Navigation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentPath;
    const navItems = [
      { href: "/", label: "首页" },
      { href: "/invoice", label: "销售单生成器" },
      { href: "/sales-invoice-demo", label: "销售单演示" },
      { href: "/delivery", label: "送货单管理" },
      { href: "/delivery-demo", label: "送货单演示" },
      { href: "/final-image-solution", label: "图片保存方案" },
      { href: "/test-product-validation", label: "产品验证测试" },
      { href: "/android-build-guide", label: "📱 Android构建" },
      { href: "/build-summary", label: "🚀 构建总结" },
      { href: "/demo", label: "演示" },
      { href: "/colors", label: "颜色" },
      { href: "/test-colors", label: "测试颜色" }
    ];
    currentPath = store_get($$store_subs ??= {}, "$page", page).url.pathname;
    $$renderer2.push(`<nav class="bg-white shadow-sm border-b border-gray-200 mb-6"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex items-center"><a href="/" class="text-xl font-bold text-gray-900"><span class="text-blue-600">Cypridina</span> Client</a></div> <div class="flex items-center space-x-1"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class(`px-3 py-2 rounded-md text-sm font-medium transition-colors ${stringify(currentPath === item.href ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}`)}>${escape_html(item.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Navigation as N
};

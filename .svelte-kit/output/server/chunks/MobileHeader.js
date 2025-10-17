import { W as attr_class, Z as slot, _ as bind_props, Y as stringify } from "./index2.js";
import { f as fallback, e as escape_html } from "./context.js";
function MobileHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let title = fallback($$props["title"], "");
    let showBack = fallback($$props["showBack"], false);
    let showSearch = fallback($$props["showSearch"], false);
    let showActions = fallback($$props["showActions"], false);
    let backgroundColor = fallback($$props["backgroundColor"], "bg-blue-500");
    let textColor = fallback($$props["textColor"], "text-white");
    $$renderer2.push(`<header${attr_class(`sticky top-0 z-40 ${stringify(backgroundColor)} ${stringify(textColor)} shadow-sm`)}><div class="flex items-center justify-between h-14 px-4"><div class="flex items-center">`);
    if (showBack) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="p-2 -ml-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="返回"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="w-10"></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex-1 text-center"><h1 class="text-lg font-medium truncate px-4">${escape_html(title)}</h1></div> <div class="flex items-center space-x-2">`);
    if (showSearch) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="搜索"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showActions) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "actions", {}, () => {
        $$renderer2.push(`<button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="添加"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button>`);
      });
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="w-10"></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <!--[-->`);
    slot($$renderer2, $$props, "subtitle", {}, null);
    $$renderer2.push(`<!--]--></header>`);
    bind_props($$props, {
      title,
      showBack,
      showSearch,
      showActions,
      backgroundColor,
      textColor
    });
  });
}
export {
  MobileHeader as M
};

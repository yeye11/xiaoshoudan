import { a2 as head } from "../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../chunks/MobileHeader.js";
import "html2canvas";
import "../../../../../chunks/MobileImageExport.svelte_svelte_type_style_lang.js";
import "../../../../../chunks/DeliveryNote.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>送货单详情 - 仁腾装饰材料管理系统</title>`);
      });
    });
    MobileHeader($$renderer2, {
      title: "送货单详情",
      showBack: true,
      backgroundColor: "bg-green-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions">`);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> <button class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="打印"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> <div class="p-4 space-y-6 mobile-content svelte-1wqlfg8">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div> <p class="text-gray-500 mt-2">加载中...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

import { $ as store_get, a1 as unsubscribe_stores, a0 as attr } from "../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../chunks/MobileHeader.js";
import { p as page } from "../../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let invoice = null;
    let products = [];
    let isSubmitting = false;
    if (store_get($$store_subs ??= {}, "$page", page)?.url && products.length > 0 && invoice) ;
    MobileHeader($$renderer2, {
      title: "新建销售单",
      showBack: true,
      backgroundColor: "bg-red-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button${attr("disabled", isSubmitting, true)} class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors disabled:opacity-50" aria-label="保存"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};

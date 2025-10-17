import { a0 as attr } from "../../../../../../chunks/index2.js";
import { M as MobileHeader } from "../../../../../../chunks/MobileHeader.js";
import { c as createEmptyInvoice } from "../../../../../../chunks/invoice.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    createEmptyInvoice();
    let isSubmitting = false;
    MobileHeader($$renderer2, {
      title: "编辑销售单",
      showBack: true,
      backgroundColor: "bg-red-500",
      $$slots: {
        actions: ($$renderer3) => {
          $$renderer3.push(`<div slot="actions"><button${attr("disabled", isSubmitting, true)} class="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors disabled:opacity-50" aria-label="保存"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></button></div>`);
        }
      }
    });
    $$renderer2.push(`<!----> <div class="p-4 space-y-6">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div> <p class="text-gray-500 mt-2">加载中...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

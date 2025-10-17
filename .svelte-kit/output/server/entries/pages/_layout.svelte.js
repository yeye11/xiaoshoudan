import { V as ensure_array_like, W as attr_class, X as attr_style, Y as stringify, Z as slot, _ as bind_props } from "../../chunks/index2.js";
import "clsx";
import { w as writable } from "../../chunks/index.js";
import { b as ssr_context, e as escape_html } from "../../chunks/context.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function ToastHost($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let toasts = [];
    const unsub = store.subscribe((v) => toasts = v);
    onDestroy(unsub);
    $$renderer2.push(`<div class="toast-layer svelte-1nomv24" aria-live="polite" aria-atomic="true"><!--[-->`);
    const each_array = ensure_array_like(toasts);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let t = each_array[i];
      $$renderer2.push(`<div${attr_class(`toast-item ${stringify(t.type)}`, "svelte-1nomv24")}${attr_style(`--offset: ${stringify(i * 56)}px`)}>${escape_html(t.message)}</div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const store = writable([]);
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = $$props["data"];
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--> `);
    ToastHost($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { data });
  });
}
export {
  _layout as default
};

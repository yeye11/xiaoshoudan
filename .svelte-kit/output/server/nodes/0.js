

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.B6r57KK5.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/XlqFUZ3x.js","_app/immutable/chunks/nbkepknC.js","_app/immutable/chunks/BYJuMw6P.js","_app/immutable/chunks/Cs9q_1e7.js","_app/immutable/chunks/D_8yISCJ.js","_app/immutable/chunks/DVrF0WE5.js","_app/immutable/chunks/_ETppkhr.js","_app/immutable/chunks/DwQhc35S.js"];
export const stylesheets = ["_app/immutable/assets/0.CTLi288Y.css"];
export const fonts = [];



export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.D5mJlSEM.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/BvNKmLqF.js","_app/immutable/chunks/D2QV5ZPr.js","_app/immutable/chunks/BVH4iQq0.js","_app/immutable/chunks/BR_REAzN.js","_app/immutable/chunks/GeVYpaAz.js","_app/immutable/chunks/IKNvqO1Y.js","_app/immutable/chunks/Baws9BAC.js","_app/immutable/chunks/DaZe8rAl.js","_app/immutable/chunks/BCgAnOdk.js"];
export const stylesheets = ["_app/immutable/assets/0.C6XL8xeZ.css"];
export const fonts = [];

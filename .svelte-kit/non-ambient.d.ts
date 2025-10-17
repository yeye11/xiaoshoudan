
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/delivery" | "/invoice" | "/mobile" | "/mobile/customers" | "/mobile/customers/new" | "/mobile/customers/[id]" | "/mobile/customers/[id]/edit" | "/mobile/data" | "/mobile/delivery" | "/mobile/delivery/[id]" | "/mobile/products" | "/mobile/products/new" | "/mobile/profile" | "/mobile/sales" | "/mobile/sales/new" | "/mobile/sales/[id]" | "/mobile/sales/[id]/edit" | "/mobile/service";
		RouteParams(): {
			"/mobile/customers/[id]": { id: string };
			"/mobile/customers/[id]/edit": { id: string };
			"/mobile/delivery/[id]": { id: string };
			"/mobile/sales/[id]": { id: string };
			"/mobile/sales/[id]/edit": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/delivery": Record<string, never>;
			"/invoice": Record<string, never>;
			"/mobile": { id?: string };
			"/mobile/customers": { id?: string };
			"/mobile/customers/new": Record<string, never>;
			"/mobile/customers/[id]": { id: string };
			"/mobile/customers/[id]/edit": { id: string };
			"/mobile/data": Record<string, never>;
			"/mobile/delivery": { id?: string };
			"/mobile/delivery/[id]": { id: string };
			"/mobile/products": Record<string, never>;
			"/mobile/products/new": Record<string, never>;
			"/mobile/profile": Record<string, never>;
			"/mobile/sales": { id?: string };
			"/mobile/sales/new": Record<string, never>;
			"/mobile/sales/[id]": { id: string };
			"/mobile/sales/[id]/edit": { id: string };
			"/mobile/service": Record<string, never>
		};
		Pathname(): "/" | "/delivery" | "/delivery/" | "/invoice" | "/invoice/" | "/mobile" | "/mobile/" | "/mobile/customers" | "/mobile/customers/" | "/mobile/customers/new" | "/mobile/customers/new/" | `/mobile/customers/${string}` & {} | `/mobile/customers/${string}/` & {} | `/mobile/customers/${string}/edit` & {} | `/mobile/customers/${string}/edit/` & {} | "/mobile/data" | "/mobile/data/" | "/mobile/delivery" | "/mobile/delivery/" | `/mobile/delivery/${string}` & {} | `/mobile/delivery/${string}/` & {} | "/mobile/products" | "/mobile/products/" | "/mobile/products/new" | "/mobile/products/new/" | "/mobile/profile" | "/mobile/profile/" | "/mobile/sales" | "/mobile/sales/" | "/mobile/sales/new" | "/mobile/sales/new/" | `/mobile/sales/${string}` & {} | `/mobile/sales/${string}/` & {} | `/mobile/sales/${string}/edit` & {} | `/mobile/sales/${string}/edit/` & {} | "/mobile/service" | "/mobile/service/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/game_item/game_hongzhong.png" | "/game_item/game_paodekuai.png" | "/game_item/game_tuiduizi.png" | "/show_bg_1.png" | "/svelte.svg" | "/tauri.svg" | "/vite.svg" | "/zp_desk_2.png" | string & {};
	}
}
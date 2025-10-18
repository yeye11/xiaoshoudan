export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/mobile": [4,[2]],
		"/mobile/customers": [5,[2]],
		"/mobile/customers/new": [8,[2]],
		"/mobile/customers/[id]": [6,[2]],
		"/mobile/customers/[id]/edit": [7,[2]],
		"/mobile/data": [9,[2]],
		"/mobile/delivery/[id]": [10,[2]],
		"/mobile/products": [11,[2]],
		"/mobile/products/new": [12,[2]],
		"/mobile/profile": [13,[2]],
		"/mobile/sales": [14,[2]],
		"/mobile/sales/new": [17,[2]],
		"/mobile/sales/[id]": [15,[2]],
		"/mobile/sales/[id]/edit": [16,[2]],
		"/mobile/service": [18,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';
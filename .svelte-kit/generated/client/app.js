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
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/delivery": [4],
		"/invoice": [5],
		"/mobile": [6,[2]],
		"/mobile/customers": [7,[2]],
		"/mobile/customers/new": [10,[2]],
		"/mobile/customers/[id]": [8,[2]],
		"/mobile/customers/[id]/edit": [9,[2]],
		"/mobile/data": [11,[2]],
		"/mobile/delivery/[id]": [12,[2]],
		"/mobile/products": [13,[2]],
		"/mobile/products/new": [14,[2]],
		"/mobile/profile": [15,[2]],
		"/mobile/sales": [16,[2]],
		"/mobile/sales/new": [19,[2]],
		"/mobile/sales/[id]": [17,[2]],
		"/mobile/sales/[id]/edit": [18,[2]],
		"/mobile/service": [20,[2]]
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
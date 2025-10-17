import ToastHost from './ToastHost.svelte';
import { writable, type Writable } from 'svelte/store';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number; // ms
  createdAt: number;
}

const store: Writable<ToastItem[]> = writable([]);
let idSeq = 1;

export function showToast(message: string, type: ToastType = 'info', duration = 1800) {
  const id = idSeq++;
  const item: ToastItem = { id, message, type, duration, createdAt: Date.now() };
  store.update((arr) => [...arr, item]);
  // 自动移除
  setTimeout(() => {
    store.update((arr) => arr.filter((t) => t.id !== id));
  }, duration);
}

export { ToastHost, store as toastStore };


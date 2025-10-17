<script lang="ts">
  import { createInertiaApp } from '@inertiajs/svelte';
  import { mount } from 'svelte';

  // This component will be used to initialize Inertia.js
  // You'll need to configure this based on your backend setup
  
  createInertiaApp({
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.svelte', { eager: true });
      return pages[`../pages/${name}.svelte`];
    },
    setup({ el, App, props }) {
      mount(App, { target: el, props });
    },
  });


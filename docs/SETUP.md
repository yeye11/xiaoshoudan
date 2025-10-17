# Cypridina Client Setup

This document describes the setup of Inertia.js and shadcn-svelte in the cypridina-client project.

## ✅ Completed Installation

### 1. Inertia.js for Svelte
- ✅ Installed `@inertiajs/svelte` package
- ✅ Created InertiaApp component template at `src/lib/components/InertiaApp.svelte`

### 2. shadcn-svelte Component Library
- ✅ Installed Tailwind CSS and required dependencies:
  - `tailwindcss`
  - `postcss`
  - `autoprefixer`
  - `@tailwindcss/typography`
  - `@tailwindcss/forms`
  - `@tailwindcss/container-queries`
  - `tailwind-variants`
  - `clsx`
  - `tailwind-merge`

- ✅ Created configuration files:
  - `tailwind.config.js` - Tailwind configuration with shadcn-svelte theme
  - `postcss.config.js` - PostCSS configuration
  - `components.json` - shadcn-svelte CLI configuration

- ✅ Created utility files:
  - `src/app.css` - Global styles with Tailwind directives and CSS variables
  - `src/lib/utils.ts` - Utility function for class name merging
  - `src/routes/+layout.svelte` - Root layout importing global styles

- ✅ Updated `svelte.config.js` with `$lib` alias

## 📋 Next Steps

### For Inertia.js Setup:

1. **Configure your backend** to serve Inertia responses:
   - Set up Inertia.js on your backend (Laravel, Rails, Django, etc.)
   - Configure the backend to return Inertia responses with the correct page components

2. **Update app initialization**:
   - Modify `src/routes/+page.svelte` or create a dedicated entry point
   - Initialize Inertia with your page resolver
   - Example:
   ```svelte
   <script lang="ts">
     import { createInertiaApp } from '@inertiajs/svelte';
     import { mount } from 'svelte';

     createInertiaApp({
       resolve: (name) => {
         const pages = import.meta.glob('./pages/**/*.svelte', { eager: true });
         return pages[`./pages/${name}.svelte`];
       },
       setup({ el, App, props }) {
         mount(App, { target: el, props });
       },
     });
   </script>
   ```

3. **Create Inertia page components**:
   - Create a `src/lib/pages` directory for your Inertia page components
   - Each page component will receive props from your backend

4. **Configure Inertia links**:
   - Use `<Link>` component from `@inertiajs/svelte` for navigation
   - Example: `<Link href="/dashboard">Dashboard</Link>`

### For shadcn-svelte Setup:

1. **Add components using the CLI**:
   ```bash
   pnpm dlx shadcn-svelte@latest add button
   pnpm dlx shadcn-svelte@latest add card
   pnpm dlx shadcn-svelte@latest add input
   # ... add more components as needed
   ```

2. **Use components in your pages**:
   ```svelte
   <script lang="ts">
     import { Button } from '$lib/components/ui/button';
     import { Card } from '$lib/components/ui/card';
   </script>

   <Card>
     <Button>Click me</Button>
   </Card>
   ```

3. **Customize theme** (optional):
   - Modify CSS variables in `src/app.css`
   - Update colors in `tailwind.config.js`

## 🚀 Development

Run the development server:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

## 📚 Documentation

- [Inertia.js Documentation](https://inertiajs.com/)
- [Inertia.js Svelte Adapter](https://inertiajs.com/client-side-setup)
- [shadcn-svelte Documentation](https://shadcn-svelte.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn-svelte CLI configuration
- `svelte.config.js` - SvelteKit configuration
- `vite.config.js` - Vite configuration

## 📁 Project Structure

```
cypridina-client/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── InertiaApp.svelte (template)
│   │   │   └── ui/ (shadcn components will be added here)
│   │   ├── pages/ (create this for Inertia pages)
│   │   └── utils.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   └── +page.svelte
│   └── app.css
├── components.json
├── tailwind.config.js
└── postcss.config.js
```


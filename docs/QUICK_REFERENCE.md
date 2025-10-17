# Quick Reference Guide

## 🚀 Getting Started

### Start Development Server
```bash
cd cypridina-client
pnpm dev
```
Then visit: http://localhost:1420/demo

## 📦 Adding shadcn-svelte Components

### Install a Component
```bash
pnpm dlx shadcn-svelte@latest add [component-name]
```

### Popular Components
```bash
# UI Components
pnpm dlx shadcn-svelte@latest add button
pnpm dlx shadcn-svelte@latest add card
pnpm dlx shadcn-svelte@latest add input
pnpm dlx shadcn-svelte@latest add label
pnpm dlx shadcn-svelte@latest add textarea
pnpm dlx shadcn-svelte@latest add select

# Layout Components
pnpm dlx shadcn-svelte@latest add dialog
pnpm dlx shadcn-svelte@latest add dropdown-menu
pnpm dlx shadcn-svelte@latest add popover
pnpm dlx shadcn-svelte@latest add sheet
pnpm dlx shadcn-svelte@latest add tabs

# Feedback Components
pnpm dlx shadcn-svelte@latest add alert
pnpm dlx shadcn-svelte@latest add toast
pnpm dlx shadcn-svelte@latest add progress
pnpm dlx shadcn-svelte@latest add skeleton

# Data Display
pnpm dlx shadcn-svelte@latest add table
pnpm dlx shadcn-svelte@latest add badge
pnpm dlx shadcn-svelte@latest add avatar
```

### Use a Component
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';

  function handleClick() {
    console.log('Button clicked!');
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Hello World</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onclick={handleClick}>Click me</Button>
  </CardContent>
</Card>
```

**Note**: Svelte 5 uses `onclick` instead of `on:click` for event handlers.

## 🎨 Button Variants

```svelte
<Button onclick={() => console.log('clicked')}>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## 🎨 Button Sizes

```svelte
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

## 🎯 Svelte 5 Event Handling

Svelte 5 changed event handling syntax:

**Old (Svelte 4):**
```svelte
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
```

**New (Svelte 5):**
```svelte
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
```

Common events:
- `onclick` - Click events
- `oninput` - Input events
- `onchange` - Change events
- `onsubmit` - Form submit
- `onkeydown` - Keyboard events
- `onmouseenter` / `onmouseleave` - Mouse events

## 🔧 Utility Functions

### Class Name Merging
```typescript
import { cn } from '$lib/utils';

const className = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
);
```

## 🎨 Tailwind CSS Classes

### Layout
```html
<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- content -->
  </div>
</div>
```

### Spacing
```html
<div class="p-4">Padding</div>
<div class="m-4">Margin</div>
<div class="space-y-4">Vertical spacing between children</div>
<div class="space-x-4">Horizontal spacing between children</div>
```

### Typography
```html
<h1 class="text-4xl font-bold">Heading</h1>
<p class="text-muted-foreground">Muted text</p>
<p class="text-sm">Small text</p>
```

### Colors (Theme-aware)
```html
<div class="bg-primary text-primary-foreground">Primary</div>
<div class="bg-secondary text-secondary-foreground">Secondary</div>
<div class="bg-accent text-accent-foreground">Accent</div>
<div class="bg-muted text-muted-foreground">Muted</div>
<div class="bg-destructive text-destructive-foreground">Destructive</div>
```

### Borders & Rounded Corners
```html
<div class="border rounded-lg">Rounded border</div>
<div class="border-2 border-primary">Colored border</div>
<div class="rounded-md">Medium rounded</div>
```

## 🌙 Dark Mode

Dark mode is automatically supported via CSS variables. The theme switches based on system preferences or can be controlled programmatically.

### CSS Variables
```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## 🔗 Inertia.js Usage

### Create a Page Component
```svelte
<!-- src/lib/pages/Dashboard.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  
  // Props passed from backend
  export let user: { name: string; email: string };
</script>

<div class="container mx-auto p-8">
  <h1>Welcome, {user.name}!</h1>
  <p>{user.email}</p>
</div>
```

### Use Inertia Links
```svelte
<script lang="ts">
  import { Link } from '@inertiajs/svelte';
</script>

<Link href="/dashboard">Dashboard</Link>
<Link href="/profile" class="text-primary">Profile</Link>
```

### Form Handling
```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte';
  
  const form = useForm({
    name: '',
    email: '',
  });
  
  function submit() {
    $form.post('/users');
  }
</script>

<form on:submit|preventDefault={submit}>
  <input bind:value={$form.name} />
  <input bind:value={$form.email} />
  <button type="submit" disabled={$form.processing}>
    Submit
  </button>
</form>
```

## 📁 File Locations

- **Components**: `src/lib/components/ui/`
- **Pages (Inertia)**: `src/lib/pages/`
- **Utils**: `src/lib/utils.ts`
- **Global Styles**: `src/app.css`
- **Routes**: `src/routes/`

## 🔍 Common Patterns

### Card with Button
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
</script>

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p class="text-muted-foreground mb-4">Card content goes here.</p>
    <Button>Action</Button>
  </CardContent>
</Card>
```

### Form with Input
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  
  let name = $state('');
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label for="name">Name</Label>
    <Input id="name" bind:value={name} placeholder="Enter your name" />
  </div>
  <Button>Submit</Button>
</div>
```

## 📚 Documentation Links

- [shadcn-svelte Components](https://shadcn-svelte.com/docs/components)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Inertia.js Docs](https://inertiajs.com/)
- [Svelte 5 Docs](https://svelte.dev/docs)

## 💡 Tips

1. **Use `cn()` utility** for conditional classes
2. **Leverage Tailwind's responsive prefixes**: `md:`, `lg:`, `xl:`
3. **Use theme colors** instead of hardcoded colors for dark mode support
4. **Install components as needed** - don't install everything at once
5. **Check shadcn-svelte docs** for component-specific props and examples

---

Happy coding! 🚀


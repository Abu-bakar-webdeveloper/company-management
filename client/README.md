# BIZFLOW Client

In-house Operations Management System — React + Vite + TypeScript.

## Structure

Feature-sliced layout with a thin app shell and shared primitives:

```
src/
  app/                    # Router, layouts, providers, shell (header/sidebar)
    layouts/
    providers/
    shell/
    router.tsx
  features/               # Domain modules (one folder per business area)
    {feature}/
      api/                # Data access (HTTP or mock adapters)
      lib/                # Feature-specific pure helpers
      model/              # Types, Zod schemas, constants, mock data
      pages/              # Route entry components
      ui/                 # Presentational components
      index.ts            # Public exports for routing
  shared/
    api/                  # HTTP client
    lib/                  # Cross-feature utilities (pagination, string helpers)
    ui/                   # Design system primitives (Button, FormField, etc.)
  main.tsx
  index.css               # Tailwind v4 design tokens
```

### Feature modules

`auth`, `dashboard`, `employees`, `expenses`, `leave`, `performance`, `projects`, `reports`, `settings`, `team`

### Import conventions

- Use the `@/` path alias (`@/shared/ui/FormField`, `@/features/employees`).
- Import **pages and guards** from feature `index.ts` barrels in the router.
- Import **shared primitives** from `@/shared/ui` or `@/shared/lib` for reusable UI and helpers.
- Keep feature `lib/` for domain-specific logic only; move generic helpers to `shared/lib/`.

## Scripts

```bash
npm install
npm run dev      # Start dev server
npm run build    # Type-check and production build
npm run lint     # ESLint
```

## Figma sync

Auth UI was scaffolded without live Figma access. Once access is available, design tokens in `index.css` can be aligned to the [Figma file](https://www.figma.com/design/TOYn5NnufEnqfNbAnGDnQV/BIZFLOW-In-house-Operations-Management-System).

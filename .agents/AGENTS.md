# TechFix Workspace Rules

These guidelines are scoped to this workspace and must be adhered to for all development tasks.

## 1. Frontend Architecture Guidelines (from `frontend_arch.md`)

- **Folder Structure**:
  - `app/` contains page routing and layouts.
  - `features/[feature]/` contains feature-specific code (components, hooks, api, store, types, utils).
  - `components/` contains shared UI components with *zero* business logic (divided into `ui/`, `layout/`, `feedback/`, `search/`).
  - `lib/` contains shared utilities like `apiClient.ts`, `queryClient.ts`, and Zod validators.
- **Separation of Concerns Rules**:
  - **Page entry point** (`app/.../page.tsx`): Only layouts/routing. *Never* write business logic here.
  - **Feature UI** (`features/[feature]/components`): Feature-specific UI. *Never* place in `app/` or `components/ui/`.
  - **API calls** (`features/[feature]/api`): API functions. *Never* call raw APIs inside components.
  - **Data fetching** (`features/[feature]/hooks`): Hooks for React Query. *Never* fetch data directly in page files.
  - **Feature state** (`features/[feature]/store`): Zustand or other feature-specific state. *Never* use a single monolithic global store unless necessary.
  - **Reusable primitives** (`components/ui`): Raw design elements (buttons, inputs). *Never* embed feature logic here.
  - **Shared utilities** (`lib/`): Cross-cutting libraries. *Never* isolate inside features if they are shared.
  - **Route definitions**: Handled by Next.js app directory router structure. *Never* hardcode routes directly in component routing tables.
- **Rendering Strategy**:
  - Homepage, product listings, and repair listings should be **Server-side Rendered (SSR)**.
  - Repair tracker and order status should be **Client components with live polling**.
  - Estimate form, booking flow, and shopping cart should be **Client components for interactivity**.

---

## 2. Design Guide & UX Laws (from `Design_guide.md`)

- **Visual Identity**:
  - **System**: TechFix Kinetic.
  - **Color**: Deep Navy base (`#000B2E`) with Vibrant Blue actions/buttons.
  - **Cards**: Glassmorphic styling on Deep Navy.
  - **Icons**: Every icon must have visible text labels beneath it—no standalone icons.
  - **Typography**: Headings 20pt, Body 14pt minimum. Avoid browser defaults.
- **UX Laws**:
  - **Primary CTAs**: Minimum 48px height, vibrant blue.
  - **Form fields**: Inline labels that persist on focus.
  - **Status indicators**: Must combine color, text, and icon.
  - **Comparison views**: Equal-width side-by-side columns (max 3).
  - **Progress indicators**: Show progress bar with "Step X of Y" on multi-step flows.
  - **Empty search states**: Always show suggestions and contact support link.
  - **Repair tracker**: Exactly 5 stages: *Received* → *Diagnosing* → *Repairing* → *Ready for Pickup* → *Delivered*. Highlight the current stage and estimated date.

---

## 3. Backend Architecture Guidelines (from `backend_arch.md`)

- **Layered Architecture with Feature-Based Folders**:
  - **Routes** (`routes/`): Entrypoints, middleware wiring, no business logic.
  - **Controllers** (`controllers/[feature]/`): Sanitizes requests, routes flow, sends response, no business logic.
  - **Services** (`services/[feature]/`): Core business logic, validation, orchestrations. Does not touch DB or req/res.
  - **Repositories** (`repositories/[feature]/`): Direct database query layer using Mongoose/MongoDB.
  - **Models** (`models/[feature]/`): Database schemas.
  - **DTOs** (`dtos/[feature]/`): Zod validation schemas.
  - **Middlewares** (`middlewares/`): Centralized auth, errors, rate limiting.

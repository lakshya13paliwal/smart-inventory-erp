# replit.md

## Overview

Smart Inventory ERP is a full-stack web application for intelligent inventory management. It provides features for product/inventory tracking, supplier management, demand forecasting (with chart visualizations), team/credits management, and enterprise settings. The application is localized for Indian markets (₹ currency, DD/MM/YYYY dates) and includes AI/ML-powered demand forecasting capabilities. Authentication is cookie-based using email/password via Passport.js.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no dedicated client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (Inter for body, Outfit for display)
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Charts**: Recharts for data visualization (forecasting, analytics)
- **Animations**: Framer Motion for page transitions and UI effects
- **Icons**: Lucide React
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js (ESM modules)
- **Authentication**: Passport.js with Local Strategy, session-based auth stored in PostgreSQL via `connect-pg-simple`
- **Password Security**: scrypt hashing with random salt
- **API Design**: RESTful JSON API. All routes are defined as a typed contract in `shared/routes.ts` with Zod schemas for request/response validation
- **Build**: esbuild for server bundling, Vite for client bundling. Dev mode uses Vite middleware for HMR

### Shared Layer (`shared/`)
- **Schema**: `shared/schema.ts` defines all database tables using Drizzle ORM and exports Zod insert schemas via `drizzle-zod`
- **Routes Contract**: `shared/routes.ts` defines the full API contract (paths, methods, input/output Zod schemas) shared between client and server for type safety

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema changes
- **Migrations**: Output to `./migrations` directory
- **Tables**: `users`, `suppliers`, `products`, `sales`, `team_members`, `settings`, plus `session` (auto-created by connect-pg-simple)

### Key Database Tables
- **users**: Authentication (email, hashed password, name, role)
- **products**: Inventory items with SKU, stock levels, reorder thresholds, pricing in INR, linked to suppliers
- **suppliers**: Vendor information with reliability scores (0-100)
- **sales**: Historical sales data for forecasting (product reference, quantity, date)
- **team_members**: Project contributor information
- **settings**: Enterprise configuration (country, currency, address format, org name)

### Authentication Flow
- Cookie-based sessions with 30-day expiry
- Sessions persisted in PostgreSQL
- Protected routes redirect unauthenticated users to `/auth`
- Login/register forms on a single auth page with tabs

### Key Scripts
- `npm run dev` — Start development server with HMR
- `npm run build` — Build client (Vite) and server (esbuild) to `dist/`
- `npm start` — Run production build
- `npm run db:push` — Push Drizzle schema to database
- `npm run check` — TypeScript type checking

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database. Must be provisioned and `DATABASE_URL` environment variable set
- **Session Secret**: `SESSION_SECRET` env var recommended for production (defaults to "secret" in dev)

### Key npm Packages
- **drizzle-orm** + **drizzle-kit** + **drizzle-zod**: ORM, migrations, and schema-to-Zod conversion
- **express** (v5): HTTP server
- **passport** + **passport-local**: Authentication
- **connect-pg-simple**: PostgreSQL session store
- **pg**: PostgreSQL client (node-postgres)
- **@tanstack/react-query**: Server state management
- **recharts**: Chart/graph library for forecasting visualizations
- **framer-motion**: Animation library
- **react-hook-form** + **zod**: Form handling and validation
- **wouter**: Client-side routing
- **date-fns**: Date formatting utilities
- **shadcn/ui ecosystem**: Radix UI, class-variance-authority, clsx, tailwind-merge

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Dev tooling (dev only)
- **@replit/vite-plugin-dev-banner**: Dev banner (dev only)
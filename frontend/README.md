# Velvra Frontend

Next.js frontend application for Velvra Coffee Shop Management Platform.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query
- Axios
- Zustand
- Lucide Icons

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

The application runs at `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Velvra
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev        # Start development server
npm run type-check # Run TypeScript type checking
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Implemented Screens

- `/` — Single-page landing (Hero, About, Features, Menu, Testimonials, Locations, CTA, Footer)

## Project Structure

```text
app/                  App Router pages and global CSS
components/
  landing/            Landing page section components
  ui/                 Reusable UI components
lib/                  API client, auth helpers, query functions
store/                Zustand client state
types/                Shared TypeScript types
public/images/        Static images and product photos
```

## Backend Integration

The API client uses `NEXT_PUBLIC_API_URL` and automatically attaches `velvra_access_token` from `localStorage` as a Bearer token.

Query helpers are in `lib/queries.ts` for health, branches, products, and orders.

## Validation

```bash
npm run type-check
npm run build
```
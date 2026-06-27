# UPSC Dashboard

Next.js dashboard for UPSC attempt tracking, revision scheduling, consistency analytics, and syllabus mastery visualization.

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Redux Toolkit`
- `TanStack Query`
- `Recharts`
- `React Flow`

## Scripts

- `npm run dev` starts the frontend locally on port `3000`
- `npm run build` creates the production build
- `npm run start` runs the production build
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files

## Backend

The dashboard expects the Express backend in `../backend` to be running. By default the frontend calls `http://localhost:5000`.

To override that base URL, set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

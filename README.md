# FlashProp AR

Gestión de cartera inmobiliaria con scraping de Idealista.

## Features

- CRUD de pisos (alquiler/compra)
- Filtros por tipo, provincia, barrio, precio, superficie
- Estadísticas por barrio (precio medio, superficie, rentabilidad)
- Calculadora de rentabilidad
- Panel de contactos
- Autenticación de usuarios (admin/user)
- Importación desde HTML de Idealista
- Scraping con Playwright (Python)

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Auth:** NextAuth.js (credentials)
- **Scraping:** Python + Playwright

## Installation

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
npm run db:push
npm run dev
```

## Scripts

- `npm run dev` — Dev server
- `npm run build` — Build
- `npm run db:push` — Sync schema
- `npm run db:studio` — Prisma Studio
- `npm run db:import <file.json>` — Import listings from JSON

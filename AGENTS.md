# Agent Guidelines for pplx

## Commands
- **Build**: `bun run build` (Next.js with Turbopack)
- **Dev**: `bun run dev` (Next.js with Turbopack)
- **Lint**: `bun run lint` (ESLint with Next.js config)
- **Typecheck**: `bun run typecheck` (TypeScript strict mode)
- **Check**: `bun run check` (lint + typecheck)
- **DB**: `bun run db:migrate`, `bun run db:generate`, `bun run db:push`

## Code Style
- **Language**: TypeScript with strict mode enabled
- **Framework**: Next.js 15 with App Router
- **Imports**: React → third-party → local (@/ prefix)
- **Naming**: camelCase (functions/vars), PascalCase (components)
- **Types**: Strong typing required, use interfaces for objects
- **Error Handling**: Try-catch blocks, console.error for logging
- **Validation**: Use Zod schemas for API inputs
- **Styling**: Tailwind CSS with clsx/cn utility
- **Formatting**: Follow ESLint rules, no extra semicolons
- **Components**: Functional components with TypeScript props
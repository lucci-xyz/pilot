# Agents.md — AI Agent Reference

## Purpose

Pilot is a budget management app for AI agents. Users create a project, receive a **Solana USDC vault address**, define budgets for agents, fund the vault, and run agent scripts that spend from that budget. Pilot tracks usage and enforces spending limits in real-time.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma 7** + **Neon** (PostgreSQL)
- **Recharts** for charts
- **Solana** for USDC vaults (pending integration)

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, forgot-password
│   ├── (dashboard)/         # Main app (requires auth)
│   │   └── app/
│   │       ├── page.tsx             # Overview dashboard
│   │       ├── account/             # User settings, API keys
│   │       ├── billing/             # Usage & plan
│   │       └── projects/[id]/       # Project → Agent pages
│   └── layout.tsx           # Root layout
├── components/
│   ├── app/                 # App-specific (sidebar, charts, cards)
│   └── ui/                  # shadcn/ui primitives
├── generated/prisma/        # Generated Prisma client
└── lib/
    ├── auth.ts              # Auth helpers
    ├── db.ts                # Prisma client
    ├── data/                # Data access layer
    ├── actions/             # Server actions
    └── utils.ts             # cn() helper

prisma/
├── schema.prisma            # Database schema
├── seed.ts                  # Seed script
└── migrations/              # Migration history
```

## Database

See [`docs/database.md`](docs/database.md) for full schema.

```
User
├── Session[]
├── ApiKey[]
└── Project[]
    ├── Vault { address, balance }
    └── Agent[]
        ├── AgentBudgetRule { dailyLimit, perTxLimit, monthlyLimit }
        └── Event[] { type: funding|spend, amount, status }
```

**Key rules:**
- Amounts in minor units (USDC has 6 decimals, so $1.00 = 1000000)
- Budget tracking: `dailySpent`, `monthlySpent` with reset timestamps
- Events track all funding and spend activity

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models |
| `src/lib/auth.ts` | Authentication helpers |
| `src/lib/data/*.ts` | Data access functions |
| `app/(dashboard)/layout.tsx` | Dashboard shell (requires auth) |
| `components/app/app-sidebar.tsx` | Main navigation |

## Patterns

- **Route groups**: `(auth)` = no sidebar, `(dashboard)` = with sidebar + auth required
- **Dynamic routes**: `[projectId]`, `[agentId]`
- **Currency formatting**: Use `Intl.NumberFormat` with USD
- **Status colors**: Green (active), Yellow (paused), Red (error), Gray (needs_setup)
- **Auth**: Use `requireAuth()` in server components

## Commands

```bash
npm run dev          # Start dev server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset + reseed database
```

## Current State

- ✅ Database schema complete (Prisma + Neon)
- ✅ Authentication (cookie-based sessions)
- ✅ UI wired to real database
- ✅ Seed script with test data
- ⏳ Solana vault integration pending
- ⏳ Agent SDK for budget spending

## Next Steps

1. Solana wallet/vault integration
2. Agent SDK for budget spending
3. Webhook/API for agent spend tracking
4. Budget alerts and notifications

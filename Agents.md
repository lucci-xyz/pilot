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
│   ├── (auth)/          # Login, signup, forgot-password
│   ├── (dashboard)/     # Main app (has sidebar)
│   │   └── app/
│   │       ├── page.tsx           # Overview dashboard
│   │       ├── account/           # User settings, API keys
│   │       ├── billing/           # Subscription management
│   │       └── workspaces/[id]/   # Workspace → Project → Bot pages
│   └── layout.tsx       # Root layout (fonts, metadata)
├── components/
│   ├── app/             # App-specific (sidebar, charts, cards)
│   └── ui/              # shadcn/ui primitives
├── generated/prisma/    # Generated Prisma client (gitignored)
└── lib/
    ├── db.ts            # Prisma client singleton
    ├── dummy-data/      # Mock data (being replaced)
    └── utils.ts         # cn() helper

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history
```

## Database

See [`docs/database.md`](docs/database.md) for full schema.

```
Project
├── Vault { address, balance }
└── Agent[]
    ├── AgentBudgetRule { dailyLimit, perTxLimit, monthlyLimit }
    └── Event[] { type: funding|spend, amount, status }
```

**Key rules:**
- Amounts in minor units (USDC has 6 decimals)
- Budget tracking: `dailySpent`, `monthlySpent` with reset timestamps
- Events track all funding and spend activity

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models |
| `src/lib/db.ts` | Prisma client (Neon adapter) |
| `app/(dashboard)/layout.tsx` | Dashboard shell with sidebar |
| `components/app/app-sidebar.tsx` | Main navigation |
| `app/globals.css` | Theme variables (primary: `#d97757`) |

## Patterns

- **Route groups**: `(auth)` = no sidebar, `(dashboard)` = with sidebar
- **Dynamic routes**: `[workspaceId]`, `[projectId]`, `[botId]`
- **Currency formatting**: Use `Intl.NumberFormat` with USD
- **Status colors**: Green (active), Yellow (paused), Red (error), Gray (needs_setup)
- **Shadows**: Use `shadow-soft`, `shadow-soft-md`, `shadow-soft-lg`

## Current State

- ✅ Database schema complete (Prisma + Neon)
- ✅ UI built with dummy data
- ⏳ Auth is mocked (any login → `/app`)
- ⏳ Solana vault integration pending
- ⏳ Wire UI to real database

## Next Steps

1. Wire UI pages to Prisma queries
2. Solana wallet/vault integration
3. Real authentication (e.g., NextAuth)
4. Agent SDK for budget spending
5. Webhook/API for agent spend tracking

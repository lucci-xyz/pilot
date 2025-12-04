# Agents.md — AI Agent Reference

## Purpose

Pilot is a budget management app for AI agents. Users create a project, receive a **Solana USDC vault address**, define budgets for agents, fund the vault, and run agent scripts that spend from that budget. Pilot tracks usage and enforces spending limits in real-time.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
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
└── lib/
    ├── dummy-data/      # Mock data (to be replaced with real DB)
    └── utils.ts         # cn() helper
```

## Data Model

```
Workspace
└── Project
    ├── Vault { address, balance, limit }
    ├── Budget { allocated, spent, period }
    └── Bot (Agent)
        ├── Budget { allocated, spent }
        └── Status: active | paused | error | needs_setup
```

**Key types**: `src/lib/dummy-data/types.ts`

## Key Files

| File | Purpose |
|------|---------|
| `app/(dashboard)/layout.tsx` | Dashboard shell with sidebar |
| `components/app/app-sidebar.tsx` | Main navigation |
| `components/app/vault-card.tsx` | Balance + budget progress display |
| `components/app/status-badge.tsx` | Bot status indicators |
| `app/globals.css` | Theme variables (primary: `#d97757`) |

## Patterns

- **Route groups**: `(auth)` = no sidebar, `(dashboard)` = with sidebar
- **Dynamic routes**: `[workspaceId]`, `[projectId]`, `[botId]`
- **Currency formatting**: Use `Intl.NumberFormat` with USD
- **Status colors**: Green (active), Yellow (paused), Red (error), Gray (needs_setup)
- **Shadows**: Use `shadow-soft`, `shadow-soft-md`, `shadow-soft-lg`

## Current State

- UI is built with **dummy data** — no backend yet
- Branch `db-schema` indicates DB work in progress
- Auth is mocked (any login → `/app`)
- Solana vault integration is **not yet implemented**

## Next Steps (Likely)

1. Database schema + ORM setup
2. Solana wallet/vault integration
3. Real authentication
4. Agent SDK for budget spending
5. Webhook/API for agent spend tracking


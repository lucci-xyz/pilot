# Database Schema

PostgreSQL via **Prisma 7** + **Neon** (serverless).

## Tables

```
projects
├── vaults (1:1)
└── agents (1:many)
    ├── agent_budget_rules (1:1)
    └── events (1:many)
```

## Models

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | |
| description | string? | |
| status | string | `active` / `paused` / `archived` |

### `vaults`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| address | string | Solana USDC address (unique) |
| balance | bigint | Minor units (6 decimals) |
| projectId | string | FK → projects |

### `agents`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | |
| provider | string? | `openai`, `anthropic`, etc. |
| model | string? | `gpt-4o`, `claude-3`, etc. |
| status | string | `active` / `paused` / `error` / `needs_setup` |
| apiKeyHash | string? | For agent auth |
| projectId | string | FK → projects |

### `agent_budget_rules`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| dailyLimit | bigint | Max per day (minor units) |
| perTxLimit | bigint | Max per transaction |
| monthlyLimit | bigint? | Optional monthly cap |
| dailySpent | bigint | Tracks current day spend |
| monthlySpent | bigint | Tracks current month spend |
| lastResetAt | datetime | For daily reset logic |
| agentId | string | FK → agents (unique) |

### `events`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| type | string | `funding` or `spend` |
| amount | bigint | Positive = funding, negative = spend |
| status | string | `pending` / `confirmed` / `failed` |
| txHash | string? | Solana tx signature |
| metadata | string? | JSON (tokens, model, etc.) |
| vaultId | string | FK → vaults |
| agentId | string? | FK → agents (nullable) |

## Notes

- All amounts in **minor units** (USDC = 6 decimals, so $1.00 = 1000000)
- Cascade deletes: Project → Vault → Events; Project → Agents → Events
- Indexed: `events(vaultId, createdAt)`, `events(agentId, createdAt)`, `events(type, createdAt)`


# Database Schema

PostgreSQL via **Prisma 7** + **Neon** (serverless).

## Tables

```
users
├── sessions (1:many)
├── api_keys (1:many)
└── projects (1:many)
    └── vaults (1:1)
        └── events (1:many)
    └── agents (1:many)
        ├── agent_budget_rules (1:1)
        └── events (1:many)
```

## Models

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| email | string | Unique |
| passwordHash | string | SHA-256 hash |
| name | string | Display name |
| avatar | string? | Avatar URL |

### `sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| token | string | Session token (unique) |
| expiresAt | datetime | Expiration timestamp |
| userId | string | FK → users |

### `api_keys`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | Display name |
| keyHash | string | SHA-256 hash of key |
| keyPrefix | string | First 8 chars for display |
| lastUsedAt | datetime? | Last usage timestamp |
| expiresAt | datetime? | Expiration (optional) |
| permissions | string[] | ["read", "write", "execute"] |
| requestCount | int | API call counter |
| userId | string | FK → users |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | |
| description | string? | |
| status | string | `active` / `paused` / `archived` |
| userId | string | FK → users |

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
| webhookUrl | string? | Callback URL |
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
- Cascade deletes: User → Projects → Vault → Events; User → Projects → Agents → Events
- Indexed: `events(vaultId, createdAt)`, `events(agentId, createdAt)`, `events(type, createdAt)`

## Database Commands

```bash
# Run migrations
npm run db:migrate

# Push schema changes (dev only, no migration)
npm run db:push

# Seed database with test data
npm run db:seed

# Reset database and reseed
npm run db:reset
```

## Test Credentials

After running `npm run db:seed`:

- **Email:** demo@pilot.app
- **Password:** password123

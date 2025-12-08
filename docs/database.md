# Database Schema

PostgreSQL via **Prisma 7** + **Neon** (serverless).

## Tables

```
users
├── sessions (1:many)
├── api_keys (1:many)
└── projects (1:many)
    └── agents (1:many)
        ├── vaults (1:1)        # agent wallet
        │   └── events (1:many)
        └── agent_budget_rules (1:1)
        └── agent_budgets (1:1)
        └── agent_transactions (1:many)
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
| createdAt | datetime | |
| updatedAt | datetime | |

### `sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| token | string | Session token (unique) |
| expiresAt | datetime | Expiration timestamp |
| createdAt | datetime | |
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
| createdAt | datetime | |
| userId | string | FK → users |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | |
| description | string? | |
| status | string | `active` / `paused` / `archived` (default `active`) |
| avatar | string? | Assigned avatar key |
| userId | string | FK → users |
| createdAt | datetime | |
| updatedAt | datetime | |

### `vaults`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| address | string | Solana USDC address (unique) |
| encryptedPrivateKey | string | AES-256-GCM encrypted Solana private key |
| balance | bigint | Minor units (6 decimals) |
| agentId | string | FK → agents |
| createdAt | datetime | |
| updatedAt | datetime | |

### `agents`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | |
| provider | string? | `openai`, `anthropic`, etc. |
| status | string | `active` / `paused` / `error` / `needs_setup` (default `needs_setup`) |
| apiKeyHash | string? | For agent auth |
| webhookUrl | string? | Callback URL |
| projectId | string | FK → projects |
| wallet | 1:1 → vaults |
| budget | 1:1 → agent_budgets |
| transactions | 1:many → agent_transactions |
| createdAt | datetime | |
| updatedAt | datetime | |

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
| monthResetAt | datetime | For monthly reset logic |
| createdAt | datetime | |
| updatedAt | datetime | |
| agentId | string | FK → agents (unique) |

### `agent_budgets`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| monthlyBudgetUsd | decimal(18,6) | Monthly USD budget |
| active | boolean | Defaults to true |
| createdAt | datetime | |
| updatedAt | datetime | |
| agentId | string | FK → agents (unique) |
| projectId | string | FK → projects |

### `agent_transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| amountUsd | decimal(18,6) | Transaction amount in USD |
| token | string | Defaults to `USDC` |
| txSignature | string? | Solana tx signature or external reference |
| description | string? | Optional description |
| status | string | `pending` / `confirmed` / `failed` (default `confirmed`) |
| createdAt | datetime | |
| updatedAt | datetime | |
| agentId | string | FK → agents |
| projectId | string | FK → projects |

### `events`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| type | string | `funding` or `spend` |
| amount | bigint | Positive = funding, negative = spend |
| status | string | `pending` / `confirmed` / `failed` |
| txHash | string? | Solana tx signature |
| metadata | string? | JSON (tokens, model, etc.) |
| vaultId | string | FK → vaults (agent wallet) |
| agentId | string | FK → agents |
| createdAt | datetime | |

## Notes

- Wallet balances and event amounts use **minor units** (USDC = 6 decimals, so $1.00 = 1000000)
- Budget/transaction amounts are stored as `decimal(18,6)` USD values
- Vault private keys are encrypted with `VAULT_ENCRYPTION_KEY` before storage
- Cascade deletes: User → Projects → Agents → Wallets/Events/BudgetRules/Budgets/Transactions
- Indexed: `events(vaultId, createdAt)`, `events(agentId, createdAt)`, `events(type, createdAt)`, `agent_budgets(projectId)`, `agent_transactions(agentId, createdAt)`, `agent_transactions(projectId, createdAt)`

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

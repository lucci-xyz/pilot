# Authentication

Cookie-based session auth using Prisma + Neon.

## How It Works

1. User signs up/logs in with email + password
2. Password hashed with SHA-256, stored in `users.passwordHash`
3. Session token created, stored in `sessions` table + `pilot_session` cookie
4. Sessions expire after 30 days

## Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Core auth functions |
| `src/lib/actions/auth.ts` | Server actions for login/signup/logout |

## Key Functions

```typescript
// Require auth (redirects to /login if not authenticated)
const user = await requireAuth();

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Create session after login
await createSession(userId);

// Delete session on logout
await deleteSession();
```

## Test Credentials

After running `npm run db:seed`:

- **Email:** demo@pilot.app
- **Password:** password123


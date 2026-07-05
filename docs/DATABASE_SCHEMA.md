# Database Schema

## Overview

The DevPulse database uses PostgreSQL with Drizzle ORM. All schema definitions are in `packages/db/src/schema.ts`.

## Tables

### users

Stores GitHub user information and OAuth credentials.

| Column      | Type      | Constraints      | Description                |
| ----------- | --------- | ---------------- | -------------------------- |
| id          | serial    | PRIMARY KEY      | Auto-incrementing ID       |
| githubId    | integer   | NOT NULL, UNIQUE | GitHub user ID             |
| username    | text      | NOT NULL         | GitHub username            |
| avatarUrl   | text      |                  | GitHub avatar URL          |
| accessToken | text      | NOT NULL         | OAuth access token         |
| createdAt   | timestamp | DEFAULT NOW()    | Account creation timestamp |

**SQL Definition**:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  github_id INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### sessions

Stores active user sessions.

| Column    | Type      | Constraints           | Description                     |
| --------- | --------- | --------------------- | ------------------------------- |
| id        | text      | PRIMARY KEY           | Session ID (32-byte hex string) |
| userId    | integer   | NOT NULL, FOREIGN KEY | Reference to users.id           |
| expiresAt | timestamp | NOT NULL              | Session expiration timestamp    |
| createdAt | timestamp | DEFAULT NOW()         | Session creation timestamp      |

**SQL Definition**:

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Relationships

```
users (1) ──── (∞) sessions
```

- One user can have multiple sessions
- Each session belongs to exactly one user

## Indexes

- `users.githubId` - Unique index (enforced by UNIQUE constraint)
- `sessions.userId` - Index (recommended for JOIN queries)
- `sessions.expiresAt` - Index (for session cleanup queries)

## Migration Commands

### Push Schema to Database

```bash
cd packages/db
pnpm db:push
```

### Generate Migration

```bash
cd packages/db
npx drizzle-kit generate
```

### Push Schema with Migration

```bash
cd packages/db
npx drizzle-kit push
```

## Environment Configuration

The database connection is configured via the `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

Example:

```env
DATABASE_URL=postgresql://devpulse:secret@localhost:5432/devpulse
```

## Seeding Data

For development, you may want to seed test data:

```typescript
import { db, users, sessions } from "@devpulse/db";

// Insert a test user
const [user] = await db
  .insert(users)
  .values({
    githubId: 123456,
    username: "testuser",
    avatarUrl: "https://example.com/avatar.png",
    accessToken: "test_token_123",
  })
  .returning();

// Create a test session
await db.insert(sessions).values({
  id: "test_session_id_123456789012345678901234567890",
  userId: user.id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});
```

## Database Operations

### Select

```typescript
import { db, users } from "@devpulse/db";
import { eq } from "drizzle-orm";

// Get user by ID
const [user] = await db.select().from(users).where(eq(users.id, 1));

// Get user by GitHub ID
const [user] = await db.select().from(users).where(eq(users.githubId, 123456));
```

### Insert

```typescript
import { db, users } from "@devpulse/db";

const [newUser] = await db
  .insert(users)
  .values({
    githubId: 123456,
    username: "octocat",
    avatarUrl: "https://example.com/avatar.png",
    accessToken: "ghs_xxx",
  })
  .returning();
```

### Update

```typescript
import { db, users } from "@devpulse/db";
import { eq } from "drizzle-orm";

await db
  .update(users)
  .set({
    username: "newusername",
    accessToken: "new_token",
  })
  .where(eq(users.githubId, 123456));
```

### Delete

```typescript
import { db, sessions } from "@devpulse/db";
import { eq } from "drizzle-orm";

await db.delete(sessions).where(eq(sessions.id, "session_id"));
```

## Best Practices

1. **Session Expiration**: Always check `expiresAt` before using a session
2. **Token Security**: Store access tokens securely; consider encryption for production
3. **Error Handling**: Handle database errors appropriately
4. **Connection Pooling**: Use connection pooling for production deployments
5. **Migrations**: Always run migrations in production before deploying new code

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql $DATABASE_URL
```

### Schema Mismatch

If the schema doesn't match the database:

```bash
cd packages/db
pnpm db:push
```

### Session Not Working

1. Check `expiresAt` is in the future
2. Verify session ID format (32-byte hex string)
3. Ensure CORS allows cookies for your domain

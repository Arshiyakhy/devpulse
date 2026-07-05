# Database Documentation

## Overview

The DevPulse database uses PostgreSQL with Drizzle ORM. This document covers database schema, queries, and best practices.

## Schema

### Tables

#### users

Stores GitHub user information.

| Column        | Type      | Constraints      | Description                |
| ------------- | --------- | ---------------- | -------------------------- |
| `id`          | serial    | PRIMARY KEY      | Auto-incrementing ID       |
| `githubId`    | integer   | NOT NULL, UNIQUE | GitHub user ID             |
| `username`    | text      | NOT NULL         | GitHub username            |
| `avatarUrl`   | text      |                  | GitHub avatar URL          |
| `accessToken` | text      | NOT NULL         | OAuth access token         |
| `createdAt`   | timestamp | DEFAULT NOW()    | Account creation timestamp |

#### sessions

Stores active user sessions.

| Column      | Type      | Constraints           | Description                |
| ----------- | --------- | --------------------- | -------------------------- |
| `id`        | text      | PRIMARY KEY           | Session ID (32-byte hex)   |
| `userId`    | integer   | NOT NULL, FOREIGN KEY | Reference to users.id      |
| `expiresAt` | timestamp | NOT NULL              | Session expiration         |
| `createdAt` | timestamp | DEFAULT NOW()         | Session creation timestamp |

### Relationships

```
users (1) ──── (∞) sessions
```

## Common Queries

### Select

#### Get User by ID

```typescript
import { db, users } from "@devpulse/db";
import { eq } from "drizzle-orm";

const [user] = await db.select().from(users).where(eq(users.id, 1));
```

#### Get User by GitHub ID

```typescript
const [user] = await db.select().from(users).where(eq(users.githubId, 123456));
```

#### Get Active Sessions

```typescript
import { db, sessions } from "@devpulse/db";
import { lt } from "drizzle-orm";

const activeSessions = await db
  .select()
  .from(sessions)
  .where(lt(sessions.expiresAt, new Date()));
```

### Insert

#### Create New User

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

#### Create New Session

```typescript
import { db, sessions } from "@devpulse/db";
import { randomBytes } from "crypto";

const sessionId = randomBytes(32).toString("hex");

await db.insert(sessions).values({
  id: sessionId,
  userId: 1,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});
```

### Update

#### Update User

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

#### Extend Session

```typescript
import { db, sessions } from "@devpulse/db";
import { eq } from "drizzle-orm";

await db
  .update(sessions)
  .set({
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  .where(eq(sessions.id, "session_id"));
```

### Delete

#### Delete Session

```typescript
import { db, sessions } from "@devpulse/db";
import { eq } from "drizzle-orm";

await db.delete(sessions).where(eq(sessions.id, "session_id"));
```

#### Delete Expired Sessions

```typescript
import { db, sessions } from "@devpulse/db";
import { lt } from "drizzle-orm";

await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
```

## Indexes

### Existing Indexes

- `users.githubId` - Unique index (from UNIQUE constraint)
- `sessions.id` - Primary key index

### Recommended Indexes

```sql
-- Index for session cleanup
CREATE INDEX idx_sessions_expiresAt ON sessions(expiresAt);

-- Index for user sessions
CREATE INDEX idx_sessions_userId ON sessions(userId);
```

## Migrations

### Generate Migration

```bash
cd packages/db
npx drizzle-kit generate
```

### Push Schema

```bash
cd packages/db
pnpm db:push
```

### Manual Migration

```sql
-- Add new column
ALTER TABLE users ADD COLUMN email TEXT;

-- Create new table
CREATE TABLE commits (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  commitHash TEXT NOT NULL,
  message TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## Best Practices

### 1. Use Parameterized Queries

```typescript
// Good
await db.select().from(users).where(eq(users.id, userId));

// Bad (SQL injection risk)
await db.execute(`SELECT * FROM users WHERE id = ${userId}`);
```

### 2. Handle Errors

```typescript
try {
  const [user] = await db.select().from(users).where(eq(users.id, 1));

  if (!user) {
    throw new Error("User not found");
  }
} catch (error) {
  console.error("Database error:", error);
}
```

### 3. Use Transactions

```typescript
import { db } from "@devpulse/db";

await db.transaction(async (tx) => {
  await tx.insert(users).values(userData);
  await tx.insert(sessions).values(sessionData);
});
```

### 4. Connection Pooling

```typescript
import { createPool } from "postgres";

const pool = createPool({
  max: 10,
  idle_timeout: 30,
});
```

## Performance Optimization

### Query Optimization

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM sessions WHERE expiresAt < NOW();

-- Add indexes for frequently queried columns
CREATE INDEX idx_sessions_userId ON sessions(userId);
```

### Caching

```typescript
// Cache user data
const cacheKey = `user:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const [user] = await db.select().from(users).where(eq(users.id, userId));
await redis.set(cacheKey, JSON.stringify(user), { ex: 3600 });

return user;
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Slow Queries

```sql
-- Find slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### Deadlocks

```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Kill long-running queries
SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state = 'active';
```

## Backup and Recovery

### Backup

```bash
# Full backup
pg_dump -U devpulse devpulse > backup.sql

# Compressed backup
pg_dump -U devpulse devpulse | gzip > backup.sql.gz
```

### Restore

```bash
# Restore backup
psql -U devpulse devpulse < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | psql -U devpulse devpulse
```

### Automated Backup

```bash
# Create backup script
#!/bin/bash
pg_dump -U devpulse devpulse > /backups/devpulse_$(date +%Y%m%d).sql

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

## Security

### SSL Connections

```env
DATABASE_URL=postgresql://user:pass@host:port/db?ssl=true
```

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_sessions ON sessions
  FOR ALL
  USING (userId = current_user_id())
  WITH CHECK (userId = current_user_id());
```

## Monitoring

### Query Statistics

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 min';

-- Table statistics
SELECT relname, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;
```

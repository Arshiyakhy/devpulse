# Development Guide

## Project Structure

```
devpulse/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   └── index.ts  # Main API file
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/              # Frontend application
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── lib/         # Utility functions
│       │   └── main.tsx     # Entry point
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   └── db/               # Shared database package
│       ├── src/
│       │   ├── index.ts    # Database setup
│       │   └── schema.ts   # Database schema
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/                 # This documentation
├── build-deploy.ps1      # Windows deployment script
├── make_zip.py           # ZIP packaging script
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # Workspace configuration
└── pnpm-lock.yaml        # Lock file
```

## Setting Up Development Environment

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Environment File

Create `.env` in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Set Up Database

```bash
cd packages/db
pnpm db:push
```

### 4. Start Development Servers

**Option A: Start all servers manually**

```bash
# Terminal 1: Start API
pnpm --filter @devpulse/api dev

# Terminal 2: Start Web
pnpm --filter web dev
```

**Option B: Use a task runner**

Create `dev.sh` or `dev.ps1`:

```bash
# dev.sh (Linux/Mac)
#!/bin/bash
cd apps/api && pnpm dev &
cd apps/web && pnpm dev
```

```powershell
# dev.ps1 (Windows)
cd apps\api; pnpm dev
cd apps\web; pnpm dev
```

## Code Style

### TypeScript

- Use strict mode: `"strict": true` in `tsconfig.json`
- Use explicit types for function parameters and return values
- Avoid `any` type

### Formatting

- Use Prettier for code formatting
- Follow existing code style
- Maximum line length: 100 characters

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case`

## Common Development Tasks

### Adding a New API Endpoint

1. Add the endpoint in `apps/api/src/index.ts`
2. Use existing middleware patterns
3. Test with curl or Postman

```typescript
app.get("/api/new-endpoint", requireAuth, async (c) => {
  // Your logic here
  return c.json({ data: "value" });
});
```

### Adding a New Database Table

1. Update `packages/db/src/schema.ts`:

```typescript
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  // columns...
});
```

2. Run migration:

```bash
cd packages/db
pnpm db:push
```

3. Update API to use the new table:

```typescript
import { db, newTable } from "@devpulse/db";
```

### Adding UI Components

1. Create component in `apps/web/src/components/`
2. Use shadcn/ui patterns
3. Add to `apps/web/src/lib/utils.ts` if needed

## Testing

### Manual Testing

Test API endpoints with curl:

```bash
# Test API health
curl http://localhost:3000/

# Test OAuth login
curl http://localhost:3000/auth/login
```

### Database Testing

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Query data
SELECT * FROM users;
SELECT * FROM sessions;
```

## Debugging

### API Debugging

```bash
# Start with debug mode
pnpm --filter @devpulse/api dev

# Add console.log statements
console.log("Debug info:", variable);
```

### Frontend Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Use VS Code debugger with Chrome

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL
```

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

## Performance Optimization

### Database

- Add indexes for frequently queried columns
- Use connection pooling in production
- Implement query caching for static data

### API

- Use async/await for parallel operations
- Implement rate limiting
- Add response caching where appropriate

### Frontend

- Code splitting with React.lazy
- Image optimization
- Bundle size monitoring

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy DevPulse

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Deploy
        run: ./build-deploy.ps1
```

## Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **Database Migrations**: Always run migrations before deploying
3. **Error Handling**: Handle all database errors gracefully
4. **Logging**: Add logging for debugging and monitoring
5. **Security**: Validate all user inputs, use parameterized queries

## Troubleshooting

### Build Errors

```bash
# Clean build artifacts
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors

```bash
# Check TypeScript errors
pnpm tsc --noEmit
```

### Dependency Issues

```bash
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update
```

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

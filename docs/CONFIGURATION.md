# Configuration Guide

## Environment Variables

### Required Variables

| Variable               | Description                  | Example                                    |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID       | `Iv1.1234567890abcdef`                     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret   | `abcdef1234567890`                         |
| `FRONTEND_URL`         | Frontend URL for redirects   | `http://localhost:5173`                    |

### Optional Variables

| Variable   | Description      | Default       |
| ---------- | ---------------- | ------------- |
| `PORT`     | Server port      | `3000`        |
| `NODE_ENV` | Environment mode | `development` |

## Configuration Files

### Root Configuration

#### `package.json`

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter \"@devpulse/api\" dev",
    "build": "pnpm --filter \"@devpulse/db\" build && pnpm --filter \"@devpulse/api\" build",
    "test": "pnpm test"
  },
  "devDependencies": {
    "pnpm": "^8.0.0"
  }
}
```

#### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### API Configuration

#### `apps/api/package.json`

```json
{
  "name": "@devpulse/api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@devpulse/db": "workspace:*",
    "@hono/node-server": "^2.0.4",
    "dotenv": "^17.4.2",
    "drizzle-orm": "^0.45.2",
    "hono": "^4.12.25"
  }
}
```

#### `apps/api/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["src/**/*"]
}
```

### Database Configuration

#### `packages/db/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

#### `packages/db/package.json`

```json
{
  "name": "@devpulse/db",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "db:push": "drizzle-kit push",
    "build": "tsc"
  },
  "dependencies": {
    "dotenv": "^17.4.2",
    "drizzle-orm": "^0.45.2",
    "postgres": "^3.4.9"
  }
}
```

### Web Configuration

#### `apps/web/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

#### `apps/web/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Database Configuration

### PostgreSQL Settings

#### Connection Pooling

For production, use connection pooling:

```typescript
import { createPool } from "postgres";

const pool = createPool({
  hostname: "localhost",
  port: 5432,
  database: "devpulse",
  username: "user",
  password: "password",
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});
```

#### SSL Configuration

```env
DATABASE_URL=postgresql://user:pass@host:port/db?ssl=true
```

## Build Configuration

### TypeScript Configuration

#### Root `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Build Scripts

#### API Build

```bash
pnpm --filter @devpulse/api build
```

#### Web Build

```bash
pnpm --filter web build
```

#### Full Build

```bash
pnpm build
```

## Deployment Configuration

### Vercel Configuration

Create `vercel.json` in `apps/api`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### Docker Configuration (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install

COPY . .

RUN pnpm --filter @devpulse/db build
RUN pnpm --filter @devpulse/api build

EXPOSE 3000

CMD ["pnpm", "--filter", "@devpulse/api", "start"]
```

## Security Configuration

### Environment Variables

Create `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

### HTTPS Configuration

#### Vercel

HTTPS is enabled by default on Vercel.

#### Self-Hosted

Use Nginx with SSL:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## Monitoring Configuration

### Logging

Add logging middleware:

```typescript
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});
```

### Health Check

```typescript
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
```

## Troubleshooting Configuration

### Common Issues

#### Port Already in Use

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Database Connection Failed

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL
```

#### Module Not Found

```bash
# Reinstall dependencies
pnpm install

# Clear cache
pnpm store prune
```

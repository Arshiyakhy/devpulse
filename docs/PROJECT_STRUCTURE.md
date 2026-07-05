# Project Structure

## Overview

DevPulse is a monorepo project using pnpm workspaces. This document explains the project structure and how to navigate it.

## Directory Structure

```
devpulse/
├── apps/                    # Application code
│   ├── api/                # Backend API (Hono)
│   │   ├── src/
│   │   │   └── index.ts   # Main API file
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── lib/        # Utility functions
│       │   └── main.tsx    # Entry point
│       ├── public/         # Static assets
│       ├── package.json
│       └── vite.config.ts
├── packages/               # Shared code
│   └── db/                # Database package
│       ├── src/
│       │   ├── index.ts   # Database setup
│       │   └── schema.ts  # Database schema
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/                   # Documentation (this folder)
├── build-deploy.ps1      # Deployment script
├── make_zip.py           # ZIP packaging script
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # Workspace configuration
└── pnpm-lock.yaml        # Lock file
```

## Apps

### apps/api (Backend API)

**Framework**: Hono  
**Purpose**: REST API for GitHub OAuth and data endpoints

**Key Files**:

- `src/index.ts` - Main API file with all endpoints
- `package.json` - Dependencies and scripts

**Main Dependencies**:

- `@hono/node-server` - Node.js server adapter
- `@devpulse/db` - Database package (local)
- `drizzle-orm` - ORM for database operations
- `hono` - Web framework

**Available Scripts**:

```bash
pnpm --filter @devpulse/api dev      # Start development server
pnpm --filter @devpulse/api build    # Build for production
pnpm --filter @devpulse/api start    # Start production server
```

### apps/web (Frontend)

**Framework**: React + Vite  
**Purpose**: User interface for DevPulse

**Key Files**:

- `src/main.tsx` - Entry point
- `src/App.tsx` - Main application component
- `src/components/` - Reusable UI components
- `src/lib/utils.ts` - Utility functions

**Main Dependencies**:

- `react` - UI library
- `react-dom` - React DOM bindings
- `vite` - Build tool
- `@devpulse/db` - Database package (local)

**Available Scripts**:

```bash
pnpm --filter web dev      # Start development server
pnpm --filter web build    # Build for production
pnpm --filter web preview  # Preview production build
```

## Packages

### packages/db (Database)

**Purpose**: Shared database package with schema and connection

**Key Files**:

- `src/index.ts` - Database setup and exports
- `src/schema.ts` - Database schema definitions
- `drizzle.config.ts` - Drizzle configuration

**Main Dependencies**:

- `drizzle-orm` - ORM
- `postgres` - PostgreSQL client
- `dotenv` - Environment variables

**Available Scripts**:

```bash
pnpm --filter @devpulse/db build      # Build TypeScript
pnpm --filter @devpulse/db db:push    # Push schema to database
```

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

This configuration tells pnpm to include all subdirectories of `apps/` and `packages/` as workspace packages.

### Root package.json

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter \"@devpulse/api\" dev",
    "build": "pnpm --filter \"@devpulse/db\" build && pnpm --filter \"@devpulse/api\" build",
    "test": "pnpm test"
  }
}
```

## Dependency Management

### Workspace Dependencies

Packages in the workspace can depend on each other:

```json
{
  "dependencies": {
    "@devpulse/db": "workspace:*"
  }
}
```

The `workspace:*` version specifier tells pnpm to use the local version of the package.

### Installing Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages in the workspace.

## Development Workflow

### Starting Development Servers

**Option 1: Start all manually**

```bash
# Terminal 1
pnpm --filter @devpulse/api dev

# Terminal 2
pnpm --filter web dev
```

**Option 2: Use a script**

```bash
# dev.sh or dev.ps1
pnpm --filter @devpulse/api dev &
pnpm --filter web dev
```

### Building the Project

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @devpulse/db build
pnpm --filter @devpulse/api build
pnpm --filter web build
```

### Running Tests

```bash
pnpm test
```

## Adding New Packages

### Create New App

1. Create directory: `apps/new-app/`
2. Create `package.json`:

```json
{
  "name": "@devpulse/new-app",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  }
}
```

3. Create `src/index.ts`
4. Add to `pnpm-workspace.yaml` if needed

### Create New Package

1. Create directory: `packages/new-package/`
2. Create `package.json`:

```json
{
  "name": "@devpulse/new-package",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  }
}
```

3. Create `src/index.ts`
4. Update root `tsconfig.json` if needed

## Troubleshooting

### Dependency Issues

```bash
# Reinstall all dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Issues

```bash
# Clean build artifacts
pnpm clean

# Rebuild all
pnpm build
```

### Workspace Issues

```bash
# Sync workspace
pnpm install --filter @devpulse/api
```

## Best Practices

1. **Use workspace dependencies** for local packages
2. **Keep packages focused** on a single responsibility
3. **Version packages** appropriately
4. **Document public APIs**
5. **Test changes** before committing

## CI/CD Integration

### GitHub Actions

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm build
```

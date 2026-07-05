# Quick Start Guide

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database
- GitHub OAuth app credentials

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devpulse
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Environment File

Create `.env` in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Set Up Database

```bash
cd packages/db
pnpm db:push
```

### 5. Start Development Servers

```bash
# Terminal 1: Start API
pnpm --filter @devpulse/api dev

# Terminal 2: Start Web
pnpm --filter web dev
```

## Quick Test

### Test API

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "message": "DevPulse API is running"
}
```

### Test OAuth Login

Open browser:

```
http://localhost:3000/auth/login
```

## Next Steps

1. Read [API Documentation](./API.md)
2. Read [Database Schema](./DATABASE_SCHEMA.md)
3. Read [Development Guide](./DEVELOPMENT.md)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL
```

### Module Not Found

```bash
pnpm install
```

## Support

For issues, check:

- [Documentation](./README.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)

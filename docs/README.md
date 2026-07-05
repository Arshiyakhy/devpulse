# DevPulse Developer Documentation

Welcome to the DevPulse developer documentation. This project is a full-stack application for tracking developer activity and coding habits.

## Documentation Structure

### Getting Started

- [Quick Start](./QUICK_START.md) - Get up and running quickly
- [README](./README.md) - Project overview

### Core Documentation

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Database Documentation](./DATABASE_DOCUMENTATION.md) - Database schema and queries
- [Configuration](./CONFIGURATION.md) - Configuration options

### Development

- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [Project Structure](./PROJECT_STRUCTURE.md) - Project organization
- [Deployment](./DEPLOYMENT.md) - Deployment guide

### Additional

- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Quick Links

- [API Endpoints](./API_REFERENCE.md)
- [Database Schema](./DATABASE_DOCUMENTATION.md)
- [Environment Variables](./CONFIGURATION.md)
- [Development Setup](./DEVELOPMENT.md)

## Support

- [GitHub Issues](https://github.com/yourusername/devpulse/issues)
- [GitHub Discussions](https://github.com/yourusername/devpulse/discussions)

## License

This project is licensed under the MIT License.

## Project Structure

```
devpulse/
├── apps/
│   ├── api/          # Backend API (Hono + Drizzle ORM)
│   └── web/          # Frontend (React + Vite)
├── packages/
│   └── db/           # Shared database package
├── build-deploy.ps1  # Deployment script
└── make_zip.py       # ZIP packaging script
```

## Tech Stack

### Backend

- **Framework**: Hono (lightweight web framework)
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: GitHub OAuth

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui

### Infrastructure

- **Deployment**: Vercel (frontend), Node.js server (backend)
- **Package Manager**: pnpm (with workspaces)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database
- GitHub OAuth app credentials

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Set up the database:

```bash
cd packages/db
pnpm db:push
```

5. Start development servers:

```bash
# Start API server
pnpm --filter @devpulse/api dev

# Start web frontend
pnpm --filter web dev
```

## API Documentation

### Endpoints

#### Authentication

- `GET /auth/login` - Redirect to GitHub OAuth
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/me` - Get current user (requires auth)
- `GET /auth/logout` - Logout user

#### Data

- `GET /api/repos` - Get user's GitHub repositories
- `GET /api/commits` - Get commit statistics

## Database Schema

### Users Table

| Column      | Type      | Description           |
| ----------- | --------- | --------------------- |
| id          | serial    | Primary key           |
| githubId    | integer   | GitHub user ID        |
| username    | text      | GitHub username       |
| avatarUrl   | text      | GitHub avatar URL     |
| accessToken | text      | OAuth access token    |
| createdAt   | timestamp | Account creation date |

### Sessions Table

| Column    | Type      | Description             |
| --------- | --------- | ----------------------- |
| id        | text      | Session ID (hex string) |
| userId    | integer   | Reference to users.id   |
| expiresAt | timestamp | Session expiration      |
| createdAt | timestamp | Session creation date   |

## Development

### Running Tests

```bash
pnpm test
```

### Building

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter api build
pnpm --filter web build
```

### Database Migrations

```bash
cd packages/db
pnpm db:push
```

## Deployment

See [Deployment Guide](./DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- PostgreSQL database (for backend)
- Node.js 18+ installed

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

#### Frontend (Web App)

1. Push your code to GitHub
2. Import the project to Vercel
3. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `FRONTEND_URL` (set to your Vercel domain)
4. Deploy

#### Backend (API)

1. Create a new Vercel project for the API
2. Set environment variables:
   - `DATABASE_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `NODE_ENV` (production)
3. Deploy

### Option 2: Self-Hosted Deployment

#### Step 1: Prepare the Server

```bash
# Install Node.js
curl -fsSL https://fnm.vercel.app/install | bash

# Install pnpm
npm install -g pnpm
```

#### Step 2: Set Up Database

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE devpulse;
CREATE USER devpulse WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE devpulse TO devpulse;
\q

# Run migrations
cd packages/db
pnpm db:push
```

#### Step 3: Configure Environment

Create `.env` file in the root directory:

```env
DATABASE_URL=postgresql://devpulse:your_password@localhost:5432/devpulse
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://your-domain.com
NODE_ENV=production
PORT=3000
```

#### Step 4: Build and Deploy

```bash
# Install dependencies
pnpm install

# Build the API
pnpm --filter @devpulse/api build

# Start the server
pnpm --filter @devpulse/api start
```

#### Step 5: Set Up Process Manager

Install PM2 for process management:

```bash
npm install -g pm2

# Start the API
pm2 start dist/index.js --name devpulse-api

# Save process list
pm2 save

# Set up startup script
pm2 startup
```

#### Step 6: Configure Nginx (Optional)

Create `/etc/nginx/sites-available/devpulse`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/devpulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Variables Reference

### Required Variables

| Variable               | Description                  | Example                                    |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID       | `Iv1.1234567890abcdef`                     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret   | `abcdef1234567890`                         |
| `FRONTEND_URL`         | URL of the frontend          | `https://your-domain.com`                  |

### Optional Variables

| Variable   | Description      | Default       |
| ---------- | ---------------- | ------------- |
| `PORT`     | Server port      | `3000`        |
| `NODE_ENV` | Environment mode | `development` |

## GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: DevPulse
   - Homepage URL: `https://your-domain.com`
   - Application description: Developer activity tracker
   - Redirect URL: `https://your-api-domain.com/auth/callback`
4. Copy the Client ID and Client Secret
5. Add them to your environment variables

## Monitoring

### Logs

```bash
# PM2 logs
pm2 logs devpulse-api

# Nginx logs
tail -f /var/log/nginx/devpulse.log
```

### Health Check

Create a health check endpoint:

```typescript
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

## Backup Strategy

### Database Backup

```bash
# Create backup
pg_dump -U devpulse devpulse > backup_$(date +%Y%m%d).sql

# Restore
psql -U devpulse devpulse < backup_20240101.sql
```

### Automated Backup

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add backup job (daily at 2 AM)
0 2 * * * pg_dump -U devpulse devpulse > /backups/devpulse_$(date +\%Y\%m\%d).sql
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` to version control
3. **Database**: Use strong passwords and restrict access
4. **OAuth**: Keep client secret secure
5. **Sessions**: Implement session expiration and cleanup
6. **Rate Limiting**: Consider implementing rate limiting

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL
```

#### OAuth Redirect Issues

- Verify `FRONTEND_URL` matches your domain
- Check GitHub OAuth redirect URLs match exactly
- Ensure HTTPS in production

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Maintenance

### Database Cleanup

Remove expired sessions:

```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

### Log Rotation

Configure logrotate for Nginx logs:

```bash
# Create /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        /usr/sbin/nginx -s reload
    endscript
}
```

## Support

For issues, check:

- Application logs
- Database logs
- Nginx error logs
- GitHub OAuth application settings

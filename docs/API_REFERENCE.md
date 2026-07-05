# API Reference

## Overview

This document provides detailed API reference for the DevPulse API endpoints.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployment URL

## Authentication

All protected endpoints require a valid session cookie:

```
Cookie: session_id=<session_id>
```

## Endpoints

### Authentication

#### POST `/auth/github`

Initiates GitHub OAuth flow.

**Request**:

```http
GET /auth/login HTTP/1.1
Host: api.devpulse.com
```

**Response**:

```
HTTP/1.1 302 Found
Location: https://github.com/login/oauth/authorize?client_id=...
Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Lax
```

#### GET `/auth/callback`

Handles OAuth callback from GitHub.

**Request**:

```http
GET /auth/callback?code=github_oauth_code HTTP/1.1
Host: api.devpulse.com
```

**Response**:

```
HTTP/1.1 302 Found
Location: http://localhost:5173
Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Lax
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | OAuth authorization code from GitHub |

#### GET `/auth/me`

Gets current authenticated user.

**Request**:

```http
GET /auth/me HTTP/1.1
Host: api.devpulse.com
Cookie: session_id=...
```

**Response**:

```json
{
  "githubId": 123456,
  "username": "octocat",
  "avatarUrl": "https://avatars.githubusercontent.com/u/123456"
}
```

**Status Codes**:

- `200`: Success
- `401`: Not authenticated

**Error Response**:

```json
{
  "error": "Not logged in"
}
```

#### GET `/auth/logout`

Logs out current user.

**Request**:

```http
GET /auth/logout HTTP/1.1
Host: api.devpulse.com
Cookie: session_id=...
```

**Response**:

```json
{
  "confirm": "it got deleted"
}
```

### Data Endpoints

#### GET `/api/repos`

Gets authenticated user's GitHub repositories.

**Request**:

```http
GET /api/repos HTTP/1.1
Host: api.devpulse.com
Cookie: session_id=...
```

**Response**:

```json
{
  "response": [
    {
      "id": 123456,
      "name": "repository-name",
      "full_name": "user/repository-name",
      "private": false,
      "owner": {
        "login": "user",
        "id": 123456
      },
      "html_url": "https://github.com/user/repository-name",
      "description": "A repository",
      "language": "TypeScript",
      "stargazers_count": 100,
      "forks_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes**:

- `200`: Success
- `401`: Not authenticated
- `403`: GitHub API rate limit exceeded

#### GET `/api/commits`

Gets commit statistics for authenticated user.

**Request**:

```http
GET /api/commits HTTP/1.1
Host: api.devpulse.com
Cookie: session_id=...
```

**Response**:

```json
{
  "day": {
    "Sunday": 0,
    "Monday": 5,
    "Tuesday": 3,
    "Wednesday": 8,
    "Thursday": 2,
    "Friday": 4,
    "Saturday": 1
  },
  "hour": {
    "0": 2,
    "1": 1,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 1,
    "7": 3,
    "8": 5,
    "9": 4,
    "10": 6,
    "11": 3,
    "12": 2,
    "13": 4,
    "14": 5,
    "15": 3,
    "16": 4,
    "17": 2,
    "18": 1,
    "19": 2,
    "20": 3,
    "21": 4,
    "22": 2,
    "23": 1
  },
  "languages": {
    "TypeScript": 5,
    "JavaScript": 3,
    "Python": 2
  },
  "streaks": {
    "longest": 15,
    "mostActiveDay": "2024-01-15"
  }
}
```

**Response Fields**:

| Field                   | Type   | Description                       |
| ----------------------- | ------ | --------------------------------- |
| `day`                   | object | Commit counts by day of week      |
| `hour`                  | object | Commit counts by hour (0-23)      |
| `languages`             | object | Repository language counts        |
| `streaks.longest`       | number | Longest coding streak in days     |
| `streaks.mostActiveDay` | string | Date of most commits (YYYY-MM-DD) |

**Status Codes**:

- `200`: Success
- `401`: Not authenticated
- `403`: GitHub API rate limit exceeded

## Error Responses

### Common Errors

#### Not Authenticated

```json
{
  "error": "Not logged in"
}
```

**Status**: 401

#### Session Expired

```json
{
  "error": "Session expired"
}
```

**Status**: 401

#### User Not Found

```json
{
  "error": "User not found"
}
```

**Status**: 401

#### GitHub API Error

```json
{
  "error": "GitHub API rate limit exceeded"
}
```

**Status**: 403

## Rate Limiting

The API respects GitHub's rate limits:

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5000 requests/hour

## Webhook Configuration

For real-time updates, configure GitHub webhooks:

1. Go to Repository Settings → Webhooks
2. Add webhook URL: `https://api.devpulse.com/webhooks/github`
3. Select events: Pushes, Commits
4. Set content type: `application/json`

## SDK Examples

### JavaScript/TypeScript

```typescript
// Get current user
const response = await fetch("/auth/me", {
  credentials: "include",
});
const user = await response.json();

// Get repositories
const reposResponse = await fetch("/api/repos", {
  credentials: "include",
});
const repos = await reposResponse.json();

// Get commit statistics
const commitsResponse = await fetch("/api/commits", {
  credentials: "include",
});
const stats = await commitsResponse.json();
```

### cURL

```bash
# Get current user
curl -X GET http://localhost:3000/auth/me \
  -H "Cookie: session_id=your_session_id"

# Get repositories
curl -X GET http://localhost:3000/api/repos \
  -H "Cookie: session_id=your_session_id"

# Get commit statistics
curl -X GET http://localhost:3000/api/commits \
  -H "Cookie: session_id=your_session_id"
```

### Python

```python
import requests

# Get current user
response = requests.get(
    "http://localhost:3000/auth/me",
    cookies={"session_id": "your_session_id"}
)
user = response.json()

# Get repositories
repos_response = requests.get(
    "http://localhost:3000/api/repos",
    cookies={"session_id": "your_session_id"}
)
repos = repos_response.json()
```

## WebSocket Support (Future)

Planned WebSocket endpoints:

- `/ws/commits` - Real-time commit updates
- `/ws/notifications` - GitHub notifications

## GraphQL Support (Future)

Planned GraphQL endpoints:

- `/graphql` - GraphQL API endpoint
- `/graphql/subscriptions` - GraphQL subscriptions

## API Versioning

Current version: **v1**

Future versions will be available at:

- `/v1/api/...` - Current version
- `/v2/api/...` - Next version (when available)

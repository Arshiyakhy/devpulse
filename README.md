# DevPulse

**Your GitHub year, beautifully wrapped.** DevPulse analyzes your GitHub commit activity and turns it into a Spotify Wrapped–style interactive recap — total commits, longest streak, peak coding hours, top language, and a data-driven "developer personality," all wrapped in a shareable, animated card sequence.

🔗 **Live demo:** https://d38yfmv81pq1b8.cloudfront.net

---

## What it does

1. Sign in with GitHub (OAuth)
2. DevPulse pulls your repos and commit history via the GitHub API
3. Your activity is aggregated into stats: total commits, longest streak, most active day, peak coding hour, top language, and a personality archetype (Night Owl, Early Bird, Weekend Warrior, Consistency Machine, or Steady Shipper)
4. Click through an animated, 3D card-based reveal of each stat
5. Land on a shareable recap card — download as an image, copy to clipboard, share natively, or post directly to X

## Tech stack

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS v4, shadcn/ui components
- Aceternity UI (3D tilt card effect)
- Framer Motion (animations, ambient sparkle effect)
- Recharts (language breakdown chart)
- `html-to-image` (recap card export)

**Backend**
- Hono (lightweight TypeScript web framework) on Node.js
- Session-based auth with HttpOnly, cross-domain-safe cookies
- GitHub OAuth (authorization code flow)
- Drizzle ORM + PostgreSQL (via Supabase)

**Infrastructure**
- Frontend: AWS S3 (static hosting) + CloudFront (CDN, HTTPS)
- Backend: AWS Elastic Beanstalk (Node.js) + a second CloudFront distribution (HTTPS termination)
- Database: Supabase (managed PostgreSQL)
- Monorepo: pnpm workspaces (`apps/web`, `apps/api`, `packages/db`)

## Architecture notes

A few decisions worth calling out:

- **Cross-domain sessions over HTTPS.** The frontend (CloudFront) and backend (Elastic Beanstalk via a second CloudFront distribution) live on different domains. Session cookies use `SameSite=None; Secure`, which browsers require for cross-domain cookies — both sides need HTTPS for this to work, which is why the backend sits behind its own CloudFront distribution rather than being hit directly on its `*.elasticbeanstalk.com` domain.
- **Monorepo deployment to Elastic Beanstalk.** EB expects a self-contained Node app, but this project uses a pnpm workspace with a shared `@devpulse/db` package. A small build script (`build-deploy.ps1`) compiles both packages and assembles a flat deployable bundle with `@devpulse/db` referenced via a local `file:` path, avoiding `workspace:*` syntax that plain `npm install` can't resolve.
- **Rule-based personality classification.** Rather than an LLM call for the "developer personality" feature, this uses deterministic logic based on commit timing and streak data — faster, free, and consistent.

## Local development

Requires Node.js, pnpm, and a PostgreSQL database (Supabase recommended).

```bash
# install dependencies
pnpm install

# set up environment variables (see .env.example in apps/api and apps/web)
# DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

# push the database schema
cd packages/db && pnpm db:push

# run the backend
cd apps/api && pnpm dev

# run the frontend (separate terminal)
cd apps/web && pnpm dev
```

You'll also need a [GitHub OAuth App](https://github.com/settings/developers) with its callback URL set to `http://localhost:3000/auth/callback` for local development.

## Project structure

```
devpulse/
├── apps/
│   ├── web/          # React frontend
│   └── api/           # Hono backend
├── packages/
│   └── db/             # Shared Drizzle schema + DB client
├── build-deploy.ps1    # Bundles apps/api + packages/db for Elastic Beanstalk
└── make_zip.py          # Creates a Linux-compatible zip for EB upload
```

## Author

Built by Arshiya Khayatzadeh — 2nd-year Computer Science Co-op student (Software Engineering), University of Toronto Scarborough.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import path from "path";
import { db, sessions, users } from "@devpulse/db";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import fs from "fs";

type Variables = {
  user: typeof users.$inferSelect;
};

const app = new Hono<{ Variables: Variables }>();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

// Allow either the local dev frontend or the deployed frontend, controlled
// by an env var so we don't hardcode URLs that change between environments.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  "*",
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
const requireAuth = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId) {
    return c.json({ error: "Not logged in" }, 401);
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (!session || session.expiresAt < new Date()) {
    return c.json({ error: "Session expired" }, 401);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  c.set("user", user);
  await next();
});
app.get("/", (c) => {
  return c.json({ message: "DevPulse API is running" });
});
app.get("/auth/login", (c) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  return c.redirect(redirectUrl);
});
app.get("/auth/callback", async (c) => {
  const code = c.req.query("code");
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    },
  );
  const tokenData = await tokenResponse.json();
  const profile = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
    },
  });
  const profileData = await profile.json();
  const [user] = await db
    .insert(users)
    .values({
      githubId: profileData.id,
      username: profileData.login,
      avatarUrl: profileData.avatar_url,
      accessToken: tokenData.access_token,
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        username: profileData.login,
        avatarUrl: profileData.avatar_url,
        accessToken: tokenData.access_token,
      },
    })
    .returning();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 7 * 24);
  const sessionId = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    id: sessionId,
    userId: user!.id,
    expiresAt: expiresAt,
  });
  // secure + sameSite "None" is required for the cookie to survive a
  // cross-domain redirect (frontend and backend on different domains).
  // This requires HTTPS, which is why we moved off plain Elastic Beanstalk.
  const isProduction = process.env.NODE_ENV === "production";
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
  return c.redirect(FRONTEND_URL);
});
app.get("/auth/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({
    githubId: user?.githubId,
    username: user?.username,
    avatarUrl: user?.avatarUrl,
  });
});
app.get("/auth/logout", async (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    deleteCookie(c, "session_id");
    return c.json({ confirm: "it got deleted" });
  }
  return c.json({ confirm: "it did not get deleted" });
});
app.get("/api/repos", requireAuth, async (c) => {
  const user = c.get("user");
  const accessToken = user?.accessToken;
  const reposResponse = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const repos = await reposResponse.json();
  return c.json({ response: repos });
});
app.get("/api/commits", requireAuth, async (c) => {
  const user = c.get("user");
  const accessToken = user?.accessToken;
  const reposResponse = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const repos = await reposResponse.json();
  const commitPromises = repos.map(
    (repo: { owner: { login: string }; name: string }) => {
      return fetch(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ).then((res) => res.json());
    },
  );
  const allCommitsPerRepo = await Promise.all(commitPromises);
  const allCommits = allCommitsPerRepo.flat();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const commitsByDay: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };
  const commitsByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    commitsByHour[i] = 0;
  }
  const languageCounts: Record<string, number> = {};
  for (const commit of allCommits) {
    const dateString = commit.commit.author.date;
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex]!;
    commitsByDay[dayName]!++;
    const hour = date.getHours();
    commitsByHour[hour]!++;
  }
  for (const repo of repos) {
    if (!repo.language) continue;
    if (languageCounts[repo.language]) {
      languageCounts[repo.language]!++;
    } else {
      languageCounts[repo.language] = 1;
    }
  }
  const uniqueDatesSet = new Set<string>();
  for (const commit of allCommits) {
    const dateString = commit.commit.author.date;
    const dateOnly = dateString.split("T")[0]; // "2026-06-15T14:32:00Z" -> "2026-06-15"
    uniqueDatesSet.add(dateOnly);
  }
  const sortedDates = Array.from(uniqueDatesSet).sort();
  let currentStreak = 1;
  let longestStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]!);
    const previousDate = new Date(sortedDates[i - 1]!);
    const dayDifference =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDifference === 1) currentStreak!++;
    else currentStreak = 1;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }
  const commitsByDate: Record<string, number> = {};
  for (const commit of allCommits) {
    const dateString = commit.commit.author.date;
    const dateOnly = dateString.split("T")[0];
    commitsByDate[dateOnly] = (commitsByDate[dateOnly] || 0) + 1;
  }
  let mostActiveDay = "";
  let mostActiveDayCount = 0;

  for (const date in commitsByDate) {
    if (commitsByDate[date]! > mostActiveDayCount) {
      mostActiveDayCount = commitsByDate[date]!;
      mostActiveDay = date;
    }
  }

  return c.json({
    day: commitsByDay,
    hour: commitsByHour,
    languages: languageCounts,
    streaks: {
      longest: longestStreak,
      mostActiveDay: mostActiveDay,
    },
  });
});

export { app };

// Only start a standalone Node server when run directly (local dev / EB).
// Vercel imports `app` from the separate api/index.ts entry point instead
// and never executes this block.
if (process.env.VERCEL !== "1") {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  serve({ fetch: app.fetch, port });
  console.log(`Server running on port ${port}`);
}

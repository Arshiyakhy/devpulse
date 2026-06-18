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

type Variables = {
  user: typeof users.$inferSelect;
};

const app = new Hono<{ Variables: Variables }>();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
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
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: false, // true in production (requires HTTPS)
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
  return c.redirect("http://localhost:5173");
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
  return c.json({ response: allCommitsPerRepo });
});
serve({ fetch: app.fetch, port: 3000 });
console.log("Server running on http://localhost:3000");

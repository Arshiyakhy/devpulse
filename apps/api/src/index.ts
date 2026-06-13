import { Hono } from "hono";
import { serve } from "@hono/node-server";
import "dotenv/config";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "DevPulse API is running" });
});
app.get("/auth/login", (c) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  return c.redirect(redirectUrl);
});

serve({ fetch: app.fetch, port: 3000 });
console.log("Server running on http://localhost:3000");

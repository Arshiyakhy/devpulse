import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expired_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

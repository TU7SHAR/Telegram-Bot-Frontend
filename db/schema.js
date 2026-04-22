import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

// The "invite_tokens" table definition
export const inviteTokens = pgTable("invite_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenString: text("token_string").notNull().unique(),
  tokenType: text("token_type").default("normal"), // 'admin' or 'normal'
  createdBy: uuid("created_by"), // Links to auth.users (handled via Supabase)
  isUsed: boolean("is_used").default(false),
  usedByTelegramId: bigint("used_by_telegram_id", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// The "authorized_users" table definition
export const authorizedUsers = pgTable("authorized_users", {
  telegramId: bigint("telegram_id", { mode: "number" }).primaryKey(),
  tokenUsed: text("token_used").unique(),
  activatedAt: timestamp("activated_at").defaultNow(),
});

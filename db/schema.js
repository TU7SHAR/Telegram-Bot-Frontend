import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

export const inviteTokens = pgTable("invite_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenString: text("token_string").notNull().unique(),
  tokenType: text("token_type").default("normal"),
  createdBy: uuid("created_by"),
  isUsed: boolean("is_used").default(false),
  usedByTelegramId: bigint("used_by_telegram_id", { mode: "number" }),
  usedByUsername: text("used_by_username"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authorizedUsers = pgTable("authorized_users", {
  telegramId: bigint("telegram_id", { mode: "number" }).primaryKey(),
  tokenUsed: text("token_used").unique(),
  activatedAt: timestamp("activated_at").defaultNow(),
});

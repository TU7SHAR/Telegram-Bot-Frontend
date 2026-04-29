import {
  pgTable,
  text,
  boolean,
  timestamp,
  bigint,
  uuid,
  doublePrecision,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. ACCESS & SECURITY
// ==========================================

export const inviteTokens = pgTable("invite_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenString: text("token_string").notNull().unique(),
  createdBy: uuid("created_by"), // FK to auth.users handled by Supabase
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isUsed: boolean("is_used").default(false),
  usedByTelegramId: bigint("used_by_telegram_id", { mode: "number" }),
  tokenType: text("token_type").default("normal"),
  usedByUsername: text("used_by_username"),
  caption: text("caption").default("No caption"),
  isRevoked: boolean("is_revoked").default(false), // Hard default prevents the ghost ban bug
});

export const authorizedUsers = pgTable("authorized_users", {
  telegramId: bigint("telegram_id", { mode: "number" })
    .notNull()
    .unique()
    .primaryKey(),
  tokenUsed: text("token_used").unique(), // FK to invite_tokens handled by Supabase
  activatedAt: timestamp("activated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isBanned: boolean("is_banned").default(false), // Hard default prevents ghost ban
});

// ==========================================
// 2. BOT CONFIGURATION
// ==========================================

export const botSettings = pgTable("bot_settings", {
  // Using mode 'number' for bigints so they don't break JS
  id: bigint("id", { mode: "number" }).primaryKey(), // GENERATED ALWAYS AS IDENTITY in DB
  createdBy: uuid("created_by").notNull().unique(), // FK to auth.users
  strictKnowledgeMode: boolean("strict_knowledge_mode").default(true),
  temperature: doublePrecision("temperature").default(0.2),
  maintenanceMode: boolean("maintenance_mode").default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==========================================
// 3. ANALYTICS & FILES
// ==========================================

export const chatAnalytics = pgTable("chat_analytics", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }),
  username: text("username"),
  userQuery: text("user_query"),
  botResponse: text("bot_response"),
  adminId: uuid("admin_id"), // FK to auth.users
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ingestedFiles = pgTable("ingested_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  uploadedByUsername: text("uploaded_by_username"),
  uploadedByTelegramId: bigint("uploaded_by_telegram_id", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by"), // FK to auth.users
  category: text("category").default("General"),
});

// ==========================================
// 4. USER INTERACTION & PROGRESS
// ==========================================

export const userStates = pgTable("user_states", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(), // FK to authorized_users
  currentMode: text("current_mode").default("use"),
  currentStep: integer("current_step").default(0),
  metadata: jsonb("metadata").default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const onboardingLeads = pgTable("onboarding_leads", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }), // FK to user_states
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  experienceLevel: text("experience_level"),
  goal: text("goal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  role: text("role"),
  passion: text("passion"),
});

export const quizScores = pgTable("quiz_scores", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }), // FK to authorized_users
  category: text("category"),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const testResults = pgTable("test_results", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }), // FK to authorized_users
  category: text("category"),
  qaData: jsonb("qa_data"),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

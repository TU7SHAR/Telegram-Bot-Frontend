export const DB = {
  TOKENS: {
    TABLE: "invite_tokens",
    ID: "id",
    TOKEN_STRING: "token_string", // Restored key
    CREATED_BY: "created_by",
    CREATED_AT: "created_at",
    IS_USED: "is_used",
    USED_BY_ID: "used_by_telegram_id", // Restored key
    TOKEN_TYPE: "token_type", // Restored key
    USED_BY_USER: "used_by_username", // Restored key
    CAPTION: "caption",
    IS_REVOKED: "is_revoked",
    SENT_TO: "sent_to", // New functional value
  },
  USERS: {
    TABLE: "authorized_users",
    ID: "telegram_id",
    TOKEN_USED: "token_used", // Restored key
    ACTIVATED_AT: "activated_at",
    CREATED_AT: "created_at",
    IS_BANNED: "is_banned",
  },
  SETTINGS: {
    TABLE: "bot_settings",
    ID: "id",
    CREATED_BY: "created_by",
    STRICT_MODE: "strict_knowledge_mode",
    TEMPERATURE: "temperature",
    MAINTENANCE_MODE: "maintenance_mode",
    UPDATED_AT: "updated_at",
  },
  CHAT: {
    TABLE: "chat_analytics",
    ID: "id",
    TELEGRAM_ID: "telegram_id", // Restored key
    USERNAME: "username",
    USER_QUERY: "user_query", // Restored key
    BOT_RESPONSE: "bot_response", // Restored key
    ADMIN_ID: "admin_id",
    CREATED_AT: "created_at",
  },
  FILES: {
    TABLE: "ingested_files",
    ID: "id",
    FILENAME: "filename",
    UPLOADED_BY_USER: "uploaded_by_username", // Restored key
    UPLOADED_BY_ID: "uploaded_by_telegram_id", // Restored key
    CREATED_AT: "created_at",
    CREATED_BY: "created_by",
    CATEGORY: "category",
  },
  STATES: {
    TABLE: "user_states",
    ID: "id",
    TELEGRAM_ID: "telegram_id", // Restored key
    CURRENT_MODE: "current_mode", // Restored key
    CURRENT_STEP: "current_step", // Restored key
    METADATA: "metadata",
    UPDATED_AT: "updated_at",
  },
  ONBOARDING: {
    TABLE: "onboarding_leads",
    ID: "id",
    TELEGRAM_ID: "telegram_id", // Restored key
    FULL_NAME: "full_name", // Restored key
    PHONE_NUMBER: "phone_number", // Restored key
    EXPERIENCE_LEVEL: "experience_level", // Restored key
    GOAL: "goal",
    ROLE: "role",
    PASSION: "passion",
    CREATED_AT: "created_at",
  },
  QUIZ: {
    TABLE: "quiz_scores",
    ID: "id",
    TELEGRAM_ID: "telegram_id", // Restored key
    CATEGORY: "category",
    SCORE: "score",
    TOTAL_QUESTIONS: "total_questions", // Restored key
    CREATED_AT: "created_at",
  },
  TESTS: {
    TABLE: "test_results",
    ID: "id",
    TELEGRAM_ID: "telegram_id", // Restored key
    CATEGORY: "category",
    QA_DATA: "qa_data", // Restored key
    SCORE: "score",
    TOTAL_QUESTIONS: "total_questions", // Restored key
    REMARKS: "remarks",
    CREATED_AT: "created_at",
  },
};

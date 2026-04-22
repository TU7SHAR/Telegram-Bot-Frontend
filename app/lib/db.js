import { db } from "../../db";
import { inviteTokens } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function ensureAdminToken(userId) {
  try {
    // Bulletproof Drizzle syntax
    const existing = await db
      .select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.createdBy, userId),
          eq(inviteTokens.tokenType, "admin"),
        ),
      )
      .limit(1);

    if (existing.length > 0) return;

    const adminTokenString = `admin_${Math.random().toString(36).substr(2, 9)}`;
    const link = `https://t.me/DrishRag_Bot?start=${adminTokenString}`;

    await db.insert(inviteTokens).values({
      tokenString: link,
      createdBy: userId,
      tokenType: "admin",
    });
  } catch (err) {
    console.error("Drizzle Error:", err);
  }
}

// ✅ FIXED: Added userId parameter and used the bulletproof select() syntax
export async function getAllTokens(userId) {
  if (!userId) return []; // Security fallback

  try {
    return await db
      .select()
      .from(inviteTokens)
      .where(eq(inviteTokens.createdBy, userId)) // Only get THIS user's tokens
      .orderBy(desc(inviteTokens.createdAt));
  } catch (err) {
    console.error("Fetch Error:", err);
    return [];
  }
}

"use server";

import { db } from "../../db";
import { inviteTokens } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function ensureAdminToken(userId) {
  try {
    const existing = await db.query.inviteTokens.findFirst({
      where: and(
        eq(inviteTokens.createdBy, userId),
        eq(inviteTokens.tokenType, "admin"),
      ),
    });

    if (existing) return;

    const adminTokenString = `admin_${Math.random().toString(36).substr(2, 9)}`;
    const link = `https://t.me/devRagbot?start=${adminTokenString}`;

    await db.insert(inviteTokens).values({
      tokenString: link,
      createdBy: userId,
      tokenType: "admin",
    });
  } catch (err) {
    console.error(err);
  }
}

export async function getAllTokens(userId) {
  if (!userId) return [];
  try {
    return await db.query.inviteTokens.findMany({
      where: eq(inviteTokens.createdBy, userId),
      orderBy: [desc(inviteTokens.createdAt)],
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

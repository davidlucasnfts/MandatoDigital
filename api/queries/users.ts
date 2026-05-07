import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const db = getDb();
  const existing = await findUserByUnionId(data.unionId);

  if (existing) {
    await db
      .update(schema.users)
      .set({
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        lastSignInAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.unionId, data.unionId));
  } else {
    await db.insert(schema.users).values(data);
  }
}

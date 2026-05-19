import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";


export type AuditAction = "create" | "read" | "update" | "delete" | "login" | "logout" | "export";

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  tableName: string;
  recordId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(input: AuditLogInput) {
  try {
    const db = getDb();
    await db.insert(schema.auditLogs).values({
      userId: input.userId,
      action: input.action,
      tableName: input.tableName,
      recordId: input.recordId,
      oldData: input.oldData ?? null,
      newData: input.newData ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
  } catch {
    // Falha silenciosa — nunca quebrar a operação principal por causa de log
    console.error("[AUDIT] Falha ao registrar log de auditoria");
  }
}

import { describe, it, expect, vi } from "vitest";
import { logAudit } from "./audit";
import { getDb } from "../queries/connection";

vi.mock("../queries/connection", () => ({
  getDb: vi.fn(() => ({
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
  })),
}));

describe("logAudit", () => {
  it("registra log de criacao sem erros", async () => {
    await expect(
      logAudit({
        userId: "user-123",
        action: "create",
        tableName: "eleitores",
        recordId: "eleitor-456",
        newData: { nome: "João Silva" },
      })
    ).resolves.toBeUndefined();
  });

  it("nao lanca erro se banco falhar", async () => {
    vi.mocked(getDb).mockImplementationOnce(() => {
      throw new Error("DB down");
    });

    await expect(
      logAudit({
        action: "read",
        tableName: "eleitores",
      })
    ).resolves.toBeUndefined();
  });
});

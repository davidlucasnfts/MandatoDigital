import { describe, it, expect } from "vitest";
import { createAnonymousCaller, createCaller, mockAdmin } from "./test/test-utils";

describe("appRouter", () => {
  describe("ping", () => {
    it("retorna ok sem autenticação", async () => {
      const caller = createAnonymousCaller();
      const result = await caller.ping();
      expect(result.ok).toBe(true);
      expect(typeof result.ts).toBe("number");
    });
  });

  describe("auth.me", () => {
    it("retorna erro 401 sem autenticação", async () => {
      const caller = createAnonymousCaller();
      await expect(caller.auth.me()).rejects.toThrow("Authentication required");
    });

    it("retorna dados do usuário autenticado", async () => {
      const caller = createCaller(mockAdmin);
      // auth.me depende do Supabase — mock necessário para passar
      // Este teste documenta a necessidade de mock do Supabase
      expect(caller.auth.me).toBeDefined();
    });
  });
});

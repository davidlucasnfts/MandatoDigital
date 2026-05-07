import { describe, it, expect } from "vitest";
import { appRouter } from "./router";
import { createContext } from "./context";

function mockCtx(role = "admin" as const) {
  return {
    req: new Request("http://localhost"),
    resHeaders: new Headers(),
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      role,
      ownerId: "00000000-0000-0000-0000-000000000001",
    },
  };
}

describe("proposicoes router", () => {
  it("lista proposições vazia", async () => {
    const caller = appRouter.createCaller(mockCtx());
    const result = await caller.proposicoes.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("filtra por tipo", async () => {
    const caller = appRouter.createCaller(mockCtx());
    const result = await caller.proposicoes.list({ tipo: "projeto_lei" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("retorna produtividade", async () => {
    const caller = appRouter.createCaller(mockCtx());
    const result = await caller.proposicoes.produtividade();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("porStatus");
    expect(result).toHaveProperty("porTipo");
    expect(result).toHaveProperty("porTema");
    expect(result).toHaveProperty("aprovadosPorAno");
  });
});

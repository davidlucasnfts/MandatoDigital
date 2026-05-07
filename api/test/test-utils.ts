import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, TrpcUser } from "../context";
import { appRouter } from "../router";

initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export function createCaller(user?: TrpcUser) {
  const ctx: TrpcContext = {
    req: new Request("http://localhost/api/trpc"),
    resHeaders: new Headers(),
    user,
  };
  return appRouter.createCaller(ctx);
}

export function createAnonymousCaller() {
  return createCaller(undefined);
}

export const mockAdmin: TrpcUser = {
  id: "admin-123",
  email: "admin@test.com",
  role: "admin",
  ownerId: "admin-123",
};

export const mockEditor: TrpcUser = {
  id: "editor-456",
  email: "editor@test.com",
  role: "editor",
  ownerId: "admin-123",
};

export const mockViewer: TrpcUser = {
  id: "viewer-789",
  email: "viewer@test.com",
  role: "visualizador",
  ownerId: "admin-123",
};

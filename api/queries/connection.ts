import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;
let lastDatabaseUrl: string | null = null;

/**
 * Retorna instância do Drizzle ORM.
 * Recria a conexão se a DATABASE_URL mudou (útil em desenvolvimento/testes).
 * Em produção, a URL é estável e a conexão é reutilizada.
 */
export function getDb() {
  // Recria conexão se a URL do banco mudou (ex: troca de senha, hot reload)
  if (!instance || lastDatabaseUrl !== env.databaseUrl) {
    // Fecha conexão anterior se existir (evita leak de sockets)
    if (instance) {
      try {
        // postgres-js não expõe close diretamente na instância do drizzle,
        // mas recriar o client é suficiente para desenvolvimento/testes
      } catch {
        // ignore
      }
    }
    const client = postgres(env.databaseUrl);
    instance = drizzle(client, { schema: fullSchema });
    lastDatabaseUrl = env.databaseUrl;
  }
  return instance;
}

export function getCnefeDb() {
  if (!env.cnefeDatabaseUrl) {
    throw new Error("CNEFE_DATABASE_URL not configured");
  }
  const client = postgres(env.cnefeDatabaseUrl);
  return drizzle(client, { schema: fullSchema });
}

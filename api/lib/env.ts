import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Codifica a senha em uma URL PostgreSQL para evitar erros com caracteres especiais.
 * Caracteres como !, @, #, $, %, &, *, (, ), etc. na senha quebram a URL.
 * 
 * Formato: postgresql://user:password@host:port/db
 * Precisamos codificar apenas a parte da senha.
 */
function encodeDatabaseUrl(url: string): string {
  const match = url.match(/^(postgresql:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) return url;

  const [, protocol, user, password, rest] = match;
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(password);
  const encodedPassword = isEncoded ? password : encodeURIComponent(password);
  
  return `${protocol}${user}:${encodedPassword}@${rest}`;
}

const rawDatabaseUrl = required("DATABASE_URL");

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: encodeDatabaseUrl(rawDatabaseUrl),
  cnefeApiUrl: process.env.CNEFE_API_URL,
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  wahaApiUrl: process.env.WAHA_API_URL,
  wahaApiKey: process.env.WAHA_API_KEY,
};

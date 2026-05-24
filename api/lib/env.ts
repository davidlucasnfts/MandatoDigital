import "dotenv/config";

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
  console.log("[encodeDatabaseUrl] INPUT (parcial):", url.substring(0, 30) + "...");
  
  // Regex para extrair as partes da URL PostgreSQL
  const match = url.match(/^(postgresql:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    console.log("[encodeDatabaseUrl] Não conseguiu parsear com regex, retorna original");
    return url;
  }

  const [, protocol, user, password, rest] = match;
  console.log("[encodeDatabaseUrl] user:", user);
  console.log("[encodeDatabaseUrl] password (primeiros 20 chars):", password.substring(0, 20) + "...");
  console.log("[encodeDatabaseUrl] rest:", rest.substring(0, 30) + "...");
  
  // Codifica a senha (apenas se ainda não estiver codificada)
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(password);
  console.log("[encodeDatabaseUrl] já codificada?", isEncoded);
  
  const encodedPassword = isEncoded ? password : encodeURIComponent(password);
  const result = `${protocol}${user}:${encodedPassword}@${rest}`;
  console.log("[encodeDatabaseUrl] OUTPUT (parcial):", result.substring(0, 40) + "...");
  
  return result;
}

const rawDatabaseUrl = required("DATABASE_URL");

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: encodeDatabaseUrl(rawDatabaseUrl),
  cnefeApiUrl: process.env.CNEFE_API_URL,
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
};

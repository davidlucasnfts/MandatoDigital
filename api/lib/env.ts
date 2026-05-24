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
 */
function encodeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Se a senha já está codificada, não codifica de novo
    const password = parsed.password;
    if (password && !/%[0-9A-Fa-f]{2}/.test(password)) {
      parsed.password = encodeURIComponent(password);
    }
    return parsed.toString();
  } catch {
    // Se não conseguir parsear como URL, retorna original
    return url;
  }
}

const rawDatabaseUrl = required("DATABASE_URL");

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: encodeDatabaseUrl(rawDatabaseUrl),
  cnefeApiUrl: process.env.CNEFE_API_URL,
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
};

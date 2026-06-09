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

/**
 * Valida a URL da WAHA.
 * 
 * NOTA DE SEGURANÇA (08/06/2026):
 * A arquitetura ideal é: WAHA bindada em localhost + Nginx/Cloudflare Tunnel.
 * Porém, sem domínio próprio, usamos IP público com API Key forte como mitigação.
 * 
 * Quando comprar domínio, migrar para:
 *   - Cloudflare Tunnel (mais seguro)
 *   - Ou Nginx + HTTPS + autenticação básica
 * 
 * Por enquanto, a API Key forte (32+ chars) é a principal proteção.
 * A porta 8080 deve ter rate limiting e ideally whitelist de IPs da Vercel.
 * 
 * Ver docs/guia-setup-waha-vps.md e docs/adr-006-whatsapp-api-multi-cliente.md
 */
function validateWahaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // Em desenvolvimento local, permite localhost
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return url;
  }

  // Detecta IP público na URL
  const publicIpRegex = /https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
  const match = url.match(publicIpRegex);

  if (match) {
    const ip = match[1];
    // IPs privados são permitidos (10.x, 172.16-31.x, 192.168.x)
    const isPrivate =
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

    if (!isPrivate) {
      console.warn(
        `[SECURITY] WAHA_API_URL usa IP público (${ip}). ` +
        `Isso expõe a API WAHA na internet. ` +
        `Mitigação atual: API Key forte + rate limiting. ` +
        `Recomendado: migrar para Cloudflare Tunnel ou Nginx+HTTPS quando tiver domínio. ` +
        `Ver docs/adr-006-whatsapp-api-multi-cliente.md`
      );
      // Não joga erro — funcionalidade precisa funcionar sem domínio
      // Mas loga warning para conscientização
    }
  }

  return url;
}

const rawDatabaseUrl = required("DATABASE_URL");

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: encodeDatabaseUrl(rawDatabaseUrl),
  cnefeApiUrl: process.env.CNEFE_API_URL,
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  wahaApiUrl: validateWahaUrl(process.env.WAHA_API_URL),
  wahaApiKey: process.env.WAHA_API_KEY,
};

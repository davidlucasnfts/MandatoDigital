import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

console.log("[env] NODE_ENV:", process.env.NODE_ENV);
console.log("[env] DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("[env] VITE_SUPABASE_URL present:", !!process.env.VITE_SUPABASE_URL);
console.log("[env] SUPABASE_SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseDbUrl = "postgresql://postgres.fawzdzfazmudolggtfno:Mandato%40digital123@aws-1-us-west-2.pooler.supabase.com:5432/postgres";

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || supabaseDbUrl,
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
};

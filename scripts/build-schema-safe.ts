#!/usr/bin/env node
/**
 * Script para consolidar todas as migrations em schema_safe.sql
 * Uso: npx tsx scripts/build-schema-safe.ts
 *
 * Este script:
 * 1. Lê todos os arquivos .sql em supabase/migrations/
 * 2. Ordena por número (001, 002, etc.)
 * 3. Concatena em um único arquivo schema_safe.sql
 * 4. Adiciona header com data e instruções
 */

import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const OUTPUT_FILE = path.join(process.cwd(), "supabase", "schema_safe.sql");

function getMigrationNumber(filename: string): number {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function buildSchemaSafe() {
  // Lê todos os arquivos .sql do diretório de migrations
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => /^\d+/.test(f)) // só arquivos que começam com número
    .sort((a, b) => getMigrationNumber(a) - getMigrationNumber(b));

  if (files.length === 0) {
    console.error("❌ Nenhuma migration encontrada em", MIGRATIONS_DIR);
    process.exit(1);
  }

  console.log(`📁 Encontradas ${files.length} migrations`);

  // Header do arquivo
  const header = `-- ============================================================
-- SCHEMA SAFE - Consolidado de Migrations
-- Gerado automaticamente em: ${new Date().toISOString()}
-- Total de migrations: ${files.length}
--
-- INSTRUÇÕES:
-- 1. Este arquivo é IDEMPOTENTE — pode rodar quantas vezes quiser
-- 2. Sempre use ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS
-- 3. Nunca edite este arquivo manualmente — use o script build-schema-safe.ts
-- 4. Para atualizar: npx tsx scripts/build-schema-safe.ts
-- ============================================================

`;

  // Concatena todas as migrations
  const contents: string[] = [header];

  for (const file of files) {
    const num = getMigrationNumber(file);
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8").trim();

    contents.push(`\n-- === ${file} ===`);
    contents.push(content);
    contents.push("");

    console.log(`  ✅ ${file}`);
  }

  // Footer
  contents.push(`\n-- ============================================================`);
  contents.push(`-- FIM DO SCHEMA SAFE`);
  contents.push(`-- Total: ${files.length} migrations consolidadas`);
  contents.push(`-- ============================================================`);

  // Escreve o arquivo
  fs.writeFileSync(OUTPUT_FILE, contents.join("\n"), "utf-8");

  console.log(`\n📝 schema_safe.sql atualizado com sucesso!`);
  console.log(`   📄 ${OUTPUT_FILE}`);
  console.log(`   🔢 ${files.length} migrations consolidadas`);
}

// Executa
buildSchemaSafe();

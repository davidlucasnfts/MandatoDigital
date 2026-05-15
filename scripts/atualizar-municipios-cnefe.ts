#!/usr/bin/env tsx
/**
 * Script para atualizar nomes dos municipios na tabela CNEFE
 * Usa a API do IBGE para buscar nome do municipio pelo codigo
 *
 * Uso:
 *   npx tsx scripts/atualizar-municipios-cnefe.ts [UF]
 *
 * Exemplo:
 *   npx tsx scripts/atualizar-municipios-cnefe.ts AC
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Erro: Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ufFiltro = process.argv[2]?.toUpperCase();

interface MunicipioIBGE {
  id: number;
  nome: string;
}

async function buscarMunicipiosIBGE(uf: string): Promise<Map<string, string>> {
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as MunicipioIBGE[];
    const map = new Map<string, string>();
    data.forEach((m) => {
      map.set(String(m.id), m.nome.toUpperCase());
    });
    return map;
  } catch (err) {
    console.error(`Erro ao buscar municipios do IBGE para ${uf}:`, err);
    return new Map();
  }
}

async function atualizar() {
  // Busca UFs distintas que tem codigo_municipio mas nao tem nome
  const { data: ufsData, error: ufsError } = await supabase
    .from("cnefe_enderecos")
    .select("uf")
    .is("municipio", null)
    .not("codigo_municipio", "is", null);

  if (ufsError) {
    console.error("Erro ao buscar UFs:", ufsError.message);
    process.exit(1);
  }

  const ufs = [...new Set((ufsData || []).map((r) => r.uf))];
  console.log(`UFs com municipios pendentes: ${ufs.join(", ")}`);

  for (const uf of ufs) {
    if (ufFiltro && uf !== ufFiltro) continue;

    console.log(`\nBuscando municipios de ${uf} no IBGE...`);
    const municipiosMap = await buscarMunicipiosIBGE(uf);
    console.log(`  ${municipiosMap.size} municipios encontrados`);

    if (municipiosMap.size === 0) continue;

    // Atualiza em lotes de 1000
    let atualizados = 0;
    for (const [codigo, nome] of municipiosMap) {
      const { error } = await supabase
        .from("cnefe_enderecos")
        .update({ municipio: nome })
        .eq("uf", uf)
        .eq("codigo_municipio", codigo);

      if (error) {
        console.error(`  Erro ao atualizar ${codigo}:`, error.message);
      } else {
        atualizados++;
      }
    }

    console.log(`  ${atualizados} municipios atualizados em ${uf}`);
  }

  console.log("\nConcluido!");
}

atualizar().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

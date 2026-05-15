#!/usr/bin/env tsx
/**
 * Script para importar dados do CNEFE (IBGE) para o Supabase
 *
 * Uso:
 *   npx tsx scripts/importar-cnefe.ts <caminho-do-csv> [uf]
 *
 * Exemplos:
 *   npx tsx scripts/importar-cnefe.ts "C:/Users/.../12_AC.csv" AC
 *
 * Fonte dos dados:
 *   ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import readline from "readline";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Erro: Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const arquivo = process.argv[2];
const ufFiltro = process.argv[3]?.toUpperCase();

if (!arquivo || !fs.existsSync(arquivo)) {
  console.error("Uso: npx tsx scripts/importar-cnefe.ts <arquivo.csv> [UF]");
  process.exit(1);
}

function parseLinha(linha: string, cabecalho: string[]): Record<string, string> {
  const cols = linha.split(";").map((c) => c.replace(/^"|"$/g, "").trim());
  const obj: Record<string, string> = {};
  cabecalho.forEach((h, i) => {
    obj[h] = cols[i] || "";
  });
  return obj;
}

// Mapeamento de UF pelo codigo IBGE
const UF_MAP: Record<string, string> = {
  "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
  "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE", "29": "BA",
  "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
  "41": "PR", "42": "SC", "43": "RS",
  "50": "MS", "51": "MT", "52": "GO", "53": "DF",
};

async function importar() {
  const fileStream = fs.createReadStream(arquivo, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let cabecalho: string[] | null = null;
  let inseridos = 0;
  let ignorados = 0;
  let lote: Array<{
    uf: string;
    municipio: string;
    bairro: string | null;
    tipo_logradouro: string | null;
    nome_logradouro: string;
    numero: string | null;
    cep: string | null;
    latitude: string;
    longitude: string;
    nivel_geocodificacao: number;
    codigo_unico: string | null;
  }> = [];

  const BATCH_SIZE = 1000;

  for await (const line of rl) {
    if (!cabecalho) {
      cabecalho = line.split(";").map((h) => h.replace(/^"|"$/g, "").trim());
      console.log("Cabecalho:", cabecalho.slice(0, 5).join(", "), "...");
      console.log("Total colunas:", cabecalho.length);
      continue;
    }

    const row = parseLinha(line, cabecalho);

    // Mapeamento das colunas do CNEFE 2022 (nomes reais do IBGE)
    const codUf = row["COD_UF"] || "";
    const uf = UF_MAP[codUf] || ufFiltro || "";
    const codigoMunicipio = row["COD_MUNICIPIO"] || "";
    const bairro = row["DSC_LOCALIDADE"] || null;
    const tipoLogradouro = row["NOM_TIPO_SEGLOGR"] || null;
    const nomeLogradouro = row["NOM_SEGLOGR"] || "";
    const numero = row["NUM_ENDERECO"] || null;
    const cep = (row["CEP"] || "").replace(/\D/g, "");
    const latitude = row["LATITUDE"] || "";
    const longitude = row["LONGITUDE"] || "";
    const codigoUnico = row["COD_UNICO_ENDERECO"] || null;
    const nvGeo = parseInt(row["NV_GEO_COORD"] || "3");

    // Filtro por UF
    if (ufFiltro && uf.toUpperCase() !== ufFiltro) {
      ignorados++;
      continue;
    }

    // Valida dados minimos
    if (!nomeLogradouro || !latitude || !longitude) {
      ignorados++;
      continue;
    }

    // Valida coordenadas
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      ignorados++;
      continue;
    }

    lote.push({
      uf: uf.toUpperCase(),
      codigo_municipio: codigoMunicipio,
      municipio: null, // sera preenchido posteriormente ou via API IBGE
      bairro: bairro?.toUpperCase() || null,
      tipo_logradouro: tipoLogradouro?.toUpperCase() || null,
      nome_logradouro: nomeLogradouro.toUpperCase(),
      numero: numero?.toUpperCase() || null,
      cep: cep || null,
      latitude: latitude,
      longitude: longitude,
      nivel_geocodificacao: nvGeo,
      codigo_unico: codigoUnico,
    });

    if (lote.length >= BATCH_SIZE) {
      const { error } = await supabase.from("cnefe_enderecos").insert(lote);
      if (error) {
        console.error("Erro no lote:", error.message);
      } else {
        inseridos += lote.length;
      }
      lote = [];
      if (inseridos % 10000 === 0) {
        console.log(`Progresso: ${inseridos} enderecos importados...`);
      }
    }
  }

  // Insere o restante
  if (lote.length > 0) {
    const { error } = await supabase.from("cnefe_enderecos").insert(lote);
    if (error) {
      console.error("Erro no lote final:", error.message);
    } else {
      inseridos += lote.length;
    }
  }

  console.log("\n=== Resumo da Importacao ===");
  console.log(`Enderecos inseridos: ${inseridos}`);
  console.log(`Linhas ignoradas: ${ignorados}`);
  console.log(`Total processado: ${inseridos + ignorados}`);
  console.log("\nPara verificar o status:");
  console.log("  SELECT COUNT(*) FROM cnefe_enderecos;");
}

importar().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

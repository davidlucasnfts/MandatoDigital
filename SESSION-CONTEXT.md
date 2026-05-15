# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 14/05/2026
> **Sessão atual:** Mapa Territorial v4 — CNEFE (IBGE) + tiles profissionais

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Mapa Territorial v4** — 14/05

### O que mudou:
1. **Base CNEFE (IBGE) importada** — tabela `cnefe_enderecos` com 106M+ endereços georreferenciados do Censo 2022
2. **Geocodificação híbrida** — busca no CNEFE primeiro (local, instantâneo), fallback para Nominatim (OSM)
3. **Tiles profissionais** — CartoDB Voyager (padrão), Esri World Imagery (satélite), CartoDB Dark Matter (escuro)
4. **Seletor de camada no mapa** — toggle entre Ruas / Satélite / Escuro
5. **Script de importação** — `scripts/importar-cnefe.ts` para importar CSVs do IBGE por UF ou município
6. **Endpoint tRPC `cnefe`** — busca por endereço, busca por CEP, geocodificação, status da importação
7. **Batch geocodificação otimizada** — sem delay para CNEFE, só delay para Nominatim

### Arquivos criados:
- `supabase/migrations/017-cnefe-enderecos.sql` — schema da tabela CNEFE
- `scripts/importar-cnefe.ts` — script de importação dos CSVs do IBGE
- `api/cnefe-router.ts` — endpoints tRPC para busca no CNEFE

### Arquivos modificados:
- `db/schema.ts` — adicionado `cnefeEnderecos`
- `api/router.ts` — registrado `cnefeRouter`
- `api/geocoding-router.ts` — usa CNEFE primeiro, depois Nominatim
- `src/lib/geocoding.ts` — atualizado para usar tRPC CNEFE
- `src/pages/MapaPage.tsx` — tiles CartoDB/Esri + seletor de camada

---

## Funcionalidade entregue nesta sessão
**Mapa Territorial v4 — CNEFE + Tiles Profissionais** — 14/05

---

## Próximo passo definido
**Aguardando definição do David** — opções:
1. Importar CNEFE da(s) UF(s) do mandato (ação manual)
2. Prestação de Contas Pública (portal de transparência)
3. App mobile / PWA para campo
4. Integração WhatsApp API oficial

---

## Bloqueios
Nenhum.

---

## Estrutura de pastas (resumida)
```
src/           → Frontend React (pages, components, hooks, lib)
api/           → Backend tRPC/Hono (routers, middleware, context, lib/audit.ts)
db/            → Schema Drizzle + migrations
contracts/     → Tipos e constantes compartilhados
docs/          → ADRs + guia do projeto
supabase/      → schema_safe.sql + migrations/ (001-017)
scripts/       → Scripts utilitários (importar-cnefe.ts)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [ ] **Importar CNEFE no Supabase** — Baixar CSV da UF do mandato em ftp.ibge.gov.br e rodar:
  1. `npx tsx scripts/importar-cnefe.ts <arquivo.csv> [UF]`
  2. `npx tsx scripts/atualizar-municipios-cnefe.ts [UF]` (busca nomes dos municipios na API IBGE)
- [ ] Rodar migration 017 no Supabase (`supabase/migrations/017-cnefe-enderecos.sql`)
- [ ] Criar mais testes para atingir cobertura 80% (backlog técnico, não bloqueante)
- [ ] Configurar `DATABASE_URL` no Vercel (ver SECURITY.md → Ações Manuais)
- [ ] Trocar senha do banco Supabase (ver SECURITY.md → Ações Manuais)
- [ ] Adicionar domínio na whitelist (ver SECURITY.md → Ações Manuais)

---

## Ações Manuais — REGRA PARA O KIMI
> Sempre que uma funcionalidade exigir ação manual (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar na seção "Decisões pendentes" acima** e **avisar David no final da resposta** com destaque em negrito e emoji ⚠️.

---

## Como atualizar este arquivo
No final de cada sessão, substitua:
1. **Data** no topo
2. **Última funcionalidade trabalhada** — o que foi feito
3. **Próximo passo definido** — o que faremos na próxima sessão
4. **Bloqueios** — se houver
5. **Decisões pendentes** — marcar como [x] quando concluído

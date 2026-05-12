# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 12/05/2026
> **Sessão atual:** Mapa Territorial v2 — cluster, filtros avançados, popups, camadas

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Mapa Territorial v3** — 12/05

### O que mudou:
1. **Cluster de marcadores** — eleitores próximos se agrupam em círculos com contador. Cores por densidade: azul (poucos) → amarelo → laranja → vermelho (100+). Ao clicar, expande os pontos.
2. **Filtros avançados** — comunidade, nível, status, bairro, tags, busca por nome.
3. **Popups ricos** — nome, badges, endereço, telefone, tags, "Ver detalhes".
4. **Camadas toggle** — eleitores, comunidades, cidades fallback, heatmap, rota de visita.
5. **Zoom automático** — flyTo na comunidade ao filtrar.
6. **Estatísticas visuais** — contadores + barra de progresso por nível.
7. **Heatmap de densidade** — gradiente azul→ciano→verde→amarelo→vermelho mostrando concentração de eleitores. Líderes têm intensidade maior.
8. **Rota de visita otimizada** — algoritmo do vizinho mais próximo ordena paradas. Linha tracejada azul no mapa. Lista numerada na sidebar. Botão "Copiar rota" exporta coordenadas.
9. **Dialog de comunidade** — popup e dialog com nome, local, contador de eleitores.

### Arquivos criados:
- `src/components/HeatmapLayer.tsx` — wrapper React para leaflet.heat
- `src/components/AutocompleteBairro.tsx` — dropdown relacional de bairros

### Arquivos modificados:
- `src/pages/MapaPage.tsx` — reescrito completo
- `package.json` — `leaflet.markercluster`, `react-leaflet-cluster`, `leaflet.heat`

---

## Funcionalidade entregue nesta sessão
**Mapa Territorial v3** — 12/05

---

## Próximo passo definido
**Aguardando definição do David** — opções:
1. Prestação de Contas Pública (portal de transparência)
2. App mobile / PWA para campo
3. Integração WhatsApp API oficial
4. Mais hardening de segurança

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
supabase/      → schema_safe.sql + migrations/ (001-016)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Rodar schema_safe.sql atualizado no Supabase (coluna cidade em comunidades)
- [x] Rodar migration 015 no Supabase (lider_id FK em comunidades)
- [x] Rodar migration 016 no Supabase (bairro relacional + lat/lng em comunidades)
- [ ] Criar mais testes para atingir cobertura 80% (backlog técnico, não bloqueante)
- [ ] Adicionar mais cidades ao dataset de bairros (expansão futura)
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

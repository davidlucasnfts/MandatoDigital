# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 07/05/2026
> **Sessão atual:** Melhorias em Solicitações, Comunidades, Mapa e Aniversariantes

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Melhorias Solicitações + Comunidades + Mapa + Aniversariantes** — concluído em 07/05

### O que foi entregue:
- **Migration 009**: `icone TEXT DEFAULT 'Users'` em `comunidades`
- **ComunidadesPage + NovaComunidadeDialog**: ícone dinâmico do lucide-react (select com 60 ícones)
- **MapaPage**: `maxBounds` limitando ao Brasil, tiles CARTO light (mais limpos que OSM)
- **AniversariantesPanel**: filtros dia/semana/mês com toggle visual, data de nascimento (DD/MM) visível
- **Tipos atualizados**: `owner_id` adicionado em `Comunidade`, `Solicitacao`, `Evento`, `Tarefa`
- **Solicitações**: `data_solicitacao`/`data_evento` (migration 008), toggle rápido de status na tabela, status não editável no form de criação
- **Modal de eleitor**: abas Eleitor/Apoiador/Influenciador/Líder com títulos e cores diferentes

### Arquivos criados/modificados:
- `supabase/migrations/009-comunidade-icone-mapa-aniversariantes.sql`
- `src/lib/supabase.ts` — tipos atualizados
- `src/components/NovaComunidadeDialog.tsx` — select de ícone
- `src/pages/ComunidadesPage.tsx` — ícone dinâmico
- `src/pages/MapaPage.tsx` — bounds + tiles CARTO
- `src/components/AniversariantesPanel.tsx` — filtros dia/semana/mês
- `src/components/NovoEleitorDialog.tsx` — abas por nível
- `src/components/NovaSolicitacaoDialog.tsx` — data_solicitacao/data_evento
- `src/pages/SolicitacoesPage.tsx` — toggle rápido status
- `supabase/schema_safe.sql` — atualizado

Type check passando. Commit `48f8c86` realizado.

---

## Próximo passo definido
**Pesquisa de Opinião / Enquetes para base eleitoral** — ALTA prioridade

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
supabase/      → schema_safe.sql + migrations/ (001-009)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Aplicar `schema_safe.sql` no Supabase
- [x] Configurar secrets no GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [x] Rodar migrations 006-008 no Supabase
- [ ] **Rodar migration 009 no Supabase** (`ALTER TABLE comunidades ADD COLUMN icone`)
- [ ] Criar mais testes para atingir cobertura 80% (backlog técnico, não bloqueante)

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

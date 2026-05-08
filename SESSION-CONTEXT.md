# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 07/05/2026
> **Sessão atual:** Pesquisa de Opinião / Enquetes

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Pesquisa de Opinião / Enquetes** — concluído em 07/05

### O que foi entregue:
- **Migration 010**: tabelas `enquetes`, `enquete_opcoes`, `enquete_respostas` com enum `status_enquete`
- **Router tRPC `enquetes`**: list, byId, create, update, delete, estatísticas, responder
- **EnquetesPage**: lista com filtros por status, busca, badges coloridos
- **NovaEnqueteDialog**: criação e edição com título, descrição, status, datas, tipo (única/múltipla), opções dinâmicas (2-10)
- **ResponderEnqueteDialog**: interface para registrar votos, suporta múltipla escolha
- **Estatísticas inline**: gráfico de barras com % por opção, total de respostas
- **Menu lateral**: novo item "Enquetes" com ícone Vote

### Arquivos criados/modificados:
- `supabase/migrations/010-enquetes.sql`
- `db/schema.ts` — tabelas enquetes, enqueteOpcoes, enqueteRespostas + tipos + enum
- `api/enquetes-router.ts` — CRUD completo + estatísticas + responder
- `api/router.ts` — registrado enquetesRouter
- `src/App.tsx` — rota /dashboard/enquetes
- `src/pages/EnquetesPage.tsx` — página de listagem
- `src/components/NovaEnqueteDialog.tsx` — form create/edit
- `src/components/ResponderEnqueteDialog.tsx` — form de voto
- `src/components/DashboardLayout.tsx` — item no menu
- `supabase/schema_safe.sql` — atualizado

Type check passando.

---

## Próximo passo definido
**Prestação de Contas Pública** — MÉDIA prioridade

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
- [ ] **Rodar migration 010 no Supabase** (tabelas enquetes, enquete_opcoes, enquete_respostas)
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

# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 07/05/2026
> **Sessão atual:** Hierarquia de Líderes + Link de Afiliação — CONCLUÍDO

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Hierarquia de Líderes** — concluído em 07/05

### O que foi entregue:
- **Migration 011**: `ALTER TABLE eleitores ADD COLUMN lider_id UUID REFERENCES eleitores(id)`
- **Tipos atualizados**: `nivel` agora só `'lider' | 'eleitor'`, campo `lider_id` adicionado
- **NovoEleitorDialog refatorado**: só 2 abas (Eleitor/Líder), código unificado sem duplicação, campo "Líder Responsável" no cadastro de eleitor, try/catch no submit
- **EleitoresPage atualizada**: filtro de nível só mostra Líder/Eleitor, coluna "Líder" na tabela
- **Hook useConvitesEleitores**: `aprovarConvite` agora usa `lider_id` em vez de `indicador_id`
- **Página pública ConvitePage**: `/convite/:token` — formulário de cadastro que vincula automaticamente o eleitor ao líder via `lider_id`
- **Rota adicionada** em App.tsx

### Arquivos criados/modificados:
- `supabase/migrations/011-lider-eleitor.sql`
- `src/lib/supabase.ts` — tipos atualizados
- `src/components/NovoEleitorDialog.tsx` — refatorado (2 abas, campo lider_id)
- `src/pages/EleitoresPage.tsx` — coluna líder, filtro simplificado
- `src/hooks/useSupabaseData.ts` — aprovarConvite usa lider_id
- `src/pages/ConvitePage.tsx` — página pública de cadastro via link
- `src/App.tsx` — rota /convite/:token

Type check passando.

---

## Próximo passo definido
**Melhorias no projeto atual** — aguardando definição do David

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
supabase/      → schema_safe.sql + migrations/ (001-011)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Aplicar `schema_safe.sql` no Supabase
- [x] Configurar secrets no GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [x] Rodar migrations 006-011 no Supabase
- [x] Rodar migration 010 no Supabase (enquetes)
- [x] Rodar migration 011 no Supabase (lider_id)
- [ ] Criar mais testes para atingir cobertura 80% (backlog técnico, não bloqueante)
- [ ] Revisar `DATABASE_URL` hardcoded em `api/lib/env.ts` — remover antes de deploy em produção (segurança)

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

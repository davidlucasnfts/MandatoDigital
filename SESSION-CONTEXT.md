# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 07/05/2026
> **Sessão atual:** Aplicação das práticas do claude-spec-toolkit

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Melhorias no Cadastro de Eleitores + Correções Críticas** — concluído em 07/05

### Correções críticas:
- **`owner_id` em todos os inserts** — eleitores, comunidades, solicitacoes, tarefas, eventos, interacoes, envios_aniversario. Antes só inseria `user_id`, quebrando RBAC.
- **Schema SQL atualizado** — campos `nome_mae`, `indicador_id` na tabela `eleitores`; índices; tabela `convites_eleitores` com RLS

### Novas funcionalidades:
- **Nome da mãe** — campo no schema, tipo, formulário e preview
- **Busca automática por CEP** — integração ViaCEP, preenche endereço/bairro/cidade/estado automaticamente. CEP não obrigatório.
- **Relacionamento hierárquico** — campo `indicador_id` (FK para eleitores). Líder indica eleitores.
- **Link de afiliação por líder** — `ConviteLinkDialog`: gera token único, link copiável, pré-preenche dados do convidado
- **Aba "Pendentes"** — filtro de status na página de eleitores, com badge de contagem
- **Preview card do eleitor** — clique no nome abre card expandido com todos os dados (mãe, indicador, comunidade, tags, observações)
- **Hook `useConvitesEleitores`** — criar convite, aprovar (cria eleitor automaticamente), rejeitar

### Arquivos criados/modificados:
- `supabase/schema_safe.sql` — schema atualizado
- `src/lib/supabase.ts` — tipos `Eleitor` + `ConviteEleitor`
- `src/hooks/useSupabaseData.ts` — owner_id em todos os inserts + `useConvitesEleitores`
- `src/components/NovoEleitorDialog.tsx` — nome_mae, CEP com ViaCEP, indicador_id
- `src/components/EleitorPreviewCard.tsx` — novo
- `src/components/ConviteLinkDialog.tsx` — novo
- `src/pages/EleitoresPage.tsx` — abas, preview, link de afiliação

Type check passando (app + server). Testes originais (9/9) passando.

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
supabase/      → schema_safe.sql + migrations/ (SQL versionado)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Aplicar `schema_safe.sql` no Supabase para criar `proposicoes`, `tramitacoes` e `audit_logs` em produção
- [x] Configurar secrets no GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [x] Rodar migration 006 no Supabase para aplicar alterações na tabela `eleitores` (nome_mae, indicador_id) e criar `convites_eleitores`
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

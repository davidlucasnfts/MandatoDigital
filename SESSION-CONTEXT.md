# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 14/05/2026
> **Sessão atual:** Correção de campos de data + validação de idade mínima

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Correção de campos de data + validação de idade mínima** — 14/05

### O que mudou:
1. **Correção `formatDateForInput`** — retorna `undefined` em vez de `''` quando não há valor, evitando ano 275760
2. **`min/max` em todos os inputs `type="date"`** — `min="1900-01-01"`, `max` dinâmico conforme contexto
3. **Validação `onBlur` para data de nascimento** — ao sair do campo, corrige para o máximo permitido (18 anos atrás) ou mínimo (1900)
4. **Todos os dialogs corrigidos:** NovaSolicitacaoDialog, NovaEnqueteDialog, NovaTarefaDialog, NovoEventoDialog, InteracoesPanel, NovoEleitorDialog

### Arquivos modificados:
- `src/lib/masks.ts` — `formatDateForInput` retorna `undefined`
- `src/components/NovoEleitorDialog.tsx` — validação `onBlur` com limite de 18 anos
- `src/components/NovaSolicitacaoDialog.tsx` — `min/max` nos 3 campos de data
- `src/components/NovaEnqueteDialog.tsx` — `min/max` nos 2 campos de data
- `src/components/NovaTarefaDialog.tsx` — `min/max` no campo data_prazo
- `src/components/NovoEventoDialog.tsx` — `min/max` no campo data
- `src/components/InteracoesPanel.tsx` — `min/max` no campo data

---

## Funcionalidade entregue nesta sessão
**Correção de campos de data + validação de idade mínima (18 anos)** — 14/05

---

## Próximo passo definido
**Aguardando definição do David** — opções:
1. Prestação de Contas Pública (portal de transparência)
2. App mobile / PWA para campo
3. Integração WhatsApp API oficial

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

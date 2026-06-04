# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 04/06/2026
> **Sessão atual:** Dashboard — Dados reais restaurados, mock removido

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Comunicação — Campanhas e Templates — 04/06**

### ✅ O que foi entregue:
- **Schema do banco:**
  - Migration `032-comunicacao-campanhas-templates.sql`
  - Tabelas: `templates_mensagem`, `campanhas`, `envios_campanha`
  - RLS com `user_has_access(owner_id)`

- **Hooks:**
  - `useCampanhas.ts` — CRUD campanhas + envios
  - `useTemplates.ts` — CRUD templates

- **Components:**
  - `NovaCampanhaDialog.tsx` — 3 etapas: mensagem → destinatários → revisar/enviar
  - `NovoTemplateDialog.tsx` — criação com preview e variáveis

- **ComunicacaoPage.tsx refatorada:**
  - Stats cards (total campanhas, enviadas, em andamento, total envios)
  - Aba Campanhas: lista com status, progresso, barra de envio
  - Aba Templates: cards com tipo, variáveis, excluir
  - Filtros por comunidade, bairro, tag
  - Seleção múltipla de eleitores
  - Envio via WhatsApp Web (wa.me links)
  - Registro de envios no banco

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Criar migration SQL (templates, campanhas, envios)
- [x] Atualizar db/schema.ts
- [x] Atualizar src/lib/supabase.ts (tipos)
- [x] Criar hook useCampanhas
- [x] Criar hook useTemplates
- [x] Criar NovaCampanhaDialog (3 etapas)
- [x] Criar NovoTemplateDialog
- [x] Refatorar ComunicacaoPage
- [x] Type check passando
- [x] Atualizar SESSION-CONTEXT.md

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| DashboardHomeV2 | `DashboardHomeV2.tsx` | 04/06 | **Promovido à produção** — arquivo mantido para histórico |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 01/06 | **Promovida à produção** — arquivo mantido para histórico |
| Mapa V1 | `MapaPageV1.tsx` | 28/05 | Arquivado — teste de clusters com ícones |
| Mapa V2 | `MapaPageV2.tsx` | 01/06 | **Em produção** — cópia de trabalho mantida |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |

---

## Decisões Pendentes
- Nenhuma. Dashboard com dados reais em produção.

---

## Próxima Sessão — Sugestões
1. Testar Dashboard em produção após deploy
2. Revisar outras páginas que precisam de refatoração (Equipe, Enquetes, etc.)
3. App mobile / PWA para campo

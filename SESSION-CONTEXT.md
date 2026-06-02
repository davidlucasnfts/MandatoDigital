# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 01/06/2026
> **Sessão atual:** Solicitações V3 — Promovida à página principal

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Solicitações V3 — Página Principal — 01/06**

### ✅ O que foi entregue:
- **Lista de Solicitações:**
  - Seções colapsáveis (Concluídas/Canceladas) com badge count
  - Preview inline expandido ao clicar na linha
  - Botões com texto+ícone (Editar azul, Excluir vermelho)
  - Responsividade: tabela mobile 2 colunas / desktop 7 colunas
  - Limites de caracteres: título 60, descrição 250

- **Kanban:**
  - Drag-and-drop entre colunas (muda status ao soltar)
  - Modal central de preview (overlay escuro, max-w-lg)
  - Colunas minimizáveis com preview compacto (5 títulos)
  - Título truncado no card com tooltip
  - Responsividade: 1 col mobile / 2 tablet / 4 desktop

- **Design System:**
  - Stats cards clicáveis filtram por status
  - Filtros expansíveis (status, prioridade)
  - Badges coloridos por status/prioridade
  - Cores fixas: Pendente(âmbar), Andamento(azul), Concluído(verde), Cancelado(vermelho)

- **Excluir → Cancelar:**
  - Não deleta do banco, muda status para "cancelado"
  - Constraint do banco só permite 4 status

### ⚠️ Erros cometidos e corrigidos:
- **Tabela mobile antiga sem seções colapsáveis** — Tabela embutida na V3 renderizava em paralelo com componente. Removida, usa SolicitacoesLista unificado.
- **Título quebrando 1 palavra/linha no Kanban** — `break-words` + container estreito. Corrigido com modal central (largura adequada).
- **Overlay do modal não cobria tela toda** — Padding no container flex. Corrigido separando overlay (inset-0) do container do modal.

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Corrigir tabela mobile (remover antiga, usar componente unificado)
- [x] Criar SolicitacoesKanban com DnD e modal central
- [x] Colunas minimizáveis no Kanban
- [x] Preview compacto quando coluna minimizada
- [x] Título truncado no card do Kanban
- [x] Corrigir quebra de título no preview (break-all)
- [x] Corrigir overlay do modal (cobrir tela inteira)
- [x] Copiar V3 → SolicitacoesPage.tsx (produção)
- [x] Remover rota /solicitacoes/teste-v3 do App.tsx
- [x] Remover link "Solicitações V3" do sidebar
- [x] Atualizar MEMORY.md
- [x] Commit

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
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
- Nenhuma. Solicitações V3 em produção.

---

## Próxima Sessão — Sugestões
1. Testar Solicitações em produção após deploy
2. Revisar outras páginas que precisam de refatoração (Equipe, Enquetes, etc.)
3. App mobile / PWA para campo

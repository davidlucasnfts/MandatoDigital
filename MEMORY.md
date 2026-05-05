# MandatoDigital — Check-in

CRM para gestão de mandatos políticos. Stack: React + TS + Vite + Tailwind + shadcn/ui + Supabase + Drizzle (PostgreSQL). Deploy: Vercel.

## ✅ Pronto
| Funcionalidade | Data |
|---|---|
| Eleitores, Comunidades, Solicitações (CRUD completo) | — |
| Import/Export CSV | — |
| Kanban drag-and-drop | — |
| Registro de Interações | — |
| Dashboard com dados reais | — |
| Comunicação E-mail/SMS | — |
| Agenda e Documentos | — |
| Automação de Aniversário (WhatsApp) | 04/05 |
| Mapa Territorial (Leaflet + OpenStreetMap) | 04/05 |
| Landing Page (foco conversão) | 04/05 |
| Multi-usuário RBAC (admin/editor/visualizador) | 05/05 |
| Relatórios PDF/CSV (6 gráficos, KPIs, filtros) | 06/05 |

## 🎯 Próxima
**Website Integrado** — landing page do candidato dentro da plataforma (BAIXA)

## 📋 Backlog
- Website integrado (BAIXA)

## 📝 Última Sessão
06/05/2026 — Relatórios PDF/CSV finalizados. 6 gráficos reais do Supabase, KPIs dinâmicos, filtros de período, exportação configurável.

## ⚡ Regras
Ver `AGENTS.md` para todas as regras globais. Sempre atualizar este arquivo e o `roadmap.html` ao final de cada sessão.

---

## 📖 Versão Detalhada

<details>
<summary>Clique para expandir histórico completo</summary>

### Entregas por Sessão

**06/05/2026** — Relatórios PDF/CSV
- 6 gráficos com dados reais do Supabase (solicitações por categoria, eleitores por comunidade, status, crescimento mensal, eleitores por nível, tarefas por prioridade)
- KPIs dinâmicos (total eleitores, solicitações, taxa resolução)
- Filtro de período (30d/3m/6m/1y/all)
- Exportação PDF via html2canvas (A4 landscape, cabeçalho profissional)
- Exportação CSV com seleção de dados e nome customizado

**05/05/2026** — Multi-usuário com Permissões RBAC
- Schema: tabela `equipe` com `user_id`, `owner_id`, `role` (admin/editor/visualizador)
- `owner_id` adicionado em todas as tabelas de negócio
- RLS com função `user_has_access()` — dono ou membro ativo acessa dados
- Backend: TRPC context extrai JWT do Supabase, busca role na tabela `equipe`
- Middleware `adminQuery` e `editorQuery` funcionais
- Router `equipe`: list, create, update, remove
- Frontend: hook `usePermissions()`, `RoleGuard`, menu adaptativo, `EquipePage` funcional

**04/05/2026** — Automação de Aniversário + Mapa + Landing Page
- Envio em massa via WhatsApp, template configurável, registro de envios
- Mapa territorial com Leaflet + OpenStreetMap, filtros, Dialog para detalhes
- Landing page redesenhada com foco em conversão política

### Arquitetura de Decisões
- **Modelo "Conta compartilhada"**: dono cadastra membros diretamente (sem convite por email)
- **Backend infere `ownerId` do contexto** — frontend não manda, impossível de bypassar
- **PDF 100% frontend** — html2canvas captura gráficos recharts, gera PDF A4 landscape

</details>

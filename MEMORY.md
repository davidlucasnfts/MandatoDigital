# MandatoDigital — Check-in

CRM para gestão de mandatos políticos. Stack: React + TS + Vite + Tailwind + shadcn/ui + Supabase + Drizzle (PostgreSQL).
Deploy: Vercel (serverless).

## ✅ Pronto
Eleitores (tags, níveis, comunidades, CPF), Import/Export CSV, Kanban drag-and-drop, CRUD completo, Interações, Dashboard real, Comunicação e-mail/SMS, Agenda e documentos, Automação de Aniversário, Mapa Territorial, Landing Page, Multi-usuário com Permissões (RBAC), Relatórios PDF/CSV com dados reais.

## 🎯 Próxima Tarefa
**Etiquetas para Mala Direta** — geração de PDF com etiquetas para correspondência física (prioridade ALTA).

## 📋 Backlog
- Etiquetas para mala direta (ALTA)
- Website integrado (BAIXA)

## ✅ Entregues
- Automação de Aniversário MVP (WhatsApp em massa, template configurável, registro de envios)
- Mapa Territorial por Cidade/Bairro (distribuição real, filtros, heatmap visual)
- Landing Page redesenhada com foco em conversão política
- Multi-usuário com Permissões RBAC (3 roles: admin/editor/visualizador, convite de equipe, RLS compartilhado, proteção de rotas)
- Relatórios PDF/CSV (6 gráficos reais, KPIs, filtros de período, exportação configurável)

## 📝 Última Sessão
05/05/2026 — Multi-usuário com Permissões RBAC + Relatórios PDF/CSV. Schema com tabela equipe + owner_id em todas as tabelas, RLS com user_has_access(), backend auth context integrado com Supabase, router equipe (CRUD), hook usePermissions, RoleGuard, EquipePage funcional. Relatórios com 6 gráficos reais do Supabase, KPIs, filtros de período, exportação PDF (A4 landscape com html2canvas) e CSV com seleção de dados e nome customizado.

## ⚡ Regras
- Ver `AGENTS.md` para todas as regras globais (design, deploy, tokens, código)
- Atualizar este arquivo e o roadmap.html ao final de cada sessão

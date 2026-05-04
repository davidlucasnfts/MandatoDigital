# MandatoDigital — Check-in

CRM para gestão de mandatos políticos. Stack: React + TS + Vite + Tailwind + shadcn/ui + Supabase + Drizzle (PostgreSQL).
Deploy: Vercel (serverless).

## ✅ Pronto
Eleitores (tags, níveis, comunidades, CPF), Import/Export CSV, Kanban drag-and-drop, CRUD completo, Interações, Dashboard real, Comunicação e-mail/SMS, Agenda e documentos.

## 🎯 Próxima Tarefa
**Automação de Aniversário** — envio automático de mensagens no aniversário do eleitor (prioridade ALTA).

## 📋 Backlog
- Mapa com geolocalização real (ALTA)
- Multi-usuário com permissões (MÉDIA)
- Etiquetas para mala direta (MÉDIA)
- Website integrado (BAIXA)

## 📝 Última Sessão
04/05/2026 — Commit `b9a1992`. Entregou: painéis do dashboard, kanban, exportação CSV, importação CSV inteligente, CRUD com dialogs, melhorias nas páginas.
04/05/2026 — Commit `b68364d`. Removeu toda dependência do Kimi OAuth. Projeto 100% independente da IA geradora.
04/05/2026 — Commit `7d7f036`. Migrou banco de MySQL para PostgreSQL. Deploy na Vercel concluído. Supabase Auth configurado sem confirmação de e-mail.

## ⚡ Regras
- 400 linhas máx por arquivo (exceto shadcn/ui)
- Sempre em português, modo direto
- Atualizar este arquivo e o roadmap.html ao final de cada sessão

## 🚀 Deploy na Vercel
Variáveis de ambiente necessárias:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- **Deploy padrão: Vercel** — todos os projetos devem ser adaptados para Vercel (serverless)
- **Independência de IA** — nunca deixar dependência de plataforma/oauth do gerador de código

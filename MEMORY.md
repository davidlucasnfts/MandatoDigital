# MandatoDigital — Check-in

CRM para gestão de mandatos políticos. Stack: React + TS + Vite + Tailwind + shadcn/ui + Supabase + Drizzle (PostgreSQL).
Deploy: Vercel (serverless).

## ✅ Pronto
Eleitores (tags, níveis, comunidades, CPF), Import/Export CSV, Kanban drag-and-drop, CRUD completo, Interações, Dashboard real, Comunicação e-mail/SMS, Agenda e documentos.

## 🎯 Próxima Tarefa
**Multi-usuário com Permissões** — níveis de acesso: admin, assessor, voluntário (prioridade MÉDIA).

## 📋 Backlog
- Multi-usuário com permissões (MÉDIA)
- Etiquetas para mala direta (MÉDIA)
- Website integrado (BAIXA)

## ✅ Entregues
- Automação de Aniversário MVP (WhatsApp em massa, template configurável, registro de envios)
- Mapa Territorial por Cidade/Bairro (distribuição real, filtros, heatmap visual)
- Landing Page redesenhada com foco em conversão política (hero com dor, antes/depois, prova social, depoimentos com resultados)

## 📝 Última Sessão
04/05/2026 — Commit `b9a1992`. Entregou: painéis do dashboard, kanban, exportação CSV, importação CSV inteligente, CRUD com dialogs, melhorias nas páginas.
04/05/2026 — Commit `b68364d`. Removeu toda dependência do Kimi OAuth. Projeto 100% independente da IA geradora.
04/05/2026 — Commit `7d7f036`. Migrou banco de MySQL para PostgreSQL. Deploy na Vercel concluído. Supabase Auth configurado sem confirmação de e-mail.
04/05/2026 — Commit `0f31817`. Automação de Aniversário MVP: envio em massa via WhatsApp, template salvo no banco, registro de envios, painel no dashboard.

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

## 💰 Economia de Tokens
Regras para reduzir consumo de tokens em todas as sessões:
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto
- **Schema SQL** — sempre usar `schema_safe.sql` (nunca `schema.sql`), comentar data+descricao no topo de cada alteração

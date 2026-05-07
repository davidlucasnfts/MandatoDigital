# Migrations do MandatoDigital

## Como usar

### Para aplicar uma nova alteração:
1. Crie um novo arquivo: `NNN-descricao-curta.sql` (numeração sequencial)
2. Use `IF NOT EXISTS` / `IF EXISTS` para ser idempotente
3. Rode **apenas esse arquivo** no Supabase SQL Editor

### Para recriar o banco do zero:
Rode o `../schema_safe.sql` inteiro — ele junta todas as migrations em um arquivo só.

## Histórico

| # | Arquivo | Data | O que faz |
|---|---|---|---|
| 001 | `001-schema-inicial.sql` | baseline | Tabelas base: comunidades, eleitores, solicitacoes, tarefas, eventos, documentos, comunicacoes |
| 002 | `002-multi-usuario-rbac.sql` | 04/05/2026 | Tabela equipe, owner_id, funcao user_has_access, RLS atualizado |
| 003 | `003-automacao-aniversario.sql` | 04/05/2026 | Tabelas configuracoes e envios_aniversario |
| 004 | `004-logs-auditoria.sql` | 07/05/2026 | Tabela audit_logs para LGPD |
| 005 | `005-producao-legislativa.sql` | 07/05/2026 | Tabelas proposicoes, tramitacoes, enums |
| 006 | `006-melhorias-eleitores.sql` | 07/05/2026 | nome_mae, indicador_id, convites_eleitores |
| 007 | `007-storage-bucket.sql` | baseline | Bucket documentos no Storage |

## Regra para o Kimi

> Sempre que criar uma nova migration:
> 1. Criar arquivo em `supabase/migrations/NNN-descricao.sql`
> 2. Atualizar este README
> 3. Regenerar `supabase/schema_safe.sql` (juntar todas as migrations)
> 4. Avisar David qual arquivo rodar

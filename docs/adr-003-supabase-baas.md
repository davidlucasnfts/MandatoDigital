# ADR-003: Supabase como Backend-as-a-Service

**Data:** 2026-05-06
**Status:** Aceita
**Decisores:** David Lucas, Kimi Code

## Contexto

O projeto precisa de banco de dados relacional, autenticação, storage de arquivos e real-time subscriptions. Construir tudo isso do zero consumiria semanas de desenvolvimento.

## Decisão

Usar Supabase como plataforma unificada: PostgreSQL hospedado, Auth (JWT), Storage e Row Level Security.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| PostgreSQL self-hosted + Keycloak | Controle total | Manutenção, backup, segurança — overhead grande |
| Firebase | Maturidade, documentação | Vendor lock-in Google, NoSQL limitante |
| **Supabase** (escolhido) | Open source, PostgreSQL padrão, auth integrado | Vendor lock-in (mitigável), limites de free tier |

## Consequências

- ✅ Auth pronto com OAuth, email/senha, magic links
- ✅ RLS para segurança em nível de banco
- ✅ Storage com políticas de acesso
- ✅ Real-time subscriptions nativo
- ⚠️ Free tier: 500MB db, 2GB storage, 100k users/mês
- ⚠️ Vendor lock-in mitigado por usar PostgreSQL padrão (migração possível)

## Notas

- Monitorar uso para upgrade pro plano Pro quando necessário
- Backup automático configurado no painel Supabase

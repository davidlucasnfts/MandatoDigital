# ADR-001: Monolito Full-Stack com Separação Lógica

**Data:** 2026-05-06
**Status:** Aceita
**Decisores:** David Lucas (Product Owner), Kimi Code (Dev)

## Contexto

O MandatoDigital é um SaaS para gestão de mandatos políticos. O time de desenvolvimento é de 1-2 pessoas (David Lucas como PO + Kimi Code como ferramenta de desenvolvimento). A prioridade é velocidade de entrega e simplicidade operacional.

## Decisão

Manter frontend (React) e backend (tRPC/Hono) no mesmo repositório, com separação lógica via pastas `src/` e `api/`.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Microsserviços | Escalabilidade independente, times autônomos | Complexidade operacional, overhead para time pequeno |
| Repositórios separados | Isolamento claro, deploy independente | Sincronização de types, mais configuração de CI/CD |
| **Monolito full-stack** (escolhido) | Deploy unificado, compartilhamento de types, simplicidade | Risco de acoplamento se não houver disciplina |

## Consequências

- ✅ Deploy simplificado na Vercel (SPA + API serverless)
- ✅ Types compartilhados entre frontend e backend sem codegen
- ✅ Menor complexidade cognitiva para time pequeno
- ⚠️ Risco de acoplamento — mitigado com camadas claras (router → service → db)
- ⚠️ Escalar backend separadamente exigirá refactor futuro

## Notas

- Se o time crescer além de 3 devs, reavaliar separação
- API deve permanecer stateless para permitir extração futura

# ADR-002: tRPC em vez de REST tradicional

**Data:** 2026-05-06
**Status:** Aceita
**Decisores:** David Lucas, Kimi Code

## Contexto

O projeto usa TypeScript em 100% do código (frontend e backend). A comunicação entre camadas precisa ser type-safe sem gerar boilerplate de DTOs, OpenAPI, ou clientes HTTP.

## Decisão

Usar tRPC como camada de comunicação entre frontend e backend, com Zod para validação de inputs.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| REST + OpenAPI | Padrão universal, documentação automática | Boilerplate de DTOs, código de cliente manual |
| GraphQL | Flexibilidade de queries | Overhead para queries simples, necessita codegen |
| **tRPC** (escolhido) | Type safety end-to-end, zero boilerplate | Lock-in TypeScript, documentação menos acessível |

## Consequências

- ✅ Autocompletion no editor para todas as rotas
- ✅ Refatorações seguras (quebra de build se API mudar)
- ✅ Validação integrada com Zod
- ⚠️ Documentação de API não é auto-gerada — usar comentários JSDoc se necessário
- ⚠️ Dificuldade para integração com terceiros (mitigável com REST wrapper futuro)

## Notas

- Se necessário expor API pública no futuro, adicionar camada REST/Hono separada

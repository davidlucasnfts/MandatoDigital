<!-- 20/05/2026 - Plano de testes do projeto -->

# Plano de Testes — Mandato Digital

## Estrategia

```
       /\
      /  \
     / E2E \        ← Playwright — fluxos criticos (login, criar enquete)
    /--------\
   /Integracao\     ← tRPC + Testcontainers — routers, banco real
  /------------\
 /  Unitarios   \   ← Vitest — hooks, utils, validacao Zod
/--------------/
```

| Tipo | Meta | Ferramenta |
|------|------|------------|
| Unitario | 70% | Vitest |
| Integracao | 20% | Vitest + tRPC test client |
| E2E | 10% | Playwright |

---

## Cenarios de Teste

### Modulo: Autenticacao

| ID | Cenario | Tipo | Prioridade |
|----|---------|------|------------|
| TC-AUTH-001 | Login com credenciais validas retorna usuario | Integracao | Alta |
| TC-AUTH-002 | Login com senha incorreta retorna 401 | Integracao | Alta |
| TC-AUTH-003 | Acesso sem token retorna 401 | Integracao | Alta |
| TC-AUTH-004 | Logout limpa sessao | E2E | Media |

### Modulo: Enquetes

| ID | Cenario | Tipo | Prioridade |
|----|---------|------|------------|
| TC-ENQ-001 | Criar enquete com 2+ opcoes | Integracao | Alta |
| TC-ENQ-002 | Criar enquete com < 2 opcoes rejeita (Zod) | Integracao | Alta |
| TC-ENQ-003 | Editar enquete rascunho | Integracao | Alta |
| TC-ENQ-004 | Publicar enquete muda status | Integracao | Alta |
| TC-ENQ-005 | Votar em enquete publicada | Integracao | Alta |
| TC-ENQ-006 | Votar em enquete rascunho rejeita | Integracao | Alta |
| TC-ENQ-007 | Votar opcao invalida rejeita | Integracao | Alta |
| TC-ENQ-008 | Votar multipla escolha quando nao permitido rejeita | Integracao | Alta |
| TC-ENQ-009 | Estatisticas retornam contagem correta | Integracao | Media |
| TC-ENQ-010 | Listar enquetes filtra por owner_id | Integracao | Alta |

### Modulo: Equipe (RBAC)

| ID | Cenario | Tipo | Prioridade |
|----|---------|------|------------|
| TC-EQP-001 | Admin cria membro da equipe | Integracao | Alta |
| TC-EQP-002 | Editor tenta criar membro — rejeita 403 | Integracao | Alta |
| TC-EQP-003 | Visualizador tenta criar enquete — rejeita 403 | Integracao | Alta |
| TC-EQP-004 | Desativar membro muda status para inativo | Integracao | Media |

### Modulo: Proposicoes

| ID | Cenario | Tipo | Prioridade |
|----|---------|------|------------|
| TC-PROP-001 | Criar proposicao com tipo valido | Integracao | Alta |
| TC-PROP-002 | Adicionar tramitacao | Integracao | Media |
| TC-PROP-003 | Listar proposicoes por status | Integracao | Media |

### Modulo: CNEFE / Geocodificacao

| ID | Cenario | Tipo | Prioridade |
|----|---------|------|------------|
| TC-GEO-001 | Buscar enderecos por UF e municipio | Integracao | Media |
| TC-GEO-002 | Geocodificar endereco retorna lat/lng | Integracao | Media |

---

## Ferramentas

| Tipo | Ferramenta | Config |
|------|------------|--------|
| Unitario | Vitest | `vitest.config.ts` — environment: node |
| Integracao | Vitest + tRPC test client | Banco SQLite em memoria ou Testcontainers |
| E2E | Playwright | `playwright.config.ts` — baseURL: http://localhost:5173 |
| Mock HTTP | MSW | Interceptar chamadas tRPC |

---

## Cobertura Minima

```
lines: 70%
functions: 70%
branches: 60%
statements: 70%
```

Excluir:
- `src/components/ui/` (shadcn/ui — biblioteca externa)
- `src/pages/` (coberto por E2E)
- `*.config.*`

---

## CI/CD

```yaml
# .github/workflows/test.yml
- name: Testes unitarios
  run: npm run test:unit

- name: Testes de integracao
  run: npm run test:integration

- name: Testes E2E
  run: npm run test:e2e
```

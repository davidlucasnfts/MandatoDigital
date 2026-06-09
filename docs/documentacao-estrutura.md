# 📁 Estrutura de Documentação — MandatoDigital

> **Arquivo de referência obrigatória.** O Kimi deve consultar este documento antes de criar, mover ou modificar qualquer arquivo de documentação.

---

## Regra de Ouro

**Nunca duplicar informação entre arquivos. Cada arquivo tem uma função única.**

---

## Mapa de Documentos

| Arquivo | Local | Função | Quem usa | Quando atualizar |
|---------|-------|--------|----------|------------------|
| `AGENTS.md` | Raiz do projeto | **Regras para codar** — segurança, UX, padrões | Kimi (todo dia) | Novas regras ou convenções |
| `MEMORY.md` | Raiz do projeto | **Histórico de entregas** — o que foi feito e quando | David + Kimi | Cada funcionalidade entregue |
| `SESSION-CONTEXT.md` | Raiz do projeto | **Estado atual** — última funcionalidade, próximo passo, bloqueios | Kimi (início de sessão) | Cada sessão |
| `docs/adr-*.md` | Pasta `docs/` | **Decisões arquiteturais** — por que tomamos cada decisão | Time técnico | Novas decisões arquiteturais |
| `docs/mandato-digital-guia.md` | Pasta `docs/` | **Guia técnico completo** — stack, padrões, exemplos | Novos devs | Mudanças na arquitetura |
| `docs/diagrama-er.md` | Pasta `docs/` | **Diagrama ER** — modelo de dados em Mermaid | Time técnico | Mudanças no schema |
| `docs/regras-de-negocio.md` | Pasta `docs/` | **Regras de negócio** — RBAC, validações, fluxos | Time técnico + PO | Mudanças em regras |
| `docs/diagramas-estado.md` | Pasta `docs/` | **Diagramas de estado** — ciclos de vida das entidades | Time técnico | Novos status/entidades |
| `docs/padroes-frontend.md` | Pasta `docs/` | **Padrões de frontend** — componentes, hooks, forms | Devs frontend | Mudanças na stack UI |
| `docs/plano-de-testes.md` | Pasta `docs/` | **Plano de testes** — estratégia, cenários, cobertura | QA + Devs | Novas funcionalidades |
| `docs/plano-refatoracao-sprints.md` | Pasta `docs/` | **Plano de refatoração** — sprints de higiene, segurança, banco, frontend e testes | Time técnico + David | Novas dívidas técnicas identificadas |
| `docs/guia-setup-waha-vps.md` | Pasta `docs/` | **Guia passo a passo** — setup seguro da WAHA na VPS com placeholders | David (infra) | Mudanças na infra WAHA |
| `docs/runbook.md` | Pasta `docs/` | **Runbook operacional** — deploy, troubleshooting, links | DevOps + Devs | Mudanças na infra |
| `docs/gestao-skills.md` | Pasta `docs/` | **Como usar as 50 skills** — detecção automática, fluxo de trabalho | David + Kimi | Mudanças nas skills |
| `docs/documentacao-estrutura.md` | Pasta `docs/` | **Este arquivo** — mapa de onde vai cada coisa | Kimi | Mudanças na estrutura |
| `README.md` | Raiz do projeto | **Visão geral** — setup, scripts, descrição | Contribuidores | Mudanças no setup |
| `MestreProjects.md` | `C:\Users\David Lucas\Documents\PROJETOS IA\` | **Padrão global** — regras para todos os projetos | Kimi (novos projetos) | Novos padrões descobertos |

---

## Onde colocar cada tipo de informação

### Segurança
- **Regras para codar** → `AGENTS.md` (seção "Segurança")
- **Decisão arquitetural** → `docs/adr-005-seguranca-padrao.md`
- **Padrão global** → `MestreProjects.md` (seção 2)

### UX/UI
- **Regras para codar** → `AGENTS.md` (seção "Design UX/UI")
- **Decisão arquitetural** → `docs/adr-004-tailwind-shadcn.md`

### Funcionalidade entregue
- **O que foi feito** → `MEMORY.md` (tabela + resumo da sessão)
- **Estado atual** → `SESSION-CONTEXT.md`

### Nova decisão arquitetural
- **ADR** → `docs/adr-NNN-nome.md`
- **Referência no guia** → `docs/mandato-digital-guia.md`

---

## Anti-padrões (PROIBIDO)

| ❌ Errado | ✅ Certo |
|-----------|----------|
| Criar `SECURITY.md` na raiz quando `AGENTS.md` já existe | Colocar regras em `AGENTS.md` |
| Duplicar checklist em 3 arquivos | Manter 1 fonte, referenciar nos outros |
| Colocar histórico no `SESSION-CONTEXT.md` | `SESSION-CONTEXT` = estado atual; `MEMORY` = histórico |
| Documentar decisão só no `AGENTS.md` | Criar ADR + referenciar no `AGENTS.md` |

---

## Checklist antes de criar novo arquivo de doc

```
□ Já existe um arquivo com essa função?
□ Se sim, devo expandir ele ou realmente preciso de um novo?
□ Se novo, qual é a função única dele?
□ Os outros arquivos referenciam ele corretamente?
□ Atualizei este mapa (documentacao-estrutura.md)?
```

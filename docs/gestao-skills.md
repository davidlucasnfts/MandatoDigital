<!-- 20/05/2026 - Como usar as skills no dia a dia do projeto -->

> **Versao global:** Veja `MestreProjects/10-skills.md` para referencia completa aplicavel a todos os projetos.
> Este arquivo e especifico do MandatoDigital.

# Gestão de Skills — Mandato Digital

## O que mudou

Antes: 10 skills do Kimi disponíveis  
Agora: **50 skills** (11 originais + 32 convertidas do claude-spec-toolkit + 7 convertidas dos agentes do Claude)

---

## Como ativar uma skill

**NÃO precisa digitar comando.** O Kimi detecta automaticamente pelo contexto da conversa.

### Como funciona a detecção

Cada skill tem um `description` no YAML frontmatter. O Kimi lê sua mensagem e compara com as descriptions — se bater, carrega a skill.

**Exemplos práticos:**

| Você diz... | Skill ativada automaticamente |
|-------------|------------------------------|
| "documentar o schema do banco" | `diagrama-er` |
| "como testar essa funcionalidade" | `testes` + `plano-de-testes` |
| "criar user story para nova feature" | `user-stories` |
| "documentar regra de negocio" | `regras-de-negocio` |
| "fazer diagrama de sequencia do fluxo de login" | `diagramas-sequencia` |
| "melhorar performance da API" | `scalability` |
| "revisar seguranca do codigo" | `security` |
| "reduzir custo da infra" | `cost-reducer` |

### Se quiser forçar uma skill específica

Digite o nome da skill na mensagem:

```
Usando a skill diagramas-estado, mapeie o ciclo de vida do pedido
```

Ou use o comando:

```
/skill nome-da-skill
```

---

## Skills que aplicam ao Mandato Digital

### Sempre úteis (uso frequente)

| Skill | Quando usar | Já usamos para |
|-------|-------------|----------------|
| `react-frontend` | Novo componente, refatoração UI | `docs/padroes-frontend.md` |
| `testes` | Escrever testes, cobertura | `docs/plano-de-testes.md` |
| `diagrama-er` | Mudança no schema | `docs/diagrama-er.md` |
| `diagramas-estado` | Nova entidade com status | `docs/diagramas-estado.md` |
| `regras-de-negocio` | Nova regra, validação | `docs/regras-de-negocio.md` |
| `self-healing` | Antes de qualquer operação de arquivo | Checklist de erros |
| `security` | Revisão de código, nova feature sensível | Hardening |
| `arquiteto-solucoes` | Decisão arquitetural, trade-offs | — |
| `arquiteto-postgresql` | Modelagem avançada, performance | — |
| `engenheiro-dba` | DDL, migrations, constraints | — |
| `analista-de-negocio` | Levantar requisitos, user stories | — |
| `technical-writer` | Documentação técnica, runbooks | — |

### Úteis ocasionalmente

| Skill | Quando usar |
|-------|-------------|
| `diagramas-sequencia` | Fluxo complexo com múltiplos atores |
| `c4-model` | Documentar arquitetura de alto nível |
| `user-stories` | Decompor feature grande em stories |
| `requisitos` | Documentar RF/RNF antes de implementar |
| `integracao` | Nova API externa (ex: WhatsApp oficial) |
| `glossario` | Novos termos de domínio |
| `release-notes` | Preparar release |
| `runbook` | Novo procedimento operacional |
| `engenheiro-devops` | IaC, observabilidade, GitOps |
| `engenheiro-kubernetes-docker` | Containers, K8s, Helm (futuro) |

### Não aplicam (ignorar)

| Skill | Por quê |
|-------|---------|
| `spring-boot-3` | Java — não usamos |
| `kubernetes` | Vercel serverless, não K8s |
| `devops` | Terraform, Ansible — infra própria |
| `cloud-azure` | Usamos Vercel + Supabase |
| `nuxt` | Vue — usamos React |
| `vue-frontend` | Vue — usamos React |
| `react-native` | Mobile — projeto é web |
| `clean-architecture` | Over-engineering para monolito |
| `event-driven` | Sem Kafka/eventos |
| `microservices-patterns` | Projeto é monolito |
| `ddd` | Domínio ainda simples |
| `design-patterns` | Não aplicável no momento |

---

## Fluxo de trabalho recomendado

### Antes de implementar qualquer feature

```
1. Você: "Quero adicionar [feature X]"
2. Kimi ativa: analista-de-negocio, user-stories, requisitos
3. Kimi propõe: user stories, critérios de aceite, requisitos
4. Você: aprova ou ajusta
5. Kimi ativa: arquiteto-solucoes (se houver decisão arquitetural)
6. Kimi propõe: alternativas com trade-offs
7. Kimi ativa: diagramas-estado (se houver status novo)
8. Kimi propõe: diagrama de estado da entidade
9. Kimi ativa: regras-de-negocio
10. Kimi propõe: regras de validação, permissões
11. Kimi ativa: diagrama-er + arquiteto-postgresql (se houver tabela nova)
12. Kimi propõe: migration + schema otimizado
13. Implementação
```

### Durante implementação

```
1. Kimi ativa: react-frontend (se for UI)
2. Kimi segue: padrões de componentes, botões, tabelas
3. Kimi ativa: testes
4. Kimi escreve: testes unitários + integração
5. Kimi ativa: self-healing
6. Kimi verifica: checklist antes de alterar arquivos
```

### Após implementação

```
1. Kimi ativa: release-notes
2. Kimi atualiza: CHANGELOG.md
3. Kimi ativa: runbook (se mudou operação)
4. Kimi atualiza: docs/runbook.md
5. Kimi ativa: technical-writer (se precisar de docs técnicas)
6. Kimi atualiza: docs/novo-documento.md
7. Kimi atualiza: MEMORY.md + SESSION-CONTEXT.md
```

---

## Checklist para você

### Sessão nova — o que pedir

```
"Vamos implementar [feature]"
→ Kimi detecta contexto e ativa skills automaticamente

"Documentar o schema atual"
→ Ativa diagrama-er + arquiteto-postgresql

"Como testar isso?"
→ Ativa testes + plano-de-testes

"Revisar segurança"
→ Ativa security

"Qual arquitetura usar?"
→ Ativa arquiteto-solucoes

"Modelar tabela de [entidade]"
→ Ativa arquiteto-postgresql + engenheiro-dba

"Levantar requisitos"
→ Ativa analista-de-negocio
```

### Você NÃO precisa

- ❌ Decorar nomes das skills
- ❌ Digitar `/skill nome` toda vez
- ❌ Escolher qual skill usar

### Você PODE fazer (opcional)

- ✅ Mencionar o nome da skill se quiser forçar: "Usando a skill X..."
- ✅ Perguntar "qual skill se aplica aqui?"

---

## Manutenção das skills

### Se uma skill não ativar quando deveria

Me avise com a mensagem que você digitou. Posso:
1. Ajustar a `description` da skill para melhorar detecção
2. Ou você pode mencionar o nome explicitamente

### Se quiser nova skill

Use a skill `create-skill`:

```
Crie uma skill para [tema específico]
```

Ela vai gerar o SKILL.md com YAML frontmatter correto.

---

## Resumo visual

```
Você fala normalmente
       ↓
Kimi detecta contexto → ativa skills automaticamente
       ↓
Kimi aplica padrões da skill → entrega padronizado
       ↓
Kimi atualiza docs (MEMORY, SESSION-CONTEXT, etc.)
```

**Sua única ação:** falar o que precisa. O resto é automático.

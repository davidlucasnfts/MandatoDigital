# Plano de Refatoração — MandatoDigital

> **Data de criação:** 08/06/2026  
> **Baseado na análise de:** organização de estrutura, tamanho de arquivos, schema de banco, segurança, infraestrutura e código frontend.  
> **Skills aplicadas:** `arquiteto-postgresql`, `arquiteto-solucoes`, `security`, `scalability`, `react-frontend`.

---

## Objetivo

Reduzir dívida técnica crítica em 4 sprints, priorizando **maior retorno com menor esforço**. O plano foca em segurança, consistência do banco, organização do código e testes — sem reescrever funcionalidades.

---

## Princípios do Plano

1. **Não quebrar o que funciona** — cada sprint termina com deploy possível.
2. **Uma fonte de verdade** — schema, ícones, componentes.
3. **Entrega mensurável** — cada tarefa tem critério de aceitação e comando de validação.
4. **Testes como contrato** — novas rotinas vêm com testes; rotinas antigas ganham testes ao serem tocadas.

---

## Matriz de Prioridade

| Sprint | Foco | Impacto | Esforço | Risco de não fazer |
|---|---|---|---|---|
| 1 | Higiene + Segurança | Alto | Baixo | Deploy com falhas de segurança e rotas de teste públicas |
| 2 | Consistência do Banco | Alto | Médio | Dados inconsistentes, queries lentas, perda de dados |
| 3 | Frontend — Decomposição | Alto | Alto | Manutenção inviável, bugs silenciosos, bundle grande |
| 4 | Testes + Observabilidade | Alto (longo prazo) | Médio | Regressões frequentes, debugging às cegas |

---

## Sprint 1 — Higiene e Segurança
**Duração:** 3-4 dias de trabalho  
**Entrega:** Código limpo, sem rotas de teste, sem falha de privilégio

### Tarefas

#### 1.1 Remover rotas e links de teste da produção
- [ ] Remover rota `/configuracoes/teste-v2` de `src/App.tsx`
- [ ] Remover links `"Agenda V2"` e `"Config V2"` de `src/components/DashboardLayout.tsx`
- [ ] Manter páginas de teste **somente** se tiverem utilidade documentada; caso contrário, deletar

**Arquivos a deletar (confirmar com David):**
- `src/pages/SolicitacoesPageV3.tsx` — já promovido, não importado
- `src/pages/SolicitacoesPageV4.tsx` — não importado
- `src/pages/MapaPageV1.tsx` — não importado
- `src/pages/DashboardV2.tsx` — não importado
- `src/pages/DashboardHomeV2.tsx` — duplicado
- `src/pages/ComunicacaoPageV2.tsx` — já promovido

**Critério de aceitação:**
```bash
grep -n "teste-\|PageV[0-9]\|V[0-9]" src/App.tsx
# deve retornar apenas /teste-here (exceção permitida)

grep -in "teste\|V[0-9]" src/components/DashboardLayout.tsx
# deve retornar vazio
```

#### 1.2 Remover arquivos e pastas mortas
- [ ] Verificar se `app/` pode ser deletada (está vazia)
- [ ] Verificar se `src/sections/` pode ser deletada (está vazia)
- [ ] Adicionar `graphify-out/cache/` ao `.gitignore` e limpar do repositório
- [ ] Avaliar se `dist/` deve continuar no git (geralmente não)

#### 1.3 Corrigir fallback de privilégio em `api/context.ts`
- [ ] Na linha 84, quando o banco falha, **não retornar role="admin"**
- [ ] Opções: retornar erro 503, ou retornar usuário autenticado sem role (bloquear mutations)
- [ ] Garantir que `requireRole` continue funcionando

**Critério de aceitação:**
- Teste unitário: simular falha no banco → usuário autenticado não pode executar `adminQuery`.

#### 1.4 Sincronizar schema_safe.sql
- [ ] Rodar `npm run db:schema-safe` para incluir migration 032
- [ ] Verificar se `templates_mensagem`, `campanhas`, `envios_campanha` aparecem no arquivo gerado

**Critério de aceitação:**
```bash
grep -n "templates_mensagem\|campanhas\|envios_campanha" supabase/schema_safe.sql
# deve retornar resultados
```

#### 1.5 Corrigir RLS da tabela `equipe`
- [ ] Revisar migrations 022, 024, 025
- [ ] Garantir que `service_role` não tenha acesso irrestrito a `equipe`
- [ ] Documentar a policy final em `docs/adr-005-seguranca-padrao.md`

### Checklist do Sprint 1
- [ ] `npx tsc --noEmit` passa
- [ ] `npm run test` passa
- [ ] `npm run lint` passa
- [ ] Rotas de teste removidas
- [ ] Schema safe atualizado
- [ ] Fallback admin removido

---

## Sprint 2 — Consistência do Banco de Dados
**Duração:** 5-7 dias de trabalho  
**Entrega:** Schema sincronizado, índices criados, soft delete ativo

### Tarefas

#### 2.1 Sincronizar `db/schema.ts` com o banco real
- [ ] Adicionar tabelas ausentes ao Drizzle: `comunidades`, `eleitores`, `solicitacoes`, `tarefas`, `eventos`, `documentos`, `comunicacoes`, `configuracoes`, `envios_aniversario`, `convites_eleitores`
- [ ] Corrigir tabela `users` para refletir `auth.users(id uuid)` (ou remover se for apenas cache)
- [ ] Corrigir `equipe.id` para UUID
- [ ] Corrigir tipos de coordenadas (`text` → `DOUBLE PRECISION` ou `NUMERIC`)
- [ ] Corrigir `permite_multipla_escolha` para `boolean`

**Critério de aceitação:**
- `db/schema.ts` cobre 100% das tabelas em `supabase/schema_safe.sql`
- `npm run db:generate` não gera mudanças inesperadas

#### 2.2 Adicionar `updated_at` em todas as tabelas de negócio
Tabelas a atualizar:
- `comunidades`, `eleitores`, `solicitacoes`, `tarefas`, `eventos`, `documentos`, `comunicacoes`, `equipe`, `tramitacoes`, `enquete_opcoes`, `enquete_respostas`

- [ ] Criar migration `033-updated-at-tabelas.sql`
- [ ] Criar function/trigger `atualiza_updated_at()`
- [ ] Aplicar trigger em cada tabela

#### 2.3 Implementar soft delete (`deleted_at`)
Tabelas prioritárias (dados de cidadãos):
- `eleitores`, `solicitacoes`, `comunicacoes`, `campanhas`, `envios_campanha`

- [ ] Criar migration `034-soft-delete.sql`
- [ ] Adicionar coluna `deleted_at TIMESTAMPTZ NULL DEFAULT NULL`
- [ ] Criar views `*_ativos` para filtrar automaticamente
- [ ] Atualizar routers tRPC para usar as views (ou filtrar `deleted_at IS NULL`)
- [ ] Alterar exclusões para `UPDATE ... SET deleted_at = NOW()`

#### 2.4 Criar índices em FKs críticas
- [ ] `comunidades(owner_id)`
- [ ] `eleitores(comunidade_id, owner_id)`
- [ ] `solicitacoes(eleitor_id, owner_id)`
- [ ] `campanhas(template_id, owner_id)`
- [ ] `envios_campanha(campanha_id, eleitor_id)`
- [ ] `tarefas(owner_id, responsavel_id)`
- [ ] `eventos(owner_id)`
- [ ] `documentos(owner_id)`
- [ ] `comunicacoes(owner_id)`
- [ ] `equipe(owner_id, user_id)`
- [ ] `convites_eleitores(lider_id, eleitor_id)`

**Índices compostos adicionais:**
- [ ] `envios_campanha(campanha_id, status)`
- [ ] `solicitacoes(eleitor_id, status)`

#### 2.5 Adicionar índices GIN
- [ ] `CREATE INDEX idx_eleitores_tags ON eleitores USING GIN(tags)`
- [ ] `CREATE INDEX idx_campanhas_filtros ON campanhas USING GIN(filtros)`

#### 2.6 Consolidar migration
- [ ] Criar migration `035-indices-e-constraints.sql`
- [ ] Regenerar `schema_safe.sql`

### Checklist do Sprint 2
- [ ] Todas as tabelas têm `updated_at` com trigger
- [ ] Tabelas prioritárias têm `deleted_at`
- [ ] `EXPLAIN ANALYZE` em queries por `owner_id` e `eleitor_id` usam índice
- [ ] `npx tsc --noEmit` passa
- [ ] Testes de API para exclusão lógica passam

---

## Sprint 3 — Refatoração do Frontend
**Duração:** 7-10 dias de trabalho  
**Entrega:** Zero arquivos >400 linhas, uma biblioteca de ícones, acessibilidade mínima

### Tarefas

#### 3.1 Quebrar componentes/páginas >400 linhas
**Prioridade 1 (maior impacto visual):**

| Arquivo | Linhas | Estratégia |
|---|---|---|
| `NovoComunicadoDialog.tsx` | 727 | Separar em: `ComunicadoFormFields.tsx`, `ComunicadoFiltros.tsx`, `ComunicadoPreview.tsx`, `useComunicadoForm.ts` |
| `MapaPage.tsx` | 681 | Separar em: `MapaFiltros.tsx`, `MapaLegenda.tsx`, `MapaClusterLayer.tsx`, `useMapaData.ts` |
| `NovoEleitorDialog.tsx` | 590 | Separar em: `EleitorFormTabs.tsx`, `EleitorEnderecoForm.tsx`, `useEleitorForm.ts` |
| `ConfiguracoesPageV2.tsx` | 589 | Separar em: `ConfiguracoesTabs.tsx`, `WhatsAppConfigPanel.tsx`, `EmailConfigPanel.tsx`, `GeralConfigPanel.tsx` |
| `EleitoresPage.tsx` | 554 | Separar em: `EleitoresToolbar.tsx`, `EleitoresTabela.tsx`, `EleitoresPreview.tsx`, `useEleitoresQuery.ts` |
| `ComunicacaoPage.tsx` | 540 | Separar em: `CampanhasLista.tsx`, `CampanhaPreview.tsx`, `TemplatesLista.tsx` |
| `SolicitacoesPageV4.tsx` | 529 | (Se ainda existir) deletar. Senão, aplicar na `SolicitacoesPage.tsx` |
| `RelatoriosPage.tsx` | 450 | Separar em: `RelatoriosFiltros.tsx`, `RelatoriosGraficos.tsx` |
| `LideresProdutividadePage.tsx` | 463 | Separar em: `LideresRanking.tsx`, `LideresToolbar.tsx` |
| `ConfiguracoesPage.tsx` | 409 | Unificar com V2 ou extrair painéis |

**Regra de ouro:** cada novo arquivo deve ter propósito único e <200 linhas.

#### 3.2 Unificar biblioteca de ícones
- [ ] Substituir todos os imports diretos de `lucide-react` por `@/lib/icons`
- [ ] Adicionar ícones faltantes em `src/lib/icons.ts` (usando Tabler)
- [ ] Remover `lucide-react` das dependências se possível

**Comando de acompanhamento:**
```bash
grep -rn "from 'lucide-react'" src/ --include="*.tsx"
# deve retornar apenas componentes shadcn/ui (se necessário)
```

#### 3.3 Corrigir acessibilidade mínima
- [ ] Adicionar `aria-label` em todos os botões de ação (Editar, Excluir, Ver, Link)
- [ ] Substituir toggles customizados por `Switch` do shadcn/ui
- [ ] Adicionar `scope="col"` nos `<th>` das tabelas
- [ ] Garantir foco visível em todos os botões interativos
- [ ] Adicionar `aria-expanded` em botões que abrem modais/drawers

#### 3.4 Corrigir inconsistências do Design System
- [ ] `EquipePage`: remover `DropdownMenu` com `MoreHorizontal` para trocar role — usar botões visíveis
- [ ] `SolicitacoesLista`: corrigir status `excluido` para `cancelado`
- [ ] `ComunicacaoPage`: separar overlay do modal (erro #032)
- [ ] Tornar botões de ação sempre com texto + ícone (exceto kanban, documentado)

#### 3.5 Criar hooks e utilitários compartilhados
- [ ] `useDebounce.ts` (se não existir)
- [ ] `usePagination.ts`
- [ ] `formatDate.ts`, `formatPhone.ts`, `formatCPF.ts`
- [ ] `useConfirmDialog.ts` para confirmações de exclusão

### Checklist do Sprint 3
- [ ] Nenhum arquivo `.tsx` em `src/pages/` ou `src/components/` (exceto `ui/`) com >400 linhas
- [ ] `grep -rn "from 'lucide-react'" src/pages/ src/components/` retorna vazio
- [ ] Lighthouse acessibilidade ≥ 80 em páginas principais
- [ ] `npx tsc --noEmit` passa

---

## Sprint 4 — Testes e Observabilidade
**Duração:** 5-7 dias de trabalho  
**Entrega:** Testes nas rotas críticas, logs estruturados, monitoramento básico

### Tarefas

#### 4.1 Aumentar cobertura de testes
**Prioridade:** rotas que manipulam dados pessoais e/ou têm permissões.

- [ ] Testes para `auth-router.ts`
- [ ] Testes para `lideres-router.ts`
- [ ] Testes para `equipe-router.ts`
- [ ] Testes para `solicitacoes-router.ts`
- [ ] Testes para `cnefe-router.ts`
- [ ] Testes para `whatsapp-router.ts`
- [ ] Testes unitários para hooks críticos (`useSupabaseAuth`, `useGeocoding`)

**Meta de cobertura:** 60% no backend, 40% no frontend. Atingir 80% é ideal.

#### 4.2 Tornar `npm audit` bloqueante
- [ ] Remover `continue-on-error: true` do job `security` em `.github/workflows/deploy.yml`
- [ ] Ou: definir `audit-level=high` e corrigir vulnerabilidades antes de merge

#### 4.3 Logs estruturados
- [ ] Substituir `console.log` soltos por logger estruturado (JSON)
- [ ] Campos obrigatórios: `timestamp`, `level`, `message`, `requestId`, `userId`, `path`
- [ ] Nunca logar PII (CPF, telefone, e-mail) em texto plano

#### 4.4 Métricas básicas
- [ ] Adicionar middleware de tempo de resposta nas rotas tRPC
- [ ] Logar latência das queries mais lentas
- [ ] Adicionar contador de erros 5xx por rota

#### 4.5 Health check
- [ ] Criar endpoint `/api/health` que verifica: banco, Supabase, WAHA (se configurado)
- [ ] Usar no Vercel para health checks

### Checklist do Sprint 4
- [ ] ≥ 15 arquivos de teste no projeto
- [ ] `npm audit` falha em vulnerabilidades HIGH/CRITICAL
- [ ] Logs estruturados em JSON
- [ ] Endpoint `/api/health` funcional
- [ ] `npx tsc --noEmit` passa

---

## Cronograma Sugerido

| Semana | Sprint | Foco | Deployável? |
|---|---|---|---|
| 1 | 1 | Higiene + Segurança | Sim |
| 2-3 | 2 | Banco de dados | Sim (após validar migrations) |
| 4-5 | 3 | Frontend | Sim (parcial, por página) |
| 6 | 4 | Testes + Observabilidade | Sim |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Migration de soft delete quebrar dados existentes | Média | Alto | Backup do banco antes; usar `UPDATE` em vez de `DELETE`; validar em staging |
| Refatoração do frontend introduzir regressões visuais | Alta | Médio | Comparar screenshots antes/depois; testar uma página por vez |
| Sincronização do `schema.ts` gerar diff falso no Drizzle | Média | Alto | Rodar `db:generate` local e revisar o diff antes de aplicar |
| Testes novos falharem em CI por variáveis de ambiente | Média | Médio | Criar `.env.test` e mockar Supabase/WAHA |
| `npm audit` bloqueante impedir deploy por dependência transitória | Baixa | Médio | Usar `overrides` no package.json ou esperar patch |

---

## Checklist Pré-Deploy (aplicável a cada sprint)

```
□ 1. Rotas de teste — grep -n "teste-\|PageV[0-9]\|V[0-9]" src/App.tsx
□ 2. Links de teste — grep -in "teste\|V[0-9]" src/components/DashboardLayout.tsx
□ 3. Arquivos órfãos — confirmar que não há .tsx não importado
□ 4. Type check — npx tsc --noEmit
□ 5. Testes — npm run test
□ 6. Lint — npm run lint
□ 7. Audit — npm audit (bloqueante a partir da Sprint 4)
□ 8. Schema safe atualizado — npm run db:schema-safe
□ 9. MEMORY.md e SESSION-CONTEXT.md atualizados
□ 10. Decisões pendentes documentadas em SESSION-CONTEXT.md
```

---

## Métricas de Sucesso

Ao final das 4 sprints:

- [ ] Zero rotas de teste em produção
- [ ] Zero arquivos `.tsx` >400 linhas (exceto shadcn/ui)
- [ ] `db/schema.ts` 100% sincronizado com `supabase/schema_safe.sql`
- [ ] 100% das tabelas de negócio com `updated_at`
- [ ] Soft delete ativo em `eleitores`, `solicitacoes`, `campanhas`, `envios_campanha`
- [ ] Índice em toda FK
- [ ] ≥ 60% cobertura de testes no backend
- [ ] Logs estruturados (JSON)
- [ ] `npm audit` bloqueante
- [ ] Uma única biblioteca de ícones

---

## Notas

- Este plano não reescreve funcionalidades. Ele organiza o que existe.
- Cada sprint pode ser pausado a qualquer momento para atender demanda de negócio, desde que o checklist pré-deploy seja respeitado.
- Páginas de teste (`V2`, `V3`) ainda podem ser usadas no futuro, mas **rotas e links devem ser removidos antes de todo commit**.

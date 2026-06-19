# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 19/06/2026  
> **Sessão atual:** Migração WAHA → Evolution API — env vars configuradas na Vercel, QR Code não funciona via REST, decisão pendente sobre caminho

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (Evolution API v2.3.7 + Redis + CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Teste e correção do fluxo WhatsApp com Evolution API — 19/06**

### ✅ O que foi feito:
1. **Env vars da Evolution configuradas na Vercel**
   - `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME` adicionadas
   - Redeploy realizado

2. **Correções no backend (`api/whatsapp-router.ts`)**
   - Verificação de instância existente corrigida (campo `name` além de `instanceName`)
   - Adicionado `integration: "EVOLUTION"` ao criar instância
   - Melhorados logs de erro para debug

3. **Acesso SSH à VPS estabelecido e infra ajustada**
   - Backup do banco PostgreSQL da Evolution realizado
   - Redis adicionado ao `docker-compose.yml`
   - Imagem atualizada para `evoapicloud/evolution-api:latest` (v2.3.7)
   - Containers Evolution + Redis rodando

4. **Diagnóstico do problema do QR Code**
   - Testadas imagens v2.2.3 e v2.3.7
   - Testados endpoints `/instance/create`, `/instance/connect`, websocket
   - Documentação oficial indica que QR deveria vir via REST, mas na prática não vem
   - Identificado bug/conhecimento conhecido da Evolution API em Docker

### ❌ Decisões pendentes para próxima sessão:
- **Escolher caminho para conexão WhatsApp:**
  1. Conectar manualmente pela Evolution Manager (`http://82.197.73.101:8080/manager`) e usar API só para envio
  2. Voltar para WAHA (QR Code funcionava) — subir container WAHA novamente
  3. Investigar outra versão/imagem da Evolution ou implementar websocket
  4. Migrar para WhatsApp Business API oficial (pago)
- **Remover variáveis WAHA** da Vercel após decisão
- **Remover chave SSH temporária** da VPS ao finalizar

### 📁 Arquivos modificados nesta sessão:
- `api/whatsapp-router.ts` (correções de instância, integration e logs)
- `docs/ROTEIRO-MIGRACAO-EVOLUTION.md` (deve ser atualizado com decisão final)
- `/root/evolution-api/docker-compose.yml` na VPS (Redis adicionado, imagem v2.3.7)

---

## 🏛️ Decisões de Arquitetura Multi-Cliente (SaaS)

> **Contexto:** O produto será vendido online (estilo Hotmart). O pagador do plano será o único admin do mandato e poderá convidar membros de equipe de acordo com o limite do plano contratado. Esta seção registra o modelo técnico preliminar para que a próxima sessão retome sem perder contexto.

### Modelo de negócio validado
- **Tenant = mandato político** (campanha/escritório do vereador)
- **Pagador = único admin** do mandato (email vinculado ao pagamento)
- **Membros = equipe** com roles `editor` ou `visualizador`
- **Planos por quantidade de contas** (total incluindo o admin):
  - Básico: 1 conta (só o admin)
  - Pro: 3 contas (admin + 2 membros)
  - Enterprise: 5 contas (admin + 4 membros)
- **Convite por email** feito dentro da plataforma pelo admin
- **Auto-provisionamento**: ao criar login/senha, o sistema cria automaticamente o mandato e vincula o usuário como admin

### Planos e preços (a confirmar)

> Valores baseados em `docs/proposta-planos-precificacao.md`, ainda não confirmados para o novo modelo de 3 planos.

| Plano | Preço sugerido | Contas totais | Membros extras | Eleitores (sugestão) |
|---|---|---|---|---|
| **Básico** | a definir | 1 (só admin) | 0 | a definir |
| **Pro** | a definir | 3 (admin + 2) | 2 | a definir |
| **Enterprise** | a definir | 5 (admin + 4) | 4 | a definir |

- O pagador é sempre o **admin** do mandato.
- O admin não conta como "membro convidado" — ele faz parte do limite total de contas.

### Modelo de dados proposto
```
auth.users
  └── id (UUID)

mandatos
  ├── id (UUID PK)
  ├── owner_id → auth.users.id   (quem paga/admin)
  ├── nome
  ├── plano ('basico' | 'pro' | 'enterprise')
  ├── status ('ativo' | 'inadimplente' | 'cancelado')
  ├── limite_usuarios
  ├── limite_eleitores
  ├── created_at / updated_at

equipe  (reaproveitada — owner_id vira mandato_id)
  ├── mandato_id → mandatos.id
  ├── user_id → auth.users.id
  ├── email / nome
  ├── role ('admin' | 'editor' | 'visualizador')
  ├── status ('ativo' | 'pendente' | 'inativo')

convites_mandato
  ├── mandato_id → mandatos.id
  ├── email
  ├── role
  ├── token
  ├── status
  └── expira_em

assinaturas
  ├── mandato_id → mandatos.id
  ├── gateway ('hotmart' | 'stripe' | 'asaas')
  ├── status
  ├── data_inicio / data_expiracao
```

**Observação sobre o admin:**
- O pagador (`mandatos.owner_id`) é o único admin do mandato.
- Ele também possui um registro na tabela `equipe` vinculado ao próprio `mandato_id` com `role = 'admin'` e `status = 'ativo'`.
- Isso permite que a RLS use uma única regra para todos os acessos, sem tratamento especial para o dono.

### Fluxo de convite por email

1. Admin acessa a tela de equipe e clica em "Convidar"
2. Sistema verifica se há vaga no plano (`COUNT(ativo) < limite_usuarios`)
3. Se houver vaga, cria registro em `convites_mandato` com token e prazo de expiração
4. Sistema envia email para o convidado com link de aceite
5. Convidado clica no link e cria conta (ou loga se já tiver)
6. Sistema verifica novamente se ainda há vaga (evita race condition)
7. Cria registro em `equipe` vinculado ao `mandato_id` com status `'ativo'`
8. Marca convite como usado

**Regras de segurança do convite:**
- Token único e expirável (ex: 7 dias)
- Só pode ser usado pelo email convidado
- Se o plano estiver esgotado no momento do aceite, o convite é recusado
- Admin pode cancelar convite pendente a qualquer momento

### Mudanças técnicas necessárias
1. Criar tabelas `mandatos`, `convites_mandato`, `assinaturas`
2. Adicionar `mandato_id` em todas as tabelas de negócio
3. Migrar `owner_id` (auth.users) → `mandato_id` (mandatos)
4. Reescrever RLS policies para usar `mandato_id`
5. Atualizar `db/schema.ts` do Drizzle
6. Implementar fluxo de signup + criação automática de mandato
7. Implementar fluxo de convite por email
8. Adicionar enforcement dos limites de usuários/eleitores por plano

### Decisões ainda pendentes
| # | Decisão | Sugestão prévia |
|---|---|---|
| 1 | Um usuário pode fazer parte de vários mandatos? | **Não no MVP**. Schema preparado para N:N, mas UI limita a 1 mandato por login. |
| 2 | `equipe` vira `mandato_usuarios` ou mantém `equipe`? | **Reaproveitar `equipe`**. Trocar semântica de `owner_id` para `mandato_id`. Renomear depois se necessário. |
| 3 | Limites hard ou soft? | **Hard para usuários/eleitores**, soft para mensagens no início. |
| 4 | Gateway de pagamento? | A definir (Hotmart é o preferido pelo modelo de vendas). |

### Riscos identificados
- Migration grande: todas as tabelas de negócio precisam de `mandato_id`
- Supabase Free (500MB) estoura com ~6-7 clientes médios
- Fallback admin em `api/context.ts` precisa ser corrigido antes de escalar
- `db/schema.ts` incompleto pode dificultar refatoração

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes de commit.

| Página | Arquivo | Rota de Teste | Status |
|---|---|---|---|
| **Agenda V2** | `AgendaPageV2.tsx` | `/dashboard/agenda/teste-v2` | Em teste — aguardando aprovação |
| **Configurações V2** | `ConfiguracoesPageV2.tsx` | `/dashboard/configuracoes/teste-v2` | Em teste — aguardando aprovação |
| **Comunicação V2** | `ComunicacaoPageV2.tsx` | `/dashboard/comunicacao/teste-v2` | Em teste — reativada |
| **Comunidades V2** | `ComunidadesPageV2.tsx` | `/dashboard/comunidades/teste-v2` | Em teste — aguardando aprovação |
| **Produtividade V2** | `ProdutividadePageV2.tsx` | `/dashboard/produtividade/teste-v2` | Em teste — aguardando aprovação |
| **Equipe V2** | `EquipePageV2.tsx` | `/dashboard/equipe/teste-v2` | Em teste — aguardando aprovação |
| **Tarefas V2** | `TarefasPageV2.tsx` | `/dashboard/tarefas/teste-v2` | Em teste — aguardando aprovação |
| **Proposições V2** | `ProposicoesPageV2.tsx` | `/dashboard/proposicoes/teste-v2` | Em teste — aguardando aprovação |
| **Enquetes V2** | `EnquetesPageV2.tsx` | `/dashboard/enquetes/teste-v2` | Em teste — aguardando aprovação |
| **Relatórios V2** | `RelatoriosPageV2.tsx` | `/dashboard/relatorios/teste-v2` | Em teste — aguardando aprovação |
| **Documentos V2** | `DocumentosPageV2.tsx` | `/dashboard/documentos/teste-v2` | Em teste — aguardando aprovação |

---

## URLs Importantes

| Serviço | URL | Status |
|---|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app | Ativo |
| **API Proxy CNEFE** | http://82.197.73.101 | Ativo |
| **WAHA Core (VPS)** | http://82.197.73.101:8080 | **DESATIVADO — substituído pela Evolution** |
| **Evolution API (VPS)** | http://82.197.73.101:8080 | **ATIVO — v2.3.7 + Redis, instância `mandato` criada** |
| **Evolution Manager** | http://82.197.73.101:8080/manager | **ATIVO — login com API key** |

---

## Decisões Pendentes

### ⚠️ Ações manuais necessárias
- **Decisão pendente — caminho do WhatsApp:**
  - Opção 1: Conectar manualmente pela Evolution Manager (`http://82.197.73.101:8080/manager`, login com API key `mandato2026evolution`)
  - Opção 2: Voltar para WAHA (subir container WAHA novamente na VPS)
  - Opção 3: Investigar outra versão/imagem da Evolution ou implementar websocket
  - Opção 4: Migrar para WhatsApp Business API oficial (pago)
- **Remover variáveis WAHA da Vercel** após decisão final (`WAHA_API_URL`, `WAHA_API_KEY`)
- **Remover chave SSH temporária** `/root/.ssh/authorized_keys` linha `kimi-temp` ao encerrar sessão
- **Testar cada página V2 localmente** usando o roteiro em `docs/testes-paginas-v2.md`
- **Configurar bucket `documentos` no Supabase Storage** se ainda não estiver ativo (migration 007 já existe)
- **Verificar políticas RLS do bucket `documentos`** — a policy atual exige `auth.uid() = owner`; testar se upload funciona com usuário autenticado
- **Revisar configuração de CORS do Supabase Storage** se houver erro de upload

### 🔴 Problemas críticos ainda pendentes (fora do escopo desta sessão)
1. **Fallback admin perigoso**: `api/context.ts` retorna `role="admin"` se o banco falhar
2. **`db/schema.ts` incompleto**: Drizzle não conhece várias tabelas principais
3. **21 arquivos >400 linhas**, sendo 13 no `src/`
4. **Páginas de teste órfãs**: `DashboardHomeV2.tsx`, `DashboardV2.tsx`, `MapaPageV1.tsx`, `MapaPageV2.tsx`, `SolicitacoesPageV3.tsx`, `SolicitacoesPageV4.tsx`
5. **Mistura de bibliotecas de ícones**: `lucide-react` ainda usado em vários componentes legados (`AlertasPanel`, `ComunicacaoPage`, `EleitoresPage`, `DashboardHome`, `IconPicker`, `MetaEleitoralPanel`, `NovoComunicadoDialog`, `NovoTemplateDialog`, `WhatsAppStatusCard`, `WhatsAppStatusBar`, `WhatsAppConnectModal`). `DashboardHomeV2` e `CommandMenu` já migrados.
6. **Sem soft delete** em tabelas de cidadãos
7. **Falta de índices** em várias FKs críticas

---

## Próxima Sessão — Sugestões

### Prioridade A — Decidir caminho do WhatsApp
1. **Decidir entre:**
   - Conectar manualmente pela Evolution Manager (rápido, mas não escalável)
   - Voltar para WAHA (QR Code funcionava, mas manter 2 serviços)
   - Investigar outra versão/imagem da Evolution ou websocket
   - WhatsApp Business API oficial (pago, mas profissional)
2. **Aplicar a decisão técnica escolhida**
3. **Testar fluxo completo:** Comunicação → Conectar WhatsApp → Enviar mensagem
4. **Remover env vars WAHA da Vercel** após validação

### Prioridade B — Retomar decisão arquitetural multi-cliente
1. **Confirmar as 4 decisões pendentes** da seção "Decisões de Arquitetura Multi-Cliente"
2. **Aprovar o modelo `mandatos` + reaproveitamento da tabela `equipe`**
3. **Definir gateway de pagamento** (Hotmart/Stripe/Asaas) para estruturar `assinaturas`
4. Se aprovado, montar plano técnico detalhado com migrations e código

### Prioridade B — Design System (se quiser alternar)
5. **Testar visualmente todas as páginas V2** e aprovar uma a uma
6. **Promover páginas aprovadas à produção**:
   - Copiar conteúdo de `*PageV2.tsx` para `*Page.tsx`
   - Remover rotas `/teste-v2` do `App.tsx`
   - Remover links "V2" do sidebar
7. **Limpar arquivos órfãos** após confirmação
8. **Executar checklist pré-commit** (tsc, rotas, links, documentação)

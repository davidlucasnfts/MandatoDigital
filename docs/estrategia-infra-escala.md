<!-- 13/06/2026 - Estratégia de infraestrutura e custos de escala -->

# Estratégia de Infraestrutura e Escala — Mandato Digital

**Data:** 13/06/2026
**Função:** Referência única sobre custos, gatilhos de upgrade e opções de infraestrutura (banco, WhatsApp, VPS, storage)
**Status:** Análise consolidada — aguardando decisões

---

## Resumo Executivo

> **Hoje:** 1 cliente, ~500 eleitores, custo **~R$ 40/mês** (só VPS)
> **20 clientes (~96k eleitores):** custo estimado **~R$ 1.000-1.200/mês**
> **Maior risco:** Banco de dados — um cliente gigante (10k eleitores) consome **~6,9 GB**
> **Maior custo variável:** WhatsApp (R$ 33/sessão via WasenderAPI)
> **Recomendação:** Supabase Pro até ~15 clientes → self-hosted ou Team após isso

---

## 1. Cenário Atual

| Componente | Ferramenta | Plano | Custo/mês |
|---|---|---|---|
| Banco | Supabase | Free (500MB) | R$ 0 |
| Auth | Supabase | Free | R$ 0 |
| Deploy | Vercel | Hobby | R$ 0 |
| VPS | HostUp | 2 CPU / 3,8GB | R$ 40 |
| WhatsApp | WAHA CORE | 1 sessão | R$ 0 |
| Storage | Supabase | 1GB free | R$ 0 |
| **TOTAL** | | | **~R$ 40** |

---

## 2. Gatilhos de Upgrade (ordem de risco)

| # | Componente | Limite Free | Estoura em | Consequência | Upgrade |
|---|---|---|---|---|---|
| 1 | **Supabase Storage** | 1GB | ~5 clientes | Uploads falham | R2 (grátis) |
| 2 | **Supabase Conexões** | 30 | ~5-8 usuários ativos | "Too many connections" | Pro/Team |
| 3 | **Supabase Banco** | 500MB | ~6-7 clientes médios | Lentidão → erro | Pro/Team/self-hosted |
| 4 | **Vercel Funções** | 10s | Relatórios grandes | Timeout 500 | Otimizar código |
| 5 | **WAHA WhatsApp** | 1 sessão | 2º cliente | Não conecta | WasenderAPI |
| 6 | **VPS RAM** | 3,8GB | WAHA + CNEFE | WAHA trava | 4-8GB / cloud |

---

## 3. Tamanho do Banco por Cliente

| Perfil | Eleitores | Banco (sem fotos) | Com storage | Cabe no Free? |
|---|---|---|---|---|
| **Leve** | 500 | ~106 MB | ~116 MB | ✅ Sim |
| **Médio** | 2.000 | ~756 MB | ~906 MB | ❌ Não |
| **Pesado** | 5.000 | ~2,7 GB | ~3,7 GB | ❌ Não |
| **Gigante** | 10.000 | ~6,9 GB | ~10,4 GB | ❌ Não |

**Fórmula:** cada eleitor consome ~0,4-0,7 KB de banco + logs/eventos/mensagens.

---

## 4. Projeção de Consumo por Escala

### 20 clientes — mix realista

| Perfil | Quantidade | Eleitores cada | Total | Banco total |
|---|---|---|---|---|
| Pequeno (3K) | 8 | 3.000 | 24.000 | ~9,6 GB |
| Médio (5K) | 8 | 5.000 | 40.000 | ~21,6 GB |
| Grande (8K) | 4 | 8.000 | 32.000 | ~24,0 GB |
| **TOTAL** | **20** | **96.000** | **96.000** | **~55 GB** |

**Conclusão:** Supabase Pro (8GB) não aguenta 20 clientes. Team (40GB) fica apertado. Self-hosted ou Enterprise são necessários.

---

## 5. Opções de Banco de Dados

| Opção | Custo | Capacidade | Auth | RLS | Backup | Melhor para |
|---|---|---|---|---|---|---|
| **Supabase Free** | R$ 0 | 500MB | ✅ | ✅ | Manual | Testes |
| **Supabase Pro** | R$ 135/mês | 8GB | ✅ | ✅ | Automático | 5-15 clientes |
| **Supabase Team** | R$ 325/mês | 40GB | ✅ | ✅ | Automático | 15-30 clientes |
| **Neon Scale** | R$ 105/mês | 10GB | ❌ | ❌ | Automático | Dev/branching |
| **Neon Business** | R$ 325/mês | 40GB | ❌ | ❌ | Automático | 15-30 clientes |
| **Self-hosted VPS** | R$ 150-300/mês | Ilimitado | ❌ | ❌ | Manual | 20+ clientes |

### Recomendação por fase

| Fase | Clientes | Recomendação | Por quê |
|---|---|---|---|
| 1-5 | 1-5 | Supabase Free | Custo zero |
| 5-15 | 5-15 | Supabase Pro | Zero migração, auth/RLS prontos |
| 15-30 | 15-30 | Supabase Team ou self-hosted | Banco > 8GB |
| 30+ | 30+ | Self-hosted | Custo por cliente cai |

---

## 6. Opções de WhatsApp

| API | Modelo | Custo/sessão | Para 10 clientes | Recomendação |
|---|---|---|---|---|
| **WAHA CORE** | Grátis, 1 sessão | R$ 0 | ❌ Não suporta | Só 1 cliente |
| **WasenderAPI** | Fixo ilimitado | **R$ 33** | R$ 330 | **Recomendado** |
| **Wappfly** | Fixo ilimitado | R$ 38 | R$ 385 | Alternativa |
| **Evolution API** | Self-hosted | R$ 80-120 VPS | R$ 800 | 10+ clientes com DevOps |
| **Meta Oficial** | Por mensagem | ~R$ 0,34/msg | R$ 10.200 | Só atendimento |

**Recomendação:** WasenderAPI — preço fixo, ilimitado, setup rápido.

---

## 7. Outros Componentes

| Componente | Recomendação | Custo | Por quê |
|---|---|---|---|
| **Storage** | Cloudflare R2 | R$ 0 até 10GB | Sem taxa de download |
| **VPS** | HostUp 4GB (só CNEFE) | R$ 80/mês | WhatsApp vai para cloud |
| **Deploy** | Vercel Hobby | R$ 0 | 100GB/mês é muito para B2B |
| **E-mail** | Brevo Free/Starter | R$ 0-60/mês | 300/dia grátis |
| **Backup** | GitHub Action → R2 | R$ 0 | Automático diário |

---

## 8. Custo Total por Fase

### Cenário 1: 5 clientes

| Componente | Custo |
|---|---|
| Supabase Pro | R$ 135 |
| WasenderAPI (5 sessões) | R$ 165 |
| VPS HostUp 4GB | R$ 80 |
| R2 / Brevo | R$ 0 |
| **TOTAL** | **R$ 380** |
| **Por cliente** | **R$ 76** |

### Cenário 2: 10 clientes

| Componente | Custo |
|---|---|
| Supabase Pro | R$ 135 |
| WasenderAPI (10 sessões) | R$ 330 |
| VPS HostUp 4GB | R$ 80 |
| R2 / Brevo | R$ 10 |
| **TOTAL** | **R$ 555** |
| **Por cliente** | **R$ 56** |

### Cenário 3: 20 clientes (self-hosted)

| Componente | Custo |
|---|---|
| VPS 32GB (banco) | R$ 250-300 |
| WasenderAPI (20 sessões) | R$ 660 |
| VPS HostUp 4GB (CNEFE) | R$ 80 |
| Brevo Starter | R$ 60 |
| R2 storage | R$ 5 |
| **TOTAL** | **R$ 1.055-1.105** |
| **Por cliente** | **R$ 53-55** |

---

## 9. Otimizações Obrigatórias

Independentemente da infra, fazer:

| # | Otimização | Economia | Status |
|---|---|---|---|
| 1 | Mover fotos/docs para R2 | 5-10GB | Pendente |
| 2 | Criar `audit_logs_archive` | 20-30% após 2 anos | Pendente |
| 3 | Particionar logs por mês | 15-20% performance | Pendente |
| 4 | Índices em FKs críticas | 3-5x mais rápido | Parcial |
| 5 | Arquivar campanhas antigas | 10-15% | Pendente |

---

## 10. Roteiro de Implementação

### Antes de 5 clientes
```
□ Migrar storage para R2
□ Configurar backup automático (GitHub Action → R2)
□ Adicionar índices faltantes
□ Criar monitoramento de uso
```

### 5-15 clientes
```
□ Upgrade Supabase Free → Pro
□ Configurar WasenderAPI
□ Otimizar relatórios (paginação)
□ Criar tabela audit_logs_archive
```

### 15+ clientes
```
□ Avaliar Supabase Team vs self-hosted
□ Implementar particionamento de logs
□ Migrar banco para VPS 32GB (se self-hosted)
□ Configurar PgBouncer
□ Avaliar read replica
```

---

## 11. Decisões Pendentes

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Banco para 20 clientes? | Self-hosted VPS 32GB |
| 2 | WhatsApp para multi-cliente? | WasenderAPI |
| 3 | Storage? | Cloudflare R2 |
| 4 | Backup automático? | GitHub Action + R2 |
| 5 | Quando fazer self-hosted? | Antes de chegar a 15 clientes |

---

> **Próximo passo:** ver documento `docs/proposta-planos-precificacao.md` para precificação baseada nesta infraestrutura.

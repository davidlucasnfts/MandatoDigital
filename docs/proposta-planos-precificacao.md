<!-- 13/06/2026 - Proposta de planos e precificação -->

# Proposta de Planos e Precificação — Mandato Digital

**Data:** 13/06/2026
**Função:** Referência única sobre precificação, planos e posicionamento competitivo
**Base:** Análise do O Assessor (R$ 249/mês) + custos reais de infraestrutura

---

## Resumo Executivo

> **Decisão:** Ofertar **2 planos** (mais simples que 3)
>
> | Plano | Preço | Eleitores | Público-alvo |
> |---|---|---|---|
> | **Profissional** | **R$ 249/mês** | Até 5.000 | Vereador médio |
> | **Premium** | **R$ 499/mês** | Até 15.000 | Vereador grande/campanha |
>
> **Margem estimada:** 70-80% | **Ponto de partida mínimo:** 3.000 eleitores

---

## 1. Análise do Concorrente Principal

**O Assessor:**
- Preço: R$ 249/mês (plano único)
- Contatos/subcontas ilimitados
- Suporte humano (e-mail, telefone, WhatsApp)
- Custos extras: SMS pré-pago, e-mail via Brevo
- Risco: cliente gigante gera prejuízo por causa do modelo ilimitado

**Nossa vantagem:**
- Mapa territorial com CNEFE próprio
- Precificação por eleitores (protege margem)
- WhatsApp ilimitado via WasenderAPI
- Campanhas automáticas avançadas

---

## 2. Por que 2 Planos?

**Problema dos 3 planos:**
- Cliente indeciso entre opções
- Complexidade de venda
- O Assessor vende 1 plano simples

**Vantagem dos 2 planos:**
- Decisão binária (pequeno vs grande)
- Foco em 2 perfis claros
- Venda mais direta

---

## 3. Os 2 Planos Recomendados

### Plano 1 — Profissional

| Item | Valor |
|---|---|
| **Preço** | **R$ 249/mês** |
| **Eleitores** | Até 5.000 |
| **Usuários/subcontas** | Até 5 |
| **WhatsApp** | 1 número, mensagens ilimitadas |
| **Mensagens/mês** | Até 20.000 |
| **E-mail** | Até 300/dia (Brevo grátis) |
| **SMS** | Créditos avulsos (repassa custo) |
| **Mapa territorial** | ✅ Sim |
| **Storage** | Até 5GB (R2) |
| **Campanhas automáticas** | ✅ Básicas |
| **Suporte** | WhatsApp + e-mail |
| **Onboarding** | ❌ Não incluso |

**Público-alvo:** Vereador médio, cidade pequena/média, 1º a 3º mandato.

---

### Plano 2 — Premium

| Item | Valor |
|---|---|
| **Preço** | **R$ 499/mês** |
| **Eleitores** | Até 15.000 |
| **Usuários/subcontas** | Até 20 |
| **WhatsApp** | Até 2 números, mensagens ilimitadas |
| **Mensagens/mês** | Até 60.000 |
| **E-mail** | Até 3.000/dia |
| **SMS** | Créditos avulsos (repassa custo) |
| **Mapa territorial** | ✅ Completo + relatórios |
| **Storage** | Até 30GB (R2) |
| **Campanhas automáticas** | ✅ Avançadas + segmentação |
| **Suporte** | WhatsApp + e-mail + telefone |
| **Onboarding** | ✅ Configuração inicial inclusa |

**Público-alvo:** Vereador grande, capital/interior forte, campanha intensa.

---

## 4. Comparativo com O Assessor

| Critério | O Assessor | Profissional | Premium |
|---|---|---|---|
| **Preço** | R$ 249 | **R$ 249** | R$ 499 |
| **Eleitores** | Ilimitado | Até 5.000 | Até 15.000 |
| **WhatsApp** | Provavelmente incluso | 1 número ilimitado | 2 números ilimitados |
| **Mapa/CNEFE** | ❌ | ✅ | ✅ Completo |
| **Campanhas automáticas** | ⚠️ Básico | ✅ Básicas | ✅ Avançadas |
| **Onboarding** | ❌ | ❌ | ✅ |
| **Suporte telefone** | ✅ | ❌ | ✅ |

---

## 5. Infraestrutura Necessária

### Até 15 clientes

| Componente | Custo/mês |
|---|---|
| Supabase Pro (8GB) | R$ 135 |
| WasenderAPI (15 sessões) | R$ 495 |
| VPS HostUp 4GB (CNEFE) | R$ 80 |
| Brevo Starter | R$ 60 |
| R2 storage | R$ 2-5 |
| **TOTAL** | **R$ 772-775** |

### 15-25 clientes (self-hosted)

| Componente | Custo/mês |
|---|---|
| VPS 32GB (banco) | R$ 250-300 |
| WasenderAPI (20 sessões) | R$ 660 |
| VPS HostUp 4GB (CNEFE) | R$ 80 |
| Brevo Starter | R$ 60 |
| R2 storage | R$ 5 |
| **TOTAL** | **R$ 1.055-1.105** |

---

## 6. Margens Estimadas

### 20 clientes — mix realista

| Plano | Clientes | Preço | Receita | Custo/cliente | Lucro |
|---|---|---|---|---|---|
| Profissional | 14 | R$ 249 | R$ 3.486 | R$ 50 | R$ 2.786 |
| Premium | 6 | R$ 499 | R$ 2.994 | R$ 75 | R$ 2.544 |
| **TOTAL** | **20** | — | **R$ 6.480** | **R$ 1.225** | **R$ 5.255** |

**Margem líquida: 81%**

### 10 clientes — mix realista

| Plano | Clientes | Preço | Receita | Custo/cliente | Lucro |
|---|---|---|---|---|---|
| Profissional | 7 | R$ 249 | R$ 1.743 | R$ 85 | R$ 1.148 |
| Premium | 3 | R$ 499 | R$ 1.497 | R$ 120 | R$ 1.137 |
| **TOTAL** | **10** | — | **R$ 3.240** | **R$ 925** | **R$ 2.315** |

**Margem líquida: 71%**

---

## 7. Regras de Upgrade

| Situação | Ação |
|---|---|
| Cliente passa do limite de eleitores | Oferece upgrade no próximo ciclo |
| Cliente estoura mensagens do plano | Alerta + upgrade ou cobrança de excedente |
| Quer segundo número WhatsApp | Upgrade para Premium |
| Precisa de mais usuários | Upgrade para Premium |

---

## 8. Decisões Pendentes

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Plano anual com desconto? | Sim — 10% off |
| 2 | Taxa de setup? | Não |
| 3 | Trial gratuito? | Sim — 7 dias |
| 4 | Migração de dados grátis? | Sim — diferencial |
| 5 | SMS incluso? | Não — créditos avulsos |

---

## 9. Checklist para Lançar os Planos

```
□ Definir preços finais (R$ 249 / R$ 499)
□ Criar página de preços no site
□ Configurar checkout (Stripe, PagSeguro, etc.)
□ Definir limites técnicos no backend
□ Configurar alertas de uso (eleitores, mensagens, storage)
□ Preparar script de upgrade automático
□ Validar preços com 3-5 vereadores potenciais
```

---

> **Próximo passo:** ver documento `docs/estrategia-infra-escala.md` para detalhes de custos e infraestrutura por fase.

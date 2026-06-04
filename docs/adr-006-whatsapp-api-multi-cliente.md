# ADR-006: Estratégia WhatsApp API para Múltiplos Clientes

> **Status:** Proposto  
> **Data:** 04/06/2026  
> **Contexto:** Integração WhatsApp (WAHA API) implementada para 1 cliente. Necessidade futura de suportar múltiplos vereadores (clientes) com sessões isoladas.

---

## Contexto

Atualmente o projeto usa **WAHA API** (CORE/grátis) rodando em uma única VPS HostUp:
- VPS: 2 CPUs, 3.8GB RAM, Ubuntu 20.04
- WAHA CORE: permite apenas **1 sessão** (`default`)
- QR Code conectado ao WhatsApp do vereador
- Funciona para testes e 1 cliente

## Problema

O WAHA CORE não suporta múltiplas sessões. Se outro vereador usar o sistema:
- Veria o WhatsApp do vereador anterior ❌
- Poderia enviar mensagens como se fosse outra pessoa ❌
- Poderia desconectar o WhatsApp do outro ❌

**Cada cliente precisa de sua própria sessão WhatsApp isolada.**

---

## Opções Analisadas

### Opção 1: Manter WAHA — 1 VPS por Cliente

```
Cliente 1 (Vereador Pedro) → VPS 1 → WAHA → WhatsApp de Pedro
Cliente 2 (Vereador João)  → VPS 2 → WAHA → WhatsApp de João
Cliente 3 (Vereador Maria) → VPS 3 → WAHA → WhatsApp de Maria
```

| Aspecto | Detalhe |
|---------|---------|
| **Custo** | R$ 30-50/mês por cliente (VPS) |
| **Setup** | Médio — 1 Docker por VPS |
| **Manutenção** | Média — atualizar N VPS |
| **Escalabilidade** | Linear (1 VPS por cliente) |
| **Isolamento** | ✅ Total (cada um tem seu servidor) |
| **Complexidade** | 🟡 Média |

**Vantagens:**
- Simples de entender e implementar
- Isolamento total entre clientes
- Se um servidor cai, não afeta os outros

**Desvantagens:**
- Custo cresce linearmente com clientes
- Manutenção distribuída em N servidores
- Gerenciamento de infra complexo

---

### Opção 2: Evolution API — 1 VPS Maior

```
VPS única (4-8GB RAM, Ubuntu 22.04+)
├── PostgreSQL
├── Redis
├── Evolution API
│   ├── Instância 1 → WhatsApp Cliente 1
│   ├── Instância 2 → WhatsApp Cliente 2
│   └── Instância N → WhatsApp Cliente N
```

| Aspecto | Detalhe |
|---------|---------|
| **Custo** | R$ 50-100/mês (1 VPS maior) |
| **Setup** | Complexo — PostgreSQL + Redis + Node.js |
| **Manutenção** | Alta — banco, cache, API |
| **Escalabilidade** | Boa (até ~50 clientes na mesma VPS) |
| **Isolamento** | ✅ Por instância (token separado) |
| **Complexidade** | 🔴 Alta |

**Requisitos mínimos:**
- Ubuntu 22.04+ (20.04 está EOL)
- 4-8 GB RAM
- PostgreSQL ou MySQL
- Redis
- Node.js 20+

**Vantagens:**
- 1 servidor para todos os clientes
- Custo menor que 1 VPS por cliente (a partir de 5 clientes)
- Suporta múltiplas instâncias nativamente

**Desvantagens:**
- Setup muito mais complexo
- Manutenção alta (banco, cache, atualizações)
- Ponto único de falha (se a VPS cai, todos os clientes caem)
- Necessita upgrade da VPS atual (RAM insuficiente)

---

### Opção 3: Serviço Cloud (Terceirizado)

Fornecedores gerenciam a infra. Você só integra via API REST.

#### 3.1 WasenderAPI

| Plano | Preço | Inclui |
|-------|-------|--------|
| Básico | **$6/mês** | 1 número, mensagens ilimitadas |
| Pro | $19/mês | 3 números |
| Business | $89/mês | Números ilimitados |

#### 3.2 Wappfly

| Plano | Preço | Inclui |
|-------|-------|--------|
| Free | **$0** | 50 mensagens/mês, 1 número |
| Starter | $7/mês | 5.000 mensagens, 1 número |
| Pro | $19/mês | 25.000 mensagens, 3 números |

#### 3.3 Whapi.Cloud

| Plano | Preço | Inclui |
|-------|-------|--------|
| Sandbox | **$0** | Testes apenas |
| Live | ~$5-10/mês | 1 número, ilimitado |

**Funcionamento (todos):**
```
Seu sistema (MandatoDigital)
         ↓ HTTP POST
    Serviço Cloud (token)
         ↓ QR Code
    WhatsApp do vereador
```

**Vantagens:**
- ✅ Zero infraestrutura (sem VPS, sem Docker)
- ✅ Setup em minutos (QR Code + token)
- ✅ Escalabilidade ilimitada
- ✅ Manutenção zero
- ✅ Custo previsível por cliente

**Desvantagens:**
- Dependência de terceiro
- Dados passam por servidor externo
- Preço mensal por número

---

## Comparativo Resumido

| Critério | WAHA (1 VPS/cliente) | Evolution API | Serviço Cloud |
|----------|----------------------|---------------|---------------|
| **Custo inicial** | R$ 30-50/mês | R$ 50-100/mês | $0-7/mês |
| **Custo por cliente** | R$ 30-50/mês | ~R$ 2-10/mês | $6-7/mês |
| **Setup** | Médio | Complexo | Simples |
| **Manutenção** | Média | Alta | Zero |
| **Escalar** | Linear | Boa | Ilimitada |
| **Isolamento** | Total | Por instância | Total |
| **Ponto de falha** | Distribuído | Único | Distribuído |

---

## Recomendação

### Fase 1: Agora (Teste + 1 cliente)
**Manter WAHA na VPS atual.**  
Custo: R$ 0 (VPS já existe)  
Justificativa: Simples, funciona, sem custo adicional.

### Fase 2: 2-10 clientes
**Avaliar serviço cloud (WasenderAPI ou Wappfly).**  
Custo: $6-7/mês por cliente  
Justificativa: Custo baixo, zero manutenção, rápido de implementar.

### Fase 3: 10+ clientes
**Reavaliar: Evolution API vs Cloud.**  
- Se margem for alta → continuar com cloud (simplicidade)
- Se margem for apertada → Evolution API em VPS dedicada (economia)

---

## Ações Pendentes

| # | Ação | Prioridade | Responsável |
|---|------|------------|-------------|
| 1 | Definir preço do SaaS incluindo WhatsApp | Alta | David (produto) |
| 2 | Testar WasenderAPI (conta grátis) | Média | Kimi (dev) |
| 3 | Documentar API do serviço escolhido | Média | Kimi (dev) |
| 4 | Implementar troca dinâmica de provedor | Baixa | Kimi (dev) |

---

## Referências

- WAHA API: https://waha.devlike.pro/
- Evolution API: https://evolutionfoundation.com.br/
- WasenderAPI: https://wasenderapi.com/
- Wappfly: https://wappfly.com/
- Whapi.Cloud: https://whapi.cloud/

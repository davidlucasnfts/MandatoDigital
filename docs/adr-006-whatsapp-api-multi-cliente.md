# ADR-006: Estratégia WhatsApp API para Múltiplos Clientes

> **Status:** Em revisão (segurança reforçada)  
> **Data:** 04/06/2026 (atualizado 08/06/2026)  
> **Contexto:** Integração WhatsApp (WAHA API) implementada para 1 cliente. Necessidade futura de suportar múltiplos vereadores (clientes) com sessões isoladas.

---

## Contexto

Atualmente o projeto usa **WAHA API** (CORE/grátis) rodando em uma única VPS HostUp:
- VPS: 2 CPUs, 3.8GB RAM, Ubuntu 20.04
- WAHA CORE: permite apenas **1 sessão** (`default`)
- QR Code conectado ao WhatsApp do vereador
- Funciona para testes e 1 cliente

## Problema

### Limitação 1: Apenas 1 sessão WhatsApp

O WAHA CORE não suporta múltiplas sessões. Se outro vereador usar o sistema:
- Veria o WhatsApp do vereador anterior ❌
- Poderia enviar mensagens como se fosse outra pessoa ❌
- Poderia desconectar o WhatsApp do outro ❌

**Cada cliente precisa de sua própria sessão WhatsApp isolada.**

### Limitação 2: QR Code expira rapidamente

O QR Code gerado pela WAHA é atualizado automaticamente a cada ~15 segundos pelo WhatsApp. O usuário precisa escanear dentro desse tempo, ou clicar em "Atualizar QR Code" para gerar um novo.

### Limitação 3: Segurança (resolvida em 08/06/2026)

O container WAHA estava mapeado com `-p 8080:3000` (exposto para `0.0.0.0`), deixando a API acessível diretamente pela internet. Corrigido bindando em `127.0.0.1:8080`.

---

## Arquitetura Segura Recomendada (corrigida)

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     HTTP      ┌─────────────┐
│   Navegador     │ ─────────────→ │  Vercel          │ ────────────→ │  WAHA       │
│   (usuário)     │                │  (tRPC/Hono)     │  localhost  │  (Docker)   │
└─────────────────┘                └──────────────────┘             └─────────────┘
                                          │
                                          ↓
                                   ┌─────────────┐
                                   │  Supabase   │
                                   └─────────────┘
```

### Regras de segurança obrigatórias

1. **WAHA bindada apenas em `127.0.0.1`**:
   ```bash
   docker run -d -p 127.0.0.1:8080:3000 --name waha ...
   ```

2. **Backend do MandatoDigital é o único cliente da WAHA**:
   - `WAHA_API_URL=http://localhost:8080`
   - Frontend nunca fala direto com a WAHA

3. **API Key forte**:
   - Mínimo 32 caracteres aleatórios
   - Nunca commitada
   - Rotacionada periodicamente

4. **UFW sem regra para porta 8080**:
   - Apenas 22/2222 (SSH) e 443 (HTTPS) abertos
   - Porta 8080 inacessível externamente

5. **HTTPS entre Vercel e VPS**:
   - Cloudflare Tunnel (recomendado)
   - Ou certificado Let's Encrypt + Nginx reverso

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
**Manter WAHA na VPS atual, mas com arquitetura segura.**  
Custo: R$ 0 (VPS já existe)  
Justificativa: Simples, funciona, sem custo adicional.

**Funcionalidade implementada (08/06/2026):**
- ✅ Conectar WhatsApp via QR Code
- ✅ Enviar campanhas para múltiplos contatos
- ✅ Status de conexão em tempo real
- ✅ QR Code atualiza automaticamente a cada 8s (polling)

**Limitações aceitas nesta fase:**
- Só 1 WhatsApp conectado por vez
- Se outro admin clicar "Conectar", desconecta o anterior
- QR Code expira a cada ~15s — usuário deve escanear rápido ou clicar "Atualizar"

**Ações obrigatórias:**
1. Reinstalar container WAHA com bind `127.0.0.1:8080:3000`
2. Atualizar `WAHA_API_URL` para `http://localhost:8080`
3. Garantir que UFW não tenha regra para porta 8080
4. Validar no backend que URL da WAHA não use IP público

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

| # | Ação | Prioridade | Responsável | Status |
|---|------|------------|-------------|--------|
| 1 | Reinstalar WAHA com bind seguro (127.0.0.1:8080) | 🔴 Crítica | David (infra) | ✅ Feito |
| 2 | Atualizar WAHA_API_URL na Vercel para localhost:8080 | 🔴 Crítica | David (infra) | ✅ Feito |
| 3 | Validar backend contra URL pública da WAHA | 🔴 Crítica | Kimi (dev) | ✅ Feito |
| 4 | Criar script de setup seguro (`setup-waha-secure.sh`) | 🟡 Alta | Kimi (dev) | ✅ Feito |
| 5 | Implementar QR Code com polling automático (8s) | 🟡 Alta | Kimi (dev) | ✅ Feito |
| 6 | Definir preço do SaaS incluindo WhatsApp | 🟡 Alta | David (produto) | Pendente |
| 7 | Testar WasenderAPI (conta grátis) | 🟢 Média | Kimi (dev) | Pendente |
| 8 | Documentar API do serviço escolhido | 🟢 Média | Kimi (dev) | Pendente |
| 9 | Implementar troca dinâmica de provedor | ⚪ Baixa | Kimi (dev) | Pendente |

---

## Checklist de Segurança da WAHA

```
□ Container WAHA bindado em 127.0.0.1:8080 (não 0.0.0.0)
□ WAHA_API_URL=http://localhost:8080 (nunca IP público)
□ WAHA_API_KEY com 32+ caracteres aleatórios
□ UFW sem regra para porta 8080
□ SSH apenas na porta 2222 (não 22) ou com chave + fail2ban
□ Logs de acesso da WAHA monitorados
□ API Key rotacionada a cada 90 dias
□ HTTPS entre Vercel e VPS (Cloudflare Tunnel ou Nginx + Let's Encrypt)
```

---

## Notas de Implementação (08/06/2026)

### QR Code — Tempo de Expiração

O QR Code do WhatsApp Web é **atualizado automaticamente** pela WAHA a cada ~15 segundos. Isso é exigência do próprio WhatsApp, não da WAHA.

**Como funciona:**
1. Usuário clica "Conectar WhatsApp"
2. Backend chama `POST /api/sessions/default/start`
3. Status muda para `SCAN_QR_CODE`
4. Frontend busca QR Code via `GET /api/default/auth/qr`
5. A cada **8 segundos**, o frontend busca um QR Code novo (polling)
6. Usuário escaneia com o celular
7. Se demorar mais que ~15s, o QR Code expira — usuário clica "Atualizar QR Code"

**Por que 8 segundos?**
- QR Code expira a cada ~15s
- Polling a cada 8s garante que o usuário sempre tenha um QR Code válido
- Não pode ser muito frequente (sobrecarrega a API)
- Não pode ser muito raro (usuário fica com QR Code expirado)

### Limitação de Sessão Única

**Cenário atual:**
- Admin A conecta seu WhatsApp → funciona
- Admin B clica "Conectar" → desconecta o WhatsApp do Admin A → conecta o dele
- Sempre só 1 WhatsApp ativo por vez

**Por que acontece:**
WAHA Core (gratuita) só suporta 1 sessão (`default`). Não há isolamento por tenant.

**Soluções futuras:**
| Opção | Custo/mês | Setup | Manutenção |
|---|---|---|---|
| 1 VPS por cliente | R$ 30-50 | Médio | Média |
| Evolution API | R$ 50-100 | Complexo | Alta |
| Serviço Cloud (WasenderAPI) | $6-7 | Simples | Zero |

**Recomendação:** Migrar para serviço cloud quando tiver 2+ clientes pagantes.

---

## Referências

- WAHA API: https://waha.devlike.pro/
- Evolution API: https://evolutionfoundation.com.br/
- WasenderAPI: https://wasenderapi.com/
- Wappfly: https://wappfly.com/
- Script de setup seguro: `scripts/setup-waha-secure.sh`

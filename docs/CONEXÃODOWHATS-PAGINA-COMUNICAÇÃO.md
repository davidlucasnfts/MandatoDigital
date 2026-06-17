# CONEXÃO DO WHATSAPP - PÁGINA DE COMUNICAÇÃO

> **Data:** 16/06/2026
> **Status:** Em andamento - QR Code não está funcionando
> **Próxima sessão:** Continuar debug do QR Code

---

## Resumo do que foi feito nesta sessão

### 1. Problema identificado
A conexão WhatsApp sumiu da página de Comunicação quando a V2 foi promovida à produção. O `WhatsAppStatusCard` ficou órfão (não importado em nenhuma página).

### 2. Solução implementada

#### a) Restaurar `WhatsAppStatusCard.tsx`
- **Arquivo:** `src/components/WhatsAppStatusCard.tsx`
- **Fonte:** Commit `b2aa5e8` (última versão que funcionava)
- **Melhorias incorporadas da Configurações V2** (commit `48a509b`):
  - `wahaMe` — mostra nome do WhatsApp conectado
  - `qrError` — tratamento de erro do QR Code
  - `qrCountdown` — contador regressivo visual (15s → 0)
  - Polling inteligente a cada 3s para detectar escaneamento
  - Auto-renovação do QR a cada 10s
  - Logs de debug no console

#### b) Integrar na `ComunicacaoPage.tsx`
- **Layout:** Grid `1 lg:grid-cols-4` — WhatsApp em `lg:col-span-1`, stats em `lg:col-span-3`
- **Import adicionado:** `WhatsAppStatusCard` + `useWhatsApp`

#### c) Remover aba WhatsApp das Configurações
- **Arquivo:** `src/pages/ConfiguracoesPage.tsx`
- Aba WhatsApp removida — conexão fica **somente** na Comunicação

#### d) Substituir envio simulado por envio real
- **Arquivo:** `src/pages/ComunicacaoPage.tsx`
- Função `handleEnviarCampanha` agora usa `sendText()` do hook `useWhatsApp`
- Envio real via WAHA API com delay de 1s entre mensagens

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/WhatsAppStatusCard.tsx` | Restaurado + melhorias da Configurações V2 |
| `src/pages/ComunicacaoPage.tsx` | Adicionado WhatsAppStatusCard + envio real WAHA |
| `src/pages/ConfiguracoesPage.tsx` | Removida aba WhatsApp |

---

## Problema pendente: QR Code não funciona

### Sintomas
- Ao clicar "Conectar WhatsApp", o status muda para "Iniciando..." ou "Aguardando QR Code"
- O QR Code não aparece (imagem quebrada ou não gera)

### Possíveis causas (para investigar na próxima sessão)

#### 1. WAHA API não está acessível
- Verificar se container WAHA está rodando na VPS: `docker ps`
- Verificar se `WAHA_API_URL` no `.env` está correto
- **ATENÇÃO:** O `.env` atual tem `http://82.197.73.101:8080` (IP público) — deveria ser `http://localhost:8080` conforme ADR-006

#### 2. Endpoint de QR Code incorreto
- O router usa `GET /api/default/auth/qr` (WAHA Core)
- Verificar se a WAHA Core suporta este endpoint
- Alternativa: `GET /api/sessions/default/auth/qr` (outras versões)

#### 3. Sessão não está em estado SCAN_QR_CODE
- O `startSession` pode retornar `STARTING` em vez de `SCAN_QR_CODE`
- O QR Code só é gerado quando status é `SCAN_QR_CODE`
- Verificar logs do console no navegador

#### 4. Problema de CORS ou rede
- Backend (Vercel) → WAHA (VPS) pode ter bloqueio
- Verificar se a API Key está correta
- Verificar se a porta 8080 está aberta no firewall

---

## Checklist para próxima sessão

```
□ 1. Verificar se container WAHA está rodando na VPS
   docker ps | grep waha

□ 2. Verificar WAHA_API_URL no .env
   Deve ser: http://localhost:8080
   Nunca: IP público (82.197.73.101:8080)

□ 3. Testar endpoint da WAHA manualmente
   curl -H "X-Api-Key: <KEY>" http://localhost:8080/api/sessions/default

□ 4. Verificar logs do console no navegador
   Procurar: "Start session result", "QR Code result", "Polling status"

□ 5. Testar endpoint de QR Code diretamente
   curl -H "X-Api-Key: <KEY>" http://localhost:8080/api/default/auth/qr

□ 6. Verificar se a sessão está em SCAN_QR_CODE
   O status deve ser "SCAN_QR_CODE" para o QR aparecer

□ 7. Se tudo falhar: verificar versão da WAHA
   docker logs waha | head -20
```

---

## Referências

- **ADR-006:** `docs/adr-006-whatsapp-api-multi-cliente.md`
- **Hook useWhatsApp:** `src/hooks/useWhatsApp.ts`
- **Router WAHA:** `api/whatsapp-router.ts`
- **Componente:** `src/components/WhatsAppStatusCard.tsx`
- **Página:** `src/pages/ComunicacaoPage.tsx`

---

## Notas técnicas

### Fluxo de conexão WhatsApp
```
1. Usuário clica "Conectar WhatsApp"
2. Frontend chama startSession() → POST /api/sessions/default/start
3. Backend aguarda até 45s por status SCAN_QR_CODE ou WORKING
4. Se SCAN_QR_CODE: frontend inicia polling do QR Code
5. Frontend chama getQRCode() → GET /api/default/auth/qr
6. QR Code aparece na tela com contador regressivo
7. Usuário escaneia com celular
8. Polling detecta status WORKING → mostra "Conectado"
```

### Estados do WhatsAppStatusCard
| Estado | Visual |
|--------|--------|
| OFFLINE | Cinza + botão "Conectar" |
| STARTING | Azul + loading |
| SCAN_QR_CODE | Âmbar + QR Code + contador |
| WORKING | Verde + nome do WhatsApp + botão "Desconectar" |

---

## Commits relacionados
- `b2aa5e8` — feat: adiciona card de conexão WhatsApp dentro da página Comunicação
- `48a509b` — feat(configuracoes): adiciona aba WhatsApp em ConfiguracoesPageV2 (teste local)
- `76c7ae6` — feat: Agenda V2 com Design System + fix WhatsApp QR Code + processo ícones
- `adfbe74` — feat(whatsapp): integra WAHA API para envio automatico de mensagens

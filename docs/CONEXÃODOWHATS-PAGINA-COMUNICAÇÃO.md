# CONEXÃO DO WHATSAPP - PÁGINA DE COMUNICAÇÃO

> **Data:** 16/06/2026 (atualizado em 17/06/2026)
> **Status:** Em teste - fluxo de conexão corrigido com logs e fallback de screenshot
> **Próxima sessão:** Validar na VPS/Vercel

---

## Resumo do que foi feito nesta sessão

### 1. Problema identificado
A conexão WhatsApp sumiu da página de Comunicação quando a V2 foi promovida à produção. O `WhatsAppStatusCard` ficou órfão (não importado em nenhuma página).

### 2. Correções da sessão 17/06
- **`api/whatsapp-router.ts`**:
  - `startSession` agora usa `POST /api/sessions/default/start` (idempotente, correto na WAHA Core).
  - Fallback para `POST /api/sessions` com `{ name: "default" }` se o start falhar.
  - `getQRCode` mantém `GET /api/default/auth/qr` e adiciona fallback para `GET /api/screenshot`.
  - Logs estruturados em todas as chamadas WAHA (sem expor API Key/URL).
  - Conversão de imagem direta para base64 via `Buffer.from` (compatível com Node.js serverless).
- **`src/components/WhatsAppStatusCard.tsx`**:
  - Área de QR Code agora também aparece no estado `STARTING`.
  - Aguarda 3s antes de buscar QR quando o backend retorna `STARTING`.
  - Mensagens de erro mais claras vindas do backend.

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
| `src/components/WhatsAppStatusCard.tsx` | Restaurado + melhorias da Configurações V2 + suporte a estado STARTING |
| `src/pages/ComunicacaoPage.tsx` | Adicionado WhatsAppStatusCard + envio real WAHA |
| `src/pages/ConfiguracoesPage.tsx` | Removida aba WhatsApp |
| `api/whatsapp-router.ts` | Fluxo de start corrigido, fallback de screenshot, logs seguros |

---

## Problema pendente: validar na VPS/Vercel

### Sintomas anteriores
- Ao clicar "Conectar WhatsApp", o status mudava para "Iniciando..." ou "Aguardando QR Code"
- O QR Code não aparecia (imagem quebrada ou não gerava)

### Causas corrigidas no código
- [x] `startSession` chamava `POST /api/sessions` com body customizado, que pode falhar na Core.
- [x] `startSession` reiniciava sessão existente em vez de iniciar, perdendo o QR.
- [x] `getQRCode` não tinha fallback se `/api/default/auth/qr` retornasse erro.
- [x] Frontend não lidava bem com o estado `STARTING`.

### Causas que ainda dependem de infraestrutura
- **WAHA_API_URL na Vercel:** se estiver `http://localhost:8080`, o backend serverless não acessa a VPS. Deve ser IP público:8080 (temporário) ou domínio via proxy.
- **Porta 8080 aberta:** necessária enquanto não houver domínio + Cloudflare/Nginx.
- **Container WAHA rodando:** `docker ps | grep waha`.
- **API Key correta:** `WAHA_API_KEY` no `.env` da VPS deve ser igual ao da Vercel.

---

## Checklist de validação

```
□ 1. Verificar se container WAHA está rodando na VPS
   docker ps | grep waha

□ 2. Verificar WAHA_API_URL na Vercel
   Deve apontar para um endereço acessível pela Vercel:
   - IP público: http://82.197.73.101:8080 (temporário, menos seguro)
   - Domínio via proxy: https://waha.seudominio.com (recomendado)
   NUNCA: http://localhost:8080 (serverless da Vercel não acessa a VPS)

□ 3. Testar endpoint da WAHA manualmente (dentro da VPS)
   curl -H "X-Api-Key: <KEY>" http://localhost:8080/api/sessions/default

□ 4. Testar start session (dentro da VPS)
   curl -X POST -H "X-Api-Key: <KEY>" http://localhost:8080/api/sessions/default/start

□ 5. Testar endpoint de QR Code diretamente (dentro da VPS)
   curl -H "X-Api-Key: <KEY>" -H "Accept: application/json" http://localhost:8080/api/default/auth/qr

□ 6. Verificar logs do backend na Vercel
   Procurar: "[WAHA] POST /api/sessions/default/start -> HTTP ..."

□ 7. Verificar logs do console no navegador
   Procurar: "Start session result", "QR Code result", "Polling status"

□ 8. Se tudo falhar: verificar versão da WAHA
   docker logs waha --tail 50
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

### Fluxo de conexão WhatsApp (corrigido)
```
1. Usuário clica "Conectar WhatsApp"
2. Frontend chama startSession() → tRPC → api/whatsapp-router.ts
3. Backend chama POST /api/sessions/default/start (idempotente na Core)
4. Se falhar, backend tenta POST /api/sessions { name: "default" }
5. Backend faz polling por até 45s por status SCAN_QR_CODE ou WORKING
6. Frontend mostra área de QR Code mesmo em STARTING
7. Frontend chama getQRCode() → GET /api/default/auth/qr
8. Se /auth/qr falhar, backend tenta GET /api/screenshot
9. QR Code aparece na tela com contador regressivo
10. Usuário escaneia com celular
11. Polling detecta status WORKING → mostra "Conectado"
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

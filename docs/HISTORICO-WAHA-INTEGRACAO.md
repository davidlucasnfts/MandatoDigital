# Histórico de Integração WAHA API — Mandato Digital

> **Data:** 18/06/2026
> **Status:** Migrado para Evolution API (instabilidade crítica da WAHA Core)
> **Referência:** Este documento serve para caso seja necessário retomar a WAHA no futuro.

---

## Sumário Executivo

A integração com a WAHA API (versão Core gratuita) apresentou instabilidade crítica que impediu o uso em produção. Após 15+ tentativas de correção, migramos para a Evolution API.

---

## Problemas Identificados

### 1. Rate Limiting (429 Too Many Requests)
**Sintoma:** Backend retornava 429 após poucas chamadas.
**Causa:** WAHA Core tem rate limit agressivo (~5 req/min).
**Tentativas:**
- Reduzir polling de 1s para 3s → Falhou
- Reduzir polling de 3s para 5s → Falhou
- Desativar polling automático → Parcial (429 persistia no backend)
- Adicionar delay de 1s entre chamadas → Parcial
- Cache de 5s no backend → Melhorou, mas não resolveu

### 2. Sessão Entrando em FAILED
**Sintoma:** Ao escanear QR Code, sessão entrava em FAILED.
**Causa:** Engine WEBJS da WAHA Core é instável com QR Code.
**Tentativas:**
- Logout + recriar sessão → Falhou
- Delete + recriar sessão → Falhou
- Restart do container WAHA → Funcionava temporariamente
- Usar endpoint `/api/sessions/default/start` → Falhou
- Usar endpoint `/api/sessions/default/restart` → Falhou

### 3. QR Code Expirando Rápido
**Sintoma:** QR Code expirava antes de conseguir escanear.
**Causa:** WAHA Core gera QR novo a cada ~15s.
**Tentativas:**
- Auto-renovação a cada 10s → Causava 429
- Auto-renovação a cada 30s → QR expirava
- Buscar QR manualmente via botão → Funcionava, mas sessão falhava ao escanear

### 4. Conexão SSH Bloqueada
**Sintoma:** Não conseguimos acessar a VPS para reiniciar o container.
**Causa:** Porta 22 fechada no firewall.
**Solução alternativa:** Reiniciar WAHA via API (`POST /api/server/stop`).

---

## Arquivos Modificados durante a integração

| Arquivo | Mudanças | Versão Final |
|---------|----------|--------------|
| `api/whatsapp-router.ts` | 15+ reescritas | Cache, delays, tratamento de FAILED |
| `src/components/WhatsAppStatusCard.tsx` | 10+ reescritas | Fluxo manual simplificado |
| `src/hooks/useWhatsApp.ts` | 3+ reescritas | Adicionado logoutSession |
| `docs/CONEXÃODOWHATS-PAGINA-COMUNICAÇÃO.md` | Atualizado | Documentação do fluxo |

---

## Endpoints WAHA Utilizados

```
GET  /api/sessions/default           → Verifica status
POST /api/sessions                    → Cria sessão
POST /api/sessions/default/start      → Inicia sessão
POST /api/sessions/default/restart    → Reinicia sessão
POST /api/sessions/default/logout     → Desconecta
POST /api/sessions/default/stop       → Para sessão
DELETE /api/sessions/default          → Deleta sessão
GET  /api/default/auth/qr             → Busca QR Code
GET  /api/screenshot?session=default  → Fallback QR
POST /api/sendText                    → Envia mensagem
POST /api/server/stop                 → Reinicia servidor
```

---

## Configuração da VPS (HostUp)

| Parâmetro | Valor |
|-----------|-------|
| IP | 82.197.73.101 |
| Porta WAHA | 8080 |
| Engine | WEBJS |
| Versão | Core (gratuita) |
| API Key | f42531c9cc4f6a3fe8fe0660a55aba6945564bd77780ec3bfd31212f8286f95b |

---

## Decisão de Migração

**Data:** 18/06/2026
**Motivo:** Instabilidade crítica da WAHA Core impediu uso em produção.
**Alternativa escolhida:** Evolution API
**Razão:** Open source, popular no Brasil, engine mais estável (Baileys).

---

## Referências

- WAHA Docs: https://waha.devlike.pro/docs/how-to/sessions/
- WAHA GitHub: https://github.com/devlikeapro/waha
- Evolution API: https://evolution-api.com/

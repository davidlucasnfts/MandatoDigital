# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 04/06/2026
> **Sessão atual:** Dashboard — Dados reais restaurados, mock removido

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**WhatsApp — WAHA API integrada na VPS — 04/06**

### ✅ O que foi entregue:
- **WAHA API instalada na VPS:**
  - Docker instalado na VPS HostUp (82.197.73.101)
  - Container WAHA rodando na porta 8080
  - API Key configurada
  - Sessão "default" criada (aguardando QR Code)

- **Hook useWhatsApp.ts:**
  - `getSession()` — verifica status da conexão
  - `sendText()` — envia mensagem para 1 número
  - `sendBulk()` — envia em massa com progresso
  - `getQRCode()` — gera QR Code para conexão

- **NovaCampanhaDialog atualizado:**
  - Usa WAHA API em vez de `wa.me` links
  - Envio 100% automático (sem abrir abas)
  - Delay de 1s entre envios
  - Progresso em tempo real

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Instalar Docker na VPS
- [x] Instalar WAHA (container Docker)
- [x] Configurar WAHA (API key, sessão)
- [x] Criar hook useWhatsApp
- [x] Atualizar NovaCampanhaDialog para usar WAHA
- [x] Type check passando
- [x] Commit + push
- [x] Deploy Vercel (em andamento)

### ⚠️ Ação manual pendente:
- **Escanear QR Code** para conectar WhatsApp
  - Acesse: http://82.197.73.101:8080
  - Ou use a API: `GET /api/screenshot?session=default`
  - Abra WhatsApp no celular → Aparelhos conectados → Conectar
  - Aponte para o QR Code

### 📝 Próximos passos:
- [ ] Webhook para receber respostas dos eleitores
- [ ] Status de entrega (enviado, entregue, lido)
- [ ] Rodar migration 032 no Supabase

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| DashboardHomeV2 | `DashboardHomeV2.tsx` | 04/06 | **Promovido à produção** — arquivo mantido para histórico |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 01/06 | **Promovida à produção** — arquivo mantido para histórico |
| Mapa V1 | `MapaPageV1.tsx` | 28/05 | Arquivado — teste de clusters com ícones |
| Mapa V2 | `MapaPageV2.tsx` | 01/06 | **Em produção** — cópia de trabalho mantida |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |

---

## Decisões Pendentes
- Nenhuma. Dashboard com dados reais em produção.

---

## Próxima Sessão — Sugestões
1. Testar Dashboard em produção após deploy
2. Revisar outras páginas que precisam de refatoração (Equipe, Enquetes, etc.)
3. App mobile / PWA para campo

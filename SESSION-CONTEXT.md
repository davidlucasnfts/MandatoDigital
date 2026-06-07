# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 06/06/2026
> **Sessão atual:** Comunicação V2 promovida + card WhatsApp (parcial)

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Comunicação V2 — Promovida à produção + Card WhatsApp na mesma página — 06/06**

### ✅ O que foi entregue:
- **ComunicacaoPage.tsx** substituída pela versão V2 (campanhas WhatsApp, templates, filtros, envios)
- **Rota de teste removida**: `/dashboard/comunicacao/teste-v2` não existe mais
- **Link de teste removido** do sidebar
- **Arquivo V2 mantido** como histórico (`ComunicacaoPageV2.tsx`)
- **WhatsAppStatusBar** adicionado na página Comunicação (barra compacta acima dos stats)
- **WhatsAppConnectModal** criado com fluxo de conexão/QR Code/desconexão
- **Backend ajustado**: `startSession` agora cria sessão `default` se não existir
- Type check passando

### ⚠️ Pendente para próxima sessão:
- **Validar fluxo completo de geração de QR Code** — ao clicar em "Conectar", o QR Code não está aparecendo consistentemente
- Possível causa: sessão WAHA na VPS pode estar em estado inconsistente (deletada em testes anteriores)
- Próximo passo: testar endpoint `/api/sessions` da WAHA e garantir que `startSession` retorne `SCAN_QR_CODE`

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Copiar ComunicacaoPageV2.tsx para ComunicacaoPage.tsx
- [x] Remover rota `/comunicacao/teste-v2` do App.tsx
- [x] Remover link "Comunicação V2" do DashboardLayout.tsx
- [x] Manter arquivo V2 para histórico
- [x] Atualizar MEMORY.md
- [x] Atualizar SESSION-CONTEXT.md
- [x] Type check passando
- [x] Adicionar WhatsAppStatusBar na Comunicação
- [x] Criar WhatsAppConnectModal
- [x] Ajustar backend para criar sessão default se não existir

### 📝 Próximos passos:
- [ ] Corrigir geração de QR Code no modal WhatsApp
- [ ] Testar fluxo completo: Conectar → QR Code → Escanear → Conectado → Enviar campanha
- [ ] Implementar envio de e-mail (SendGrid/Resend)
- [ ] Webhook para receber respostas dos eleitores

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
| Comunicação V2 | `ComunicacaoPageV2.tsx` | 06/06 | **Promovida à produção** — arquivo mantido para histórico |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |

---

## Decisões Pendentes
- Correção do fluxo de QR Code do WhatsApp na próxima sessão.

---

## Próxima Sessão — Sugestões
1. Corrigir geração de QR Code no WhatsAppConnectModal
2. Testar fluxo completo de conexão do WhatsApp
3. Revisar outras páginas que precisam de refatoração

# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 04/06/2026
> **Sessão atual:** Dashboard — Dados reais restaurados, mock removido

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Comunicação V2 — Melhorias na página de campanhas — 06/06**

### ✅ O que foi entregue:
- **Botões de ação com texto + ícone (Design System):**
  - Editar (azul), Enviar (verde), Reenviar (âmbar), Excluir (vermelho)
  - Todos sólidos, empilhados verticalmente, com texto + ícone
  - Removidos ícones solitários sem texto

- **Ações pendentes implementadas:**
  - **Editar campanha (rascunho):** Abre NovaCampanhaDialog com dados preenchidos
  - **Enviar campanha (rascunho):** Processa envio com progresso, atualiza status
  - **Reenviar campanha (enviada):** Reprocessa envio para mesmos destinatários
  - **Excluir campanha:** Remoção com confirmação via CampanhaPreview

- **Status individual dos envios no preview:**
  - Nova seção "Status dos envios" no CampanhaPreview
  - Mostra cada destinatário com ícone de status (pendente/enviado/erro/lido)
  - Seção colapsável para não poluir a visualização

- **Removida opção de e-mail:**
  - NovaCampanhaDialog só oferece WhatsApp (e-mail não estava implementado)
  - Evita confusão do usuário

- **NovaCampanhaDialog suporta edição:**
  - Prop `campanhaEditando` preenche formulário com dados existentes
  - Atualiza campanha em vez de criar nova
  - Título muda para "Editar Campanha"

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Botões de ação com texto + ícone (Design System)
- [x] Implementar editar campanha (rascunho)
- [x] Implementar enviar campanha (rascunho)
- [x] Implementar reenviar campanha (enviada)
- [x] Mostrar status individual dos envios no preview
- [x] Remover opção de e-mail não implementada
- [x] NovaCampanhaDialog suportar edição
- [x] **BUGFIX: Lista atualiza após criar/editar campanha (onSuccess + reload)**
- [x] **BUGFIX: Status dos envios atualiza para 'enviado'/'erro' após envio WAHA**
- [x] **BUGFIX: Edição de campanha carrega dados corretamente (useEffect no open)**
- [x] **Salvar campanha como rascunho**
- [x] **Remover filtro TAG (dados não padronizados)**
- [x] **Filtro por Cidade (select com dados reais do banco)**
- [x] **Filtro por Líder (eleitores com nivel='lider')**
- [x] **Filtro por Liderados (eleitores vinculados a um líder)**
- [x] Type check passando

### ⚠️ Ação manual pendente:
- **Escanear QR Code** para conectar WhatsApp (pendente da sessão anterior)
  - Acesse: http://82.197.73.101:8080
  - Ou use a API: `GET /api/screenshot?session=default`
  - Abra WhatsApp no celular → Aparelhos conectados → Conectar
  - Aponte para o QR Code

### 📝 Próximos passos:
- [ ] Promover ComunicacaoPageV2 para produção (copiar para ComunicacaoPage.tsx)
- [ ] Webhook para receber respostas dos eleitores
- [ ] Status de entrega real (enviado, entregue, lido) via WAHA webhooks
- [ ] Implementar envio de e-mail (SendGrid/Resend)

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
| Comunicação V2 | `ComunicacaoPageV2.tsx` | 06/06 | **Em teste** — melhorias aplicadas, aguardando aprovação |

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

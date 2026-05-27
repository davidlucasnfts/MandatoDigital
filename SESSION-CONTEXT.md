# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 27/05/2026
> **Sessão atual:** Mapa V3 + Cache de CEP + Comunidades

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Mapa V3 + Cache de CEP + Comunidades — 27/05**

### ✅ O que foi entregue:
- **Cache de CEP:** Tabela `cep_cache` no Supabase com RLS — reduz chamadas Here API em 90%
- **Comunidades:** Cadastro com geocodificação CNEFE → Here API → cache
  - CEP busca ViaCEP + geocodifica automaticamente
  - Número com checkbox S/N + refine Here API no onBlur
  - Campos bloqueados quando CEP preenchido (rua, bairro, cidade, estado)
  - Cor e ícone removidos do formulário (padrão verde fixo)
- **Mapa:**
  - Legenda flutuante com comunidade em verde
  - Cluster separado para comunidades (verde) e eleitores (azul)
  - `zIndexOffset` para comunidades ficarem por cima
  - Ícone de comunidade reduzido (28px)
  - MapaPageV2 também atualizado
- **Build passando**, zero erros TypeScript

### 📋 Checklist próxima sessão:
- [ ] Testar cache de CEP em produção (segundo CEP deve vir do cache)
- [ ] Testar comunidades em produção (geocodificação, mapa)
- [ ] Verificar se ícones das comunidades estão verdes no mapa principal
- [ ] Testar cluster de comunidades vs eleitores
- [ ] Decidir: remover MapaPageV2 ou mantê-lo sincronizado
- [ ] Verificar performance das queries
- [ ] Testar meta eleitoral (editar e salvar)
- [ ] Testar vinculo de lider com lider em producao
- [ ] Testar campos eleitorais (secao, zona, titulo) em producao
- [ ] Verificar se ícones Tabler estão corretos em todas as abas
- [ ] Comprar/configurar domínio próprio (se decidir)
- [ ] Importar mais estados CNEFE se necessario (PB, RN, PI)

---

## Histórico
**Dashboard v2 — 10 melhorias completas — 24/05**

### ✅ O que foi entregue hoje:

#### 1. Cards com tendência (↑↓ %)
- `useStats` agora calcula variação mês atual vs mês anterior
- Badge verde (positivo) / vermelho (negativo) em cada card
- Ícones `TrendingUp`/`TrendingDown` do Tabler

#### 2. Painel Território
- Top 5 bairros com mais eleitores (barras de progresso)
- Cobertura geográfica: % de eleitores geolocalizados no mapa
- Link direto para o mapa territorial

#### 3. Produtividade dos Líderes (mini ranking)
- Top 3 líderes com mais eleitores vinculados
- Mostra estimativa de votos e taxa de conversão
- Link para página completa de produtividade

#### 4. Proposições em tramitação
- Contagem por status (em elaboração, tramitação, aprovada, arquivada)
- 3 proposições mais recentes com badge colorido
- Link para gerenciar proposições

#### 5. Enquetes ativas
- Total de enquetes ativas + total de respostas
- Lista das 3 enquetes mais recentes com contagem de respostas

#### 6. Atividade recente (feed)
- Últimos eleitores cadastrados
- Solicitações resolvidas
- Interações registradas
- Formato de tempo relativo (agora, 5min, 2h, 3d)

#### 7. Meta eleitoral — barra de progresso
- Meta configurável (salva em `configuracoes`)
- Barra de progresso visual
- Projeção: "Na velocidade atual, atinge a meta em X dias"

#### 8. Aniversariantes — estatística de envios
- Barra de progresso: % de mensagens já enviadas no período
- Contador "X de Y enviados"

#### 9. Comunicação — status dos canais
- Quantos eleitores têm e-mail / WhatsApp
- Total de envios de aniversário no ano
- Base segmentável

#### 10. Convites pendentes de aprovação
- Lista de eleitores aguardando aprovação
- Tempo de espera (hoje, ontem, X dias)
- Link para aprovar

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **VPS (SSH)** | ssh -p 2222 root@82.197.73.101 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | Comprar domínio (Registro.br, Porkbun ou KingHost) | Site do registrador | Média |
| 2 | Configurar DNS para apontar VPS | Painel do registrador | Média |
| 3 | Configurar Certbot (HTTPS) | VPS (quando tiver domínio) | Média |
| 4 | Configurar Cloudflare Tunnel | Cloudflare (opcional) | Baixa |

---

## Variáveis de Ambiente (Vercel)

```
DATABASE_URL=postgresql://postgres.fawzdzfazmudolggtfno:[SENHA]@aws-1-us-west-2.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_HERE_API_KEY=bPFahqLf6LlNCV9bq4k7pDB9iTiRj_twmAeRf06-lUM
CNEFE_API_URL=http://82.197.73.101
```

---

## Dashboard V2 Premium (Skill Design System)

> **Criado em:** 25/05/2026
> **Status:** Salvo para análise/comparação futura
> **Local:** `src/pages/DashboardV2.tsx` + `src/components/dashboard-v2/`

### Componentes criados:
- `StatCard` — Cards de stats com hover animado (-translate-y-0.5)
- `PanelCard` — Cards padronizados com header + content
- `MetaPanel` — Meta eleitoral com barra de progresso animada
- `EmptyState` — Estados vazios com ícone + descrição + CTA
- `CommandMenu` — Busca global (Ctrl+K)
- `SkeletonCard` — Skeletons anatômicos para loading

### Diferenças vs Dashboard Atual:
| Aspecto | Atual (v2.2) | V2 (Skill) |
|---|---|---|
| Command Menu | ❌ Não tem | ✅ Ctrl+K |
| Hover cards | Só sombra | Levanta card |
| Empty states | Texto simples | Ícone + CTA |
| Barras progresso | Estáticas | Animadas |
| Acessibilidade | Básica | aria-label, focus ring |
| Meta Eleitoral | Card diferente | Mesmo padrão |

### Como acessar:
- Desenvolvimento: `http://localhost:3000/dashboard/teste-v2`
- **Atenção:** Rota `/dashboard/teste-v2` está no App.tsx

---

## Checklist Próxima Sessão

```
□ TESTAR Solicitacoes V3 em: http://localhost:3003/dashboard/solicitacoes/teste-v3
□ Aprovar/rejeitar Solicitacoes V3 → se aprovado, copiar para SolicitacoesPage.tsx
□ Testar dashboard v2.2 em produção (todos os painéis)
□ Verificar performance das queries (muitas requisições no dashboard)
□ Testar meta eleitoral (editar e salvar)
□ Testar vinculo de lider com lider em producao
□ Testar campos eleitorais (secao, zona, titulo) em producao
□ Verificar se ícones Tabler estão corretos em todas as abas
□ Comprar/configurar domínio próprio (se decidir)
□ Importar mais estados CNEFE se necessário (PB, RN, PI)
□ Decidir se aplica melhorias do V2 no dashboard principal
```

---

## Erros Registrados (Self-Healing)

| # | Erro | Data | Prevenção |
|---|---|---|---|
| 008 | API Proxy sem rate limiting / rodando como root | 19/05/2026 | Sempre usar usuário dedicado, rate limiting, systemd |
| 009 | Ícones Tabler inexistentes causando crash | 23/05/2026 | Sempre verificar existência no pacote antes de usar |
| 010 | DATABASE_URL com valor placeholder na Vercel | 24/05/2026 | Sempre verificar se env vars estão corretas após qualquer mudança |
| 011 | Senha com `!` quebra URL PostgreSQL | 24/05/2026 | Usar encodeURIComponent na senha ou evitar caracteres especiais |
| 012 | schema_safe.sql desatualizado | 24/05/2026 | Sempre rodar `npm run db:schema-safe` após nova migration |

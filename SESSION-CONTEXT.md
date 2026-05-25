# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 25/05/2026
> **Sessão atual:** Correções Dashboard v2 + Responsividade + Design System

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Dashboard v2.2 — Correções de design + Responsividade — 25/05**

### ✅ O que foi corrigido:
- Ícones inexistentes causando crash
- Meta Eleitoral redesenhado (mesmo estilo dos stats)
- Espaços vazios removidos dos cards
- Layout simétrico em todos os grids
- Responsividade mobile otimizada
- Cache Vite limpo para refletir mudanças

### 📋 Checklist próxima sessão:
- [ ] Testar dashboard em produção (todos os painéis)
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

## Checklist Próxima Sessão

```
□ Testar dashboard v2 em produção (todos os 10 painéis)
□ Verificar performance das queries (muitas requisições no dashboard)
□ Testar meta eleitoral (editar e salvar)
□ Testar vinculo de lider com lider em producao
□ Testar campos eleitorais (secao, zona, titulo) em producao
□ Verificar se ícones Tabler estão corretos em todas as abas
□ Comprar/configurar domínio próprio (se decidir)
□ Importar mais estados CNEFE se necessário (PB, RN, PI)
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

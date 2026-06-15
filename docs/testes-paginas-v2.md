# Roteiro de Testes — Páginas V2 do Dashboard

> **Objetivo:** validar visualmente cada página V2 antes de promovê-la à produção.  
> **Ambiente:** http://localhost:3000/dashboard/{aba}/teste-v2  
> **Atualizado em:** 15/06/2026

---

## Como testar

1. Acesse a URL da página.
2. Marque cada item com ✅ (ok), ❌ (bug) ou ⚠️ (atenção).
3. Se encontrar bug, anote o passo-a-passo e o erro do console (F12 → Console).
4. Ao final, informe quais páginas estão aprovadas para promoção à produção.

---

## 1. Agenda V2
**URL:** `/dashboard/agenda/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 1.1 | Página carrega sem erro no console | |
| 1.2 | Stats cards aparecem (Total, Este mês, Próximos 7 dias, Hoje) | |
| 1.3 | Calendário renderiza com dias do mês atual | |
| 1.4 | Eventos aparecem nos cards ao lado do calendário | |
| 1.5 | Horário é exibido em texto (`14:00 — 15:30`) sem ícone de relógio | |
| 1.6 | Clicar em "Novo Evento" abre o dialog | |
| 1.7 | Consegue digitar título, local e descrição sem travar | |
| 1.8 | Selecionar tipo de evento atualiza a cor do ícone | |
| 1.9 | Salvar evento atualiza a lista | |
| 1.10 | Clicar no card de evento abre preview modal com detalhes | |
| 1.11 | Textos longos no preview não quebram layout (`break-all`) | |
| 1.12 | Botões Editar/Excluir no card são sempre visíveis | |
| 1.13 | Responsivo em 375px e 1440px | |

---

## 2. Comunicação V2
**URL:** `/dashboard/comunicacao/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 2.1 | Página carrega sem erro no console | |
| 2.2 | Lista de campanhas aparece | |
| 2.3 | Botões Nova Campanha / Templates visíveis | |
| 2.4 | Criar nova campanha abre o formulário | |
| 2.5 | Filtros de destinatários (Cidade, Líder, Liderados) carregam dados | |
| 2.6 | Salvar rascunho funciona | |
| 2.7 | Enviar campanha atualiza status dos envios | |
| 2.8 | Preview da campanha mostra status individual dos envios | |
| 2.9 | Reenviar campanha funciona | |
| 2.10 | Editar campanha carrega os dados corretamente | |
| 2.11 | Ícones são todos do Tabler (não lucide-react) | |
| 2.12 | Responsivo em 375px e 1440px | |

---

## 3. Comunidades V2
**URL:** `/dashboard/comunidades/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 3.1 | Página carrega sem erro no console | |
| 3.2 | Stats cards aparecem (Total, Com líder, Sem líder, Eleitores vinculados) | |
| 3.3 | Tabs Todas/Com líder/Sem líder filtram corretamente | |
| 3.4 | Busca por nome/cidade/bairro funciona | |
| 3.5 | Lista de comunidades renderiza com ícone circular | |
| 3.6 | Clicar no card abre preview modal | |
| 3.7 | Preview mostra líder vinculado e total de eleitores | |
| 3.8 | Botões Ver/Editar/Excluir são sempre visíveis | |
| 3.9 | Nova comunidade abre dialog e salva | |
| 3.10 | Responsivo em 375px e 1440px | |

---

## 4. Documentos V2
**URL:** `/dashboard/documentos/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 4.1 | Página carrega sem erro no console | |
| 4.2 | Stats cards aparecem (Total, PDFs, Imagens, Planilhas) | |
| 4.3 | Tabs por tipo filtram corretamente | |
| 4.4 | Botão "Upload" abre seletor de arquivo | |
| 4.5 | Upload de PDF funciona e salva no Supabase Storage | |
| 4.6 | Upload de imagem funciona | |
| 4.7 | Documento aparece na lista após upload | |
| 4.8 | Download do documento funciona | |
| 4.9 | Preview de imagem mostra thumbnail | |
| 4.10 | Exclusão remove o documento do storage e da lista | |
| 4.11 | Erro de autenticação/RLS é tratado com mensagem clara | |
| 4.12 | Responsivo em 375px e 1440px | |

---

## 5. Tarefas V2
**URL:** `/dashboard/tarefas/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 5.1 | Página carrega sem erro no console | |
| 5.2 | Stats cards aparecem (Total, Pendentes, Em Andamento, Concluídas) | |
| 5.3 | Toggle Kanban / Lista funciona | |
| 5.4 | Kanban mostra colunas (Pendente, Em Andamento, Concluída) | |
| 5.5 | Drag-and-drop move tarefas entre colunas | |
| 5.6 | Visualização em lista mostra cards com prioridade | |
| 5.7 | Botões Editar/Excluir são sempre visíveis | |
| 5.8 | Nova tarefa abre dialog e salva | |
| 5.9 | Clicar no card abre preview modal | |
| 5.10 | Responsivo em 375px e 1440px | |

---

## 6. Proposições V2
**URL:** `/dashboard/proposicoes/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 6.1 | Página carrega sem erro no console | |
| 6.2 | Stats cards aparecem (Total, Em tramitação, Aprovadas, Rejeitadas) | |
| 6.3 | Tabs filtram por status | |
| 6.4 | Busca por título funciona | |
| 6.5 | Lista renderiza com tipo, autor e data | |
| 6.6 | Clicar no card abre preview modal | |
| 6.7 | Preview mostra grid de detalhes (número, ano, tipo, status) | |
| 6.8 | Botões Editar/Excluir são sempre visíveis | |
| 6.9 | Nova proposição abre dialog e salva | |
| 6.10 | Responsivo em 375px e 1440px | |

---

## 7. Produtividade V2
**URL:** `/dashboard/produtividade/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 7.1 | Página carrega sem erro no console | |
| 7.2 | Stats cards aparecem (Total, Aprovadas, Taxa de Aprovação, Em Tramitação) | |
| 7.3 | Gráfico "Proposições por Status" renderiza | |
| 7.4 | Gráfico "Proposições por Tipo" renderiza | |
| 7.5 | Gráfico "Proposições por Tema" renderiza | |
| 7.6 | Gráfico "Aprovados por Ano" renderiza | |
| 7.7 | Cores dos gráficos seguem o Design System | |
| 7.8 | Hover nos gráficos mostra tooltip | |
| 7.9 | Responsivo em 375px e 1440px | |

---

## 8. Enquetes V2
**URL:** `/dashboard/enquetes/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 8.1 | Página carrega sem erro no console | |
| 8.2 | Stats cards aparecem (Total, Publicadas, Encerradas, Rascunhos) | |
| 8.3 | Tabs Todas/Publicadas/Encerradas/Rascunhos filtram | |
| 8.4 | Lista de enquetes renderiza com badges de status e tipo | |
| 8.5 | Clicar no card abre preview modal | |
| 8.6 | Botões Resultados/Votar/Editar/Excluir são sempre visíveis | |
| 8.7 | "Resultados" abre dialog com gráfico de barras | |
| 8.8 | "Votar" abre dialog de resposta | |
| 8.9 | Nova enquete abre dialog e salva | |
| 8.10 | Responsivo em 375px e 1440px | |

---

## 9. Relatórios V2
**URL:** `/dashboard/relatorios/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 9.1 | Página carrega sem erro no console | |
| 9.2 | Abas Geral/Eleitores/Comunidades/Atendimentos funcionam | |
| 9.3 | Stats cards aparecem em cada aba | |
| 9.4 | Gráficos recharts renderizam sem erro | |
| 9.5 | Filtros de período atualizam os dados | |
| 9.6 | Exportar PDF funciona | |
| 9.7 | Exportar CSV funciona | |
| 9.8 | Responsivo em 375px e 1440px | |

---

## 10. Equipe V2
**URL:** `/dashboard/equipe/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 10.1 | Página carrega sem erro no console | |
| 10.2 | Stats cards aparecem (Total, Administradores, Editores, Ativos) | |
| 10.3 | Tabs Todos/Ativos/Inativos/Pendentes filtram | |
| 10.4 | Lista de membros renderiza com cargo e status | |
| 10.5 | Não há dropdown de 3 pontinhos (`MoreHorizontal`) | |
| 10.6 | Botões para alterar cargo são sempre visíveis | |
| 10.7 | Alterar cargo atualiza o membro | |
| 10.8 | Alterar status (ativo/inativo) funciona | |
| 10.9 | Convidar novo membro abre dialog e envia | |
| 10.10 | Excluir membro pede confirmação e remove | |
| 10.11 | Responsivo em 375px e 1440px | |

---

## 11. Configurações V2
**URL:** `/dashboard/configuracoes/teste-v2`

| # | Teste | Status |
|---|-------|--------|
| 11.1 | Página carrega sem erro no console | |
| 11.2 | Formulários de perfil/organização renderizam | |
| 11.3 | Consegue digitar e salvar alterações | |
| 11.4 | Upload de logo/avatar funciona (se aplicável) | |
| 11.5 | Mensagens de sucesso/erro aparecem | |
| 11.6 | Responsivo em 375px e 1440px | |

---

## Resumo Final

| Página | Status Geral | Aprovada para produção? |
|--------|--------------|-------------------------|
| Agenda V2 | | Sim / Não |
| Comunicação V2 | | Sim / Não |
| Comunidades V2 | | Sim / Não |
| Documentos V2 | | Sim / Não |
| Tarefas V2 | | Sim / Não |
| Proposições V2 | | Sim / Não |
| Produtividade V2 | | Sim / Não |
| Enquetes V2 | | Sim / Não |
| Relatórios V2 | | Sim / Não |
| Equipe V2 | | Sim / Não |
| Configurações V2 | | Sim / Não |

---

## Bugs encontrados

| Página | Descrição | Console / Erro | Severidade |
|--------|-----------|----------------|------------|
| | | | |

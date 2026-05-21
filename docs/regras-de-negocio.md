<!-- 20/05/2026 - Regras de negocio do dominio -->

# Regras de Negocio — Mandato Digital

## Glossario

| Termo | Definicao |
|-------|-----------|
| **Mandato** | Conjunto de dados e configuracoes de um parlamentar ou lideranca politica |
| **Owner** | Usuario dono do mandato (parlamentar) — isolamento multi-tenant |
| **Equipe** | Membros com acesso ao sistema (admin, editor, visualizador) |
| **Eleitor** | Cidadao cadastrado no sistema para acompanhamento/votacao |
| **Enquete** | Pesquisa de opiniao criada pela equipe para consultar eleitores |
| **Proposicao** | Projeto de lei, emenda, indicacao ou outro tipo de tramitacao legislativa |
| **CNEFE** | Cadastro Nacional de Enderecos para Fins Estatisticos (IBGE) |

---

## RN-001 — Permissoes da Equipe (RBAC)

| Campo | Valor |
|-------|-------|
| ID | RN-001 |
| Categoria | Permissao |
| Descricao | O sistema controla acesso por tres niveis de role |

**Regra:**

```
IF role == "admin"
    PODE: criar/editar/remover equipe, todas as operacoes
IF role == "editor"
    PODE: criar/editar enquetes, proposicoes, responder enquetes
    NAO PODE: gerenciar equipe (criar/remover membros)
IF role == "visualizador"
    PODE: visualizar dados, responder enquetes
    NAO PODE: criar, editar ou excluir nada
```

---

## RN-002 — Ciclo de Vida da Enquete

| Campo | Valor |
|-------|-------|
| ID | RN-002 |
| Categoria | Restricao + Automacao |

**Regra:**

```
IF status == "rascunho"
    PODE: editar titulo, descricao, opcoes, status
    NAO PODE: receber respostas

IF status == "publicada"
    PODE: receber respostas
    NAO PODE: editar opcoes (para nao invalidar votos existentes)

IF status == "encerrada"
    NAO PODE: receber novas respostas
    PODE: visualizar estatisticas

IF status == "arquivada"
    NAO PODE: nenhuma operacao (apenas leitura)
```

---

## RN-003 — Validacao de Voto na Enquete

| Campo | Valor |
|-------|-------|
| ID | RN-003 |
| Categoria | Validacao |

**Regra:**

```
IF enquete.status != "publicada"
    REJEITAR voto com erro "Enquete nao esta publicada"

IF opcao nao pertence a enquete
    REJEITAR voto com erro "Opcao invalida"

IF !enquete.permiteMultiplaEscolha AND opcoes.length > 1
    REJEITAR voto com erro "Esta enquete permite apenas uma opcao"

IF enquete.permiteMultiplaEscolha AND opcoes.length < 1
    REJEITAR voto com erro "Selecione pelo menos uma opcao"
```

---

## RN-004 — Multi-Tenancy (Isolamento por Mandato)

| Campo | Valor |
|-------|-------|
| ID | RN-004 |
| Categoria | Restricao |

**Regra:**

```
TODA query no banco DEVE filtrar por owner_id = ctx.user.ownerId
EXCECAO: tabela users (autenticacao global) e cnefe_enderecos (dados publicos IBGE)

VIOLACAO: retornar 404 NOT_FOUND (nao 403, para nao revelar existencia)
```

---

## RN-005 — Audit Log Obrigatorio

| Campo | Valor |
|-------|-------|
| ID | RN-005 |
| Categoria | Automacao |

**Regra:**

```
PARA toda operacao CREATE, UPDATE, DELETE:
    REGISTRAR em audit_logs:
        - user_id (quem fez)
        - action (create|update|delete)
        - table_name
        - record_id
        - old_data (JSONB, para update/delete)
        - new_data (JSONB, para create/update)
        - ip_address
        - user_agent
        - timestamp
```

---

## RN-006 — Proposicao — Status e Tramitacao

| Campo | Valor |
|-------|-------|
| ID | RN-006 |
| Categoria | Validacao |

**Regra:**

```
Status validos (ordem logica):
    em_elaboracao -> protocolado -> em_tramitacao -> em_comissao
        -> (aprovado | rejeitado | sancionado | veteado | retirado | arquivado)

CADA mudanca de status DEVE gerar registro em tramitacoes:
    - data, orgao, status, descricao
```

---

## RN-007 — CNEFE — Dados Imutaveis

| Campo | Valor |
|-------|-------|
| ID | RN-007 |
| Categoria | Restricao |

**Regra:**

```
Tabela cnefe_enderecos:
    - Dados importados do IBGE (fonte oficial)
    - NUNCA editar via aplicacao
    - NUNCA excluir
    - Permitido apenas: consulta e geocodificacao
```

---

## Tabela de Decisao — Acoes por Role

| Acao | Admin | Editor | Visualizador |
|------|:-----:|:------:|:------------:|
| Criar equipe | ✅ | ❌ | ❌ |
| Editar equipe | ✅ | ❌ | ❌ |
| Remover equipe | ✅ | ❌ | ❌ |
| Criar enquete | ✅ | ✅ | ❌ |
| Editar enquete (rascunho) | ✅ | ✅ | ❌ |
| Publicar enquete | ✅ | ✅ | ❌ |
| Responder enquete | ✅ | ✅ | ✅ |
| Criar proposicao | ✅ | ✅ | ❌ |
| Editar proposicao | ✅ | ✅ | ❌ |
| Visualizar relatorios | ✅ | ✅ | ✅ |
| Exportar dados | ✅ | ✅ | ❌ |
| Configurar geocodificacao | ✅ | ❌ | ❌ |

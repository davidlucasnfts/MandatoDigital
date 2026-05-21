<!-- 20/05/2026 - Diagrama ER do banco de dados -->

# Diagrama ER — Mandato Digital

```mermaid
erDiagram
    USERS {
        serial      id              PK
        varchar     union_id        UK
        varchar     name
        varchar     email
        text        avatar
        enum        role            "admin|editor|visualizador"
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_sign_in_at
    }

    EQUIPE {
        serial      id              PK
        uuid        user_id         FK
        uuid        owner_id        FK
        varchar     nome
        varchar     email
        varchar     cargo
        enum        role            "admin|editor|visualizador"
        enum        status          "ativo|inativo"
        timestamptz created_at
    }

    PROPOSICOES {
        uuid        id              PK
        uuid        owner_id        FK
        uuid        user_id         FK
        enum        tipo            "projeto_lei|emenda|indicacao|requerimento|parecer|mocao|decreto"
        varchar     numero
        integer     ano
        varchar     titulo
        text        ementa
        varchar     tema
        enum        status          "em_elaboracao|protocolado|em_tramitacao|em_comissao|aprovado|rejeitado|sancionado|arquivado|veteado|retirado"
        date        data_apresentacao
        date        data_aprovacao
        varchar     orgao_atual
        varchar     relator
        text        link_oficial
        text        observacoes
        timestamptz created_at
        timestamptz updated_at
    }

    TRAMITACOES {
        uuid        id              PK
        uuid        proposicao_id   FK
        uuid        owner_id        FK
        uuid        user_id         FK
        date        data
        varchar     orgao
        enum        status          "em_elaboracao|protocolado|em_tramitacao|em_comissao|aprovado|rejeitado|sancionado|arquivado|veteado|retirado"
        text        descricao
        timestamptz created_at
    }

    ENQUETES {
        uuid        id              PK
        uuid        owner_id        FK
        uuid        user_id         FK
        varchar     titulo
        text        descricao
        enum        status          "rascunho|publicada|encerrada|arquivada"
        date        data_publicacao
        date        data_encerramento
        integer     permite_multipla_escolha
        timestamptz created_at
        timestamptz updated_at
    }

    ENQUETE_OPCOES {
        uuid        id              PK
        uuid        enquete_id      FK
        uuid        owner_id        FK
        varchar     texto
        integer     ordem
        timestamptz created_at
    }

    ENQUETE_RESPOSTAS {
        uuid        id              PK
        uuid        enquete_id      FK
        uuid        opcao_id        FK
        uuid        owner_id        FK
        uuid        eleitor_id      FK "nullable"
        varchar     nome_respondente
        varchar     telefone_respondente
        text        observacao
        timestamptz created_at
    }

    CNEFE_ENDERECOS {
        serial      id              PK
        varchar     uf              "2 chars"
        varchar     codigo_municipio
        varchar     municipio
        varchar     bairro
        varchar     tipo_logradouro
        varchar     nome_logradouro
        varchar     numero
        varchar     cep
        text        latitude
        text        longitude
        integer     nivel_geocodificacao
        varchar     codigo_unico    UK
    }

    AUDIT_LOGS {
        uuid        id              PK
        uuid        user_id         FK "nullable"
        varchar     action          "create|update|delete"
        varchar     table_name
        text        record_id
        jsonb       old_data
        jsonb       new_data
        inet        ip_address
        text        user_agent
        timestamptz created_at
    }

    USERS ||--o{ EQUIPE : "pertence"
    USERS ||--o{ PROPOSICOES : "cria"
    USERS ||--o{ ENQUETES : "cria"
    PROPOSICOES ||--o{ TRAMITACOES : "possui"
    ENQUETES ||--o{ ENQUETE_OPCOES : "contem"
    ENQUETES ||--o{ ENQUETE_RESPOSTAS : "recebe"
    ENQUETE_OPCOES ||--o{ ENQUETE_RESPOSTAS : "recebe votos"
```

## Notas de Modelagem

- **Soft delete:** Nenhuma tabela tem soft delete explícito. `equipe.status` e `enquetes.status` funcionam como flags de ativação.
- **Multi-tenancy:** `owner_id` em quase todas as tabelas garante isolamento entre mandatos.
- **Audit trail:** `audit_logs` registra todas as operações CREATE/UPDATE/DELETE com JSONB do estado anterior e novo.
- **CNEFE:** Tabela independente, sem FKs — dados do IBGE importados em batch.

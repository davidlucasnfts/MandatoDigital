<!-- 20/05/2026 - Diagramas de estado das entidades -->

# Diagramas de Estado — Mandato Digital

## Enquete

```mermaid
stateDiagram-v2
    [*] --> Rascunho : criar enquete

    Rascunho --> Publicada : publicar
    Rascunho --> Arquivada : arquivar (sem publicar)

    Publicada --> Encerrada : encerrar (manual ou data)
    Publicada --> Arquivada : arquivar

    Encerrada --> Arquivada : arquivar
    Encerrada --> [*] : manter ativa para consulta

    Arquivada --> [*]

    note right of Rascunho
        Pode editar tudo:
        titulo, descricao, opcoes
    end note

    note right of Publicada
        Pode receber votos
        NAO pode editar opcoes
    end note

    note right of Encerrada
        Nao recebe mais votos
        Estatisticas disponiveis
    end note
```

**Transicoes invalidas:**
- `Publicada → Rascunho` (nao permitido — votos ja existem)
- `Encerrada → Publicada` (nao permitido — reabrir enquete)
- `Arquivada → qualquer` (nao permitido — estado final)

---

## Proposicao

```mermaid
stateDiagram-v2
    [*] --> EmElaboracao : criar proposicao

    EmElaboracao --> Protocolado : protocolar
    EmElaboracao --> Arquivado : arquivar (sem protocolar)
    EmElaboracao --> Retirado : retirar pelo autor

    Protocolado --> EmTramitacao : inicia tramitacao
    Protocolado --> Arquivado : arquivar

    EmTramitacao --> EmComissao : encaminhado a comissao
    EmTramitacao --> Aprovado : aprovado em plenario
    EmTramitacao --> Rejeitado : rejeitado em plenario
    EmTramitacao --> Arquivado : arquivar

    EmComissao --> Aprovado : aprovado na comissao
    EmComissao --> Rejeitado : rejeitado na comissao
    EmComissao --> EmTramitacao : retorna a tramitacao

    Aprovado --> Sancionado : sancionado pelo executivo
    Aprovado --> Veteado : vetado pelo executivo

    Veteado --> Aprovado : derrubada do veto
    Veteado --> Arquivado : mantido veto

    Sancionado --> [*]
    Rejeitado --> [*]
    Arquivado --> [*]
    Retirado --> [*]
```

**Transicoes invalidas:**
- `Sancionado → qualquer` (nao permitido — promulgada)
- `Rejeitado → Aprovado` (nao permitido — nova proposicao necessaria)
- `Arquivado → qualquer` (nao permitido — estado final)

---

## Membro da Equipe

```mermaid
stateDiagram-v2
    [*] --> Ativo : convidar/criar

    Ativo --> Inativo : desativar
    Inativo --> Ativo : reativar

    Ativo --> [*] : remover do sistema
    Inativo --> [*] : remover do sistema
```

---

## Resposta de Enquete (Voto)

```mermaid
stateDiagram-v2
    [*] --> Registrado : submeter voto

    Registrado --> [*] : permanente (sem edicao)
```

**Regra:** Votos sao imutaveis. Nao ha edicao ou exclusao.

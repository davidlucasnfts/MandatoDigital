# Roteiro de Migração: WAHA → Evolution API

> **Data:** 18/06/2026
> **Status:** Em andamento
> **Responsável:** David Lucas (via Kimi)

---

## 1. Instalação Evolution API na VPS

### Parar WAHA atual
```bash
# Parar container WAHA
docker stop waha
docker rm waha
```

### Instalar Evolution API (Docker)
```bash
# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://82.197.73.101:8080
      - AUTHENTICATION_API_KEY=mandato2026evolution
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:senha@localhost:5432/evolution
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - DATABASE_SAVE_MESSAGE_UPDATE=true
      - DATABASE_SAVE_DATA_CONTACTS=true
      - DATABASE_SAVE_DATA_CHATS=true
      - DATABASE_SAVE_DATA_LABELS=true
      - DATABASE_SAVE_DATA_HISTORIC=true
      - REDIS_ENABLED=false
      - WEBSOCKET_ENABLED=true
      - WEBSOCKET_GLOBAL_EVENTS=false
      - DETERMINISTIC_CONNECTION=true
    volumes:
      - evolution_instances:/evolution/instances

volumes:
  evolution_instances:
EOF

# Subir
docker-compose up -d
```

### Verificar instalação
```bash
curl http://82.197.73.101:8080
```

---

## 2. Mapeamento de Endpoints

| Operação | WAHA | Evolution |
|----------|------|-----------|
| Verificar status | `GET /api/sessions/default` | `GET /instance/connectionState/mandato` |
| Criar/iniciar | `POST /api/sessions/default/start` | `POST /instance/create` + `GET /instance/connect/mandato` |
| Buscar QR | `GET /api/default/auth/qr` | `GET /instance/connect/mandato` (retorna base64) |
| Desconectar | `POST /api/sessions/default/logout` | `DELETE /instance/logout/mandato` |
| Deletar | `DELETE /api/sessions/default` | `DELETE /instance/delete/mandato` |
| Enviar msg | `POST /api/sendText` | `POST /message/sendText/mandato` |

---

## 3. Mudanças no Código

### Backend (`api/whatsapp-router.ts`)
- Nova URL base: `http://82.197.73.101:8080`
- Nova API Key: `mandato2026evolution`
- Novos endpoints (ver tabela acima)
- Conceito: "instance" em vez de "session"
- Nome da instância: `mandato`

### Frontend (`src/hooks/useWhatsApp.ts`)
- Mesma interface pública (getSession, startSession, etc.)
- Internamente chama novos endpoints tRPC

### Componente (`src/components/WhatsAppStatusCard.tsx`)
- Mesmo fluxo visual
- QR Code agora vem como base64 direto (não precisa de fallback screenshot)

---

## 4. Variáveis de Ambiente (.env)

```
# Antes (WAHA)
WAHA_API_URL=http://82.197.73.101:8080
WAHA_API_KEY=f42531c9cc4f6a3fe8fe0660a55aba6945564bd77780ec3bfd31212f8286f95b

# Depois (Evolution)
EVOLUTION_API_URL=http://82.197.73.101:8080
EVOLUTION_API_KEY=mandato2026evolution
EVOLUTION_INSTANCE_NAME=mandato
```

---

## 5. Checklist de Validação

- [ ] Evolution API rodando na VPS
- [ ] Endpoint `/` retorna "Evolution API is running"
- [ ] Criar instância `mandato` funciona
- [ ] QR Code é gerado e retornado
- [ ] Conexão com celular funciona
- [ ] Envio de mensagem funciona
- [ ] Frontend mostra status corretamente
- [ ] TypeScript passa sem erros

---

## 6. Rollback (se necessário)

```bash
# Parar Evolution
docker-compose down

# Reinstalar WAHA (ver docs/HISTORICO-WAHA-INTEGRACAO.md)
docker run -d --name waha -p 8080:8080 ...
```

---

## Referências

- Evolution Docs: https://docs.evolutionfoundation.com.br
- Evolution GitHub: https://github.com/evolution-foundation/evolution-api
- Docker Hub: https://hub.docker.com/r/evoapicloud/evolution-api

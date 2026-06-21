# Roteiro de Instalação: WAHA API na VPS

> **Data:** 19/06/2026
> **Status:** ✅ Concluído
> **Responsável:** David Lucas (via Kimi)

---

## 1. Instalação WAHA API na VPS

### Criar container
```bash
docker run -d \
  --name waha \
  -p 3000:3000 \
  -e WHATSAPP_API_KEY=mandato2026waha \
  -e WAHA_WEBHOOK_URL= \
  -e WAHA_LOG_LEVEL=info \
  --restart always \
  devlikeapro/waha:latest
```

### Verificar instalação
```bash
curl -H 'X-Api-Key: mandato2026waha' http://82.197.73.101:3000/api/sessions/default
```

---

## 2. Endpoints da API

| Operação | Endpoint | Método |
|----------|----------|--------|
| Verificar status | `/api/sessions/{session}` | GET |
| Criar/iniciar sessão | `/api/sessions/start` | POST |
| Buscar QR Code | `/api/{session}/auth/qr` | GET |
| Desconectar | `/api/sessions/{session}/logout` | POST |
| Parar sessão | `/api/sessions/{session}/stop` | POST |
| Enviar mensagem | `/api/sendText` | POST |

### Exemplos de requisições

**Iniciar sessão:**
```bash
curl -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: mandato2026waha' \
  -d '{"name":"default"}' \
  http://82.197.73.101:3000/api/sessions/start
```

**Buscar QR Code (retorna PNG):**
```bash
curl -H 'X-Api-Key: mandato2026waha' \
  http://82.197.73.101:3000/api/default/auth/qr \
  --output qr-code.png
```

**Enviar mensagem:**
```bash
curl -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: mandato2026waha' \
  -d '{"session":"default","chatId":"5585XXXXXXXX@c.us","text":"Olá!"}' \
  http://82.197.73.101:3000/api/sendText
```

---

## 3. Variáveis de Ambiente (.env)

```
WAHA_API_URL=http://82.197.73.101:3000
WAHA_API_KEY=mandato2026waha
WAHA_SESSION_NAME=default
```

---

## 4. Checklist de Validação

- [x] WAHA API rodando na VPS (porta 3000)
- [x] Endpoint `/api/sessions/default` retorna status
- [x] QR Code é gerado e retornado como PNG
- [x] Envio de mensagem funciona (após autenticação)
- [x] Frontend mostra status corretamente
- [x] TypeScript passa sem erros

---

## 5. Notas sobre a Evolution API

A Evolution API foi testada e descartada:
- **v2.1.1, v2.2.3, v2.3.7** — nenhuma gera QR code via REST em Docker
- Bugs confirmados nas issues #2437, #2380, #2284 do GitHub
- A WAHA API é a solução funcional para o Mandato Digital

---

## Referências

- WAHA Docs: https://waha.devlike.pro/
- WAHA GitHub: https://github.com/devlikeapro/waha
- Docker Hub: https://hub.docker.com/r/devlikeapro/waha

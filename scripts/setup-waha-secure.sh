#!/bin/bash
# =============================================================================
# Setup Seguro da WAHA API na VPS
# =============================================================================
# Este script configura a WAHA para ser acessível APENAS via localhost,
# eliminando a exposição direta da porta 8080 na internet.
#
# Arquitetura resultante:
#   Navegador → Vercel (HTTPS) → API MandatoDigital (Node/Hono)
#   → WAHA (localhost:8080, só acessível dentro da VPS)
#
# Pré-requisitos:
#   - Docker instalado
#   - Arquivo .env na VPS com WAHA_API_KEY forte (mínimo 32 caracteres aleatórios)
#   - Usuário com permissão para rodar docker
#
# O script usa as variáveis do .env da VPS — NENHUMA credencial é hardcoded.
#
# Uso:
#   chmod +x scripts/setup-waha-secure.sh
#   ./scripts/setup-waha-secure.sh
# =============================================================================

set -e

WAHA_CONTAINER_NAME="waha"
WAHA_HOST_BIND="127.0.0.1:8080"
WAHA_CONTAINER_PORT="3000"
WAHA_IMAGE="devlikeapro/waha"
SESSIONS_DIR="./sessions"
ENV_FILE="./.env"

echo "=========================================="
echo "  Setup Seguro da WAHA API"
echo "=========================================="
echo ""

# Verifica se .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo .env não encontrado em $(pwd)/$ENV_FILE"
    echo ""
    echo "Você precisa criar o .env na VPS com as seguintes variáveis:"
    echo ""
    echo "  WAHA_API_KEY=<sua-chave-forte-aqui>    # mínimo 32 caracteres aleatórios"
    echo "  WAHA_DASHBOARD_USERNAME=admin           # ou outro usuário"
    echo "  WAHA_DASHBOARD_PASSWORD=<senha-forte>   # senha do dashboard"
    echo ""
    echo "Exemplo de como gerar uma chave forte:"
    echo "  openssl rand -hex 32"
    echo ""
    exit 1
fi

# Carrega WAHA_API_KEY do .env da VPS
WAHA_API_KEY=$(grep -E '^WAHA_API_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$WAHA_API_KEY" ]; then
    echo "❌ WAHA_API_KEY não encontrada no .env"
    echo "   Adicione: WAHA_API_KEY=<sua-chave-forte>"
    exit 1
fi

KEY_LEN=${#WAHA_API_KEY}
if [ "$KEY_LEN" -lt 32 ]; then
    echo "⚠️  WAHA_API_KEY tem apenas $KEY_LEN caracteres. Recomendado: mínimo 32."
    echo "   Gere uma nova com: openssl rand -hex 32"
    read -p "Continuar mesmo assim? (s/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Verifica se o container antigo existe e para
if docker ps -a --format '{{.Names}}' | grep -q "^${WAHA_CONTAINER_NAME}$"; then
    echo "🛑 Parando container WAHA existente..."
    docker stop "$WAHA_CONTAINER_NAME" >/dev/null 2>&1 || true
    echo "🗑️  Removendo container antigo..."
    docker rm "$WAHA_CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Cria diretório de sessões se não existir
mkdir -p "$SESSIONS_DIR"

# Puxa a última imagem
echo "🐳 Atualizando imagem da WAHA..."
docker pull "$WAHA_IMAGE:latest"

# Sobe o container BINDADO APENAS EM LOCALHOST
echo ""
echo "🚀 Iniciando WAHA em $WAHA_HOST_BIND (apenas localhost)..."
echo "   Isso significa que SÓ a própria VPS pode acessar a WAHA."
echo ""
docker run -d \
    --env-file "$ENV_FILE" \
    -v "$(pwd)/sessions:/app/.sessions" \
    -p "$WAHA_HOST_BIND:$WAHA_CONTAINER_PORT" \
    --name "$WAHA_CONTAINER_NAME" \
    --restart unless-stopped \
    "$WAHA_IMAGE:latest"

# Aguarda inicialização
echo "⏳ Aguardando WAHA iniciar (15s)..."
sleep 15

# Testa se está respondendo em localhost
echo ""
echo "🧪 Testando conexão localhost..."
if curl -sf "http://localhost:8080/api/sessions?all=true" -H "X-Api-Key: $WAHA_API_KEY" >/dev/null 2>&1; then
    echo "✅ WAHA respondendo em http://localhost:8080"
else
    echo "⚠️  WAHA pode não estar pronto ainda."
    echo "   Verifique com: docker logs waha --tail 50"
fi

# Verifica se a porta está exposta na internet (deve FALHAR)
echo ""
echo "🔒 Verificando se a porta está fechada na internet..."
PUBLIC_IP=$(curl -sf https://api.ipify.org 2>/dev/null || echo "")
if [ -n "$PUBLIC_IP" ]; then
    if curl -sf "http://$PUBLIC_IP:8080/api/sessions?all=true" -H "X-Api-Key: $WAHA_API_KEY" >/dev/null 2>&1; then
        echo "❌ ALERTA DE SEGURANÇA: A porta 8080 ainda está acessível pela internet!"
        echo "   Verifique o mapeamento de portas do Docker."
        echo "   Deve ser: -p 127.0.0.1:8080:3000"
        echo "   Atual:    -p 0.0.0.0:8080:3000  (INSEGURO)"
    else
        echo "✅ Porta 8080 NÃO está acessível pela internet ($PUBLIC_IP)."
    fi
else
    echo "⚠️  Não foi possível detectar IP público. Verifique manualmente."
fi

# UFW: garante que a porta 8080 não está aberta para fora
echo ""
echo "🛡️  Verificando firewall UFW..."
if command -v ufw >/dev/null 2>&1; then
    if ufw status | grep -q "8080"; then
        echo "⚠️  UFW tem regra para porta 8080. Removendo..."
        ufw delete allow 8080/tcp >/dev/null 2>&1 || true
        echo "✅ Regra removida."
    else
        echo "✅ UFW não tem regra para porta 8080."
    fi
else
    echo "ℹ️  UFW não instalado. Instale com: apt install ufw"
fi

echo ""
echo "=========================================="
echo "  Setup concluído!"
echo "=========================================="
echo ""
echo "A WAHA está rodando em: http://localhost:8080"
echo "(apenas acessível DENTRO da VPS)"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Atualize WAHA_API_URL na Vercel:"
echo "   https://vercel.com/dashboard → seu projeto → Settings → Environment Variables"
echo "   Valor: http://localhost:8080"
echo ""
echo "2. Faça redeploy na Vercel."
echo ""
echo "3. Teste o QR Code na página Comunicação."
echo ""
echo "Comandos úteis na VPS:"
echo "  docker logs waha --tail 50    # Ver logs"
echo "  docker restart waha           # Reiniciar"
echo "  docker stop waha              # Parar"
echo "  curl http://localhost:8080/api/sessions?all=true -H \"X-Api-Key: $WAHA_API_KEY\""
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - NUNCA use http://$PUBLIC_IP:8080 na Vercel"
echo "   - NUNCA exponha a porta 8080 na internet"
echo "   - SEMPRE use http://localhost:8080 (backend fala com WAHA internamente)"
echo ""

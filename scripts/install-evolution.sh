#!/bin/bash
# ============================================================
# Script de Instalação — Evolution API na VPS
# Copie este arquivo para a VPS e execute: bash install-evolution.sh
# ============================================================

set -e

echo "=========================================="
echo "  Instalador Evolution API — MandatoDigital"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    echo "Instale o Docker primeiro:"
    echo "  curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado!${NC}"
    echo "Instale o Docker Compose:"
    echo "  apt-get install docker-compose-plugin"
    exit 1
fi

echo -e "${GREEN}✅ Docker encontrado${NC}"

# Parar WAHA antiga se existir
echo ""
echo "→ Verificando WAHA antiga..."
if docker ps -a --format '{{.Names}}' | grep -q "^waha$"; then
    echo "  Parando container WAHA..."
    docker stop waha 2>/dev/null || true
    docker rm waha 2>/dev/null || true
    echo -e "${GREEN}  ✅ WAHA removida${NC}"
else
    echo "  WAHA não encontrada (ok)"
fi

# Verificar se Evolution já existe
echo ""
echo "→ Verificando Evolution API..."
if docker ps -a --format '{{.Names}}' | grep -q "^evolution-api$"; then
    echo -e "${YELLOW}⚠️  Evolution já existe. Parando...${NC}"
    docker stop evolution-api 2>/dev/null || true
    docker rm evolution-api 2>/dev/null || true
fi

# Criar diretório de trabalho
mkdir -p ~/evolution-api
cd ~/evolution-api

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://82.197.73.101:8080
      - AUTHENTICATION_API_KEY=mandato2026evolution
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:Mandato2026SeguroXYZ@localhost:5432/evolution?schema=public
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
      - LOG_LEVEL=info
      - LOG_COLOR=true
    volumes:
      - evolution_instances:/evolution/instances
      - evolution_data:/evolution/data
    networks:
      - evolution-network

volumes:
  evolution_instances:
  evolution_data:

networks:
  evolution-network:
    driver: bridge
EOF

echo -e "${GREEN}✅ docker-compose.yml criado${NC}"

# Baixar imagem
echo ""
echo "→ Baixando imagem Evolution API (pode demorar 2-3 min)..."
docker-compose pull

# Subir container
echo ""
echo "→ Iniciando Evolution API..."
docker-compose up -d

# Aguardar inicialização
echo ""
echo "→ Aguardando inicialização (15s)..."
sleep 15

# Verificar se subiu
echo ""
echo "→ Verificando status..."
if docker ps --format '{{.Names}}' | grep -q "^evolution-api$"; then
    echo -e "${GREEN}✅ Evolution API está rodando!${NC}"
    echo ""
    echo "Testando endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✅ Endpoint responde (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Endpoint retornou HTTP $HTTP_CODE (pode estar iniciando ainda)${NC}"
    fi
else
    echo -e "${RED}❌ Evolution API não iniciou. Verifique logs:${NC}"
    echo "  docker logs evolution-api"
    exit 1
fi

# Mostrar logs
echo ""
echo "=========================================="
echo "  Instalação concluída!"
echo "=========================================="
echo ""
echo "URL: http://82.197.73.101:8080"
echo "API Key: mandato2026evolution"
echo "Instance: mandato"
echo ""
echo "Comandos úteis:"
echo "  docker logs -f evolution-api    # Ver logs em tempo real"
echo "  docker-compose down               # Parar"
echo "  docker-compose up -d              # Iniciar"
echo ""
echo -e "${YELLOW}Próximo passo: Configurar env vars na Vercel${NC}"

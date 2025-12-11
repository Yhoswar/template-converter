#!/bin/bash

# Script de prueba de la API
# Ejecutar: bash test-api.sh

set -e  # Salir si hay error

API_URL="http://localhost:3001"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   PRUEBA AUTOMÁTICA DE LA API                ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Verificar que jq está instalado
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq no está instalado. Instalando...${NC}"
    # Intenta instalar jq según el sistema
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install jq -y
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    fi
fi

# 1. Health Check
echo -e "${BLUE}[1/7]${NC} Verificando health check..."
HEALTH=$(curl -s -X GET "$API_URL/api/health")
STATUS=$(echo $HEALTH | jq -r '.success')

if [ "$STATUS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Servidor funcionando correctamente"
else
    echo -e "${RED}✗${NC} Servidor no responde"
    exit 1
fi
echo ""

# 2. Ver sesiones activas
echo -e "${BLUE}[2/7]${NC} Consultando sesiones activas..."
SESSIONS=$(curl -s -X GET "$API_URL/api/sessions")
TOTAL=$(echo $SESSIONS | jq -r '.data.total')
echo -e "${GREEN}✓${NC} Sesiones activas: $TOTAL"
echo ""

# Crear datos de prueba si no existen
TEST_DIR="./test-data"
if [ ! -d "$TEST_DIR" ]; then
    echo -e "${YELLOW}⚠️  Creando datos de prueba...${NC}"
    mkdir -p "$TEST_DIR"
    
    # Crear un ZIP de prueba simple
    mkdir -p "$TEST_DIR/template"
    cat > "$TEST_DIR/template/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Template de Prueba</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>
    <header>
        <h1>Header de Prueba</h1>
    </header>
    <nav>
        <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/contacto">Contacto</a></li>
        </ul>
    </nav>
    <main>
        <h2>Contenido Principal</h2>
        <p>Este es un template de prueba.</p>
    </main>
    <footer>
        <p>&copy; 2024 Test</p>
    </footer>
    <script src="./js/main.js"></script>
</body>
</html>
EOF

    mkdir -p "$TEST_DIR/template/css"
    echo "body { font-family: Arial; }" > "$TEST_DIR/template/css/style.css"
    
    mkdir -p "$TEST_DIR/template/js"
    echo "console.log('Test');" > "$TEST_DIR/template/js/main.js"
    
    mkdir -p "$TEST_DIR/template/images"
    
    # Crear ZIP
    (cd "$TEST_DIR/template" && zip -r ../template.zip . > /dev/null 2>&1)
    echo -e "${GREEN}✓${NC} ZIP de prueba creado"
    
    # Crear menu.txt de prueba
    cat > "$TEST_DIR/menu.txt" << 'EOF'
Inicio (SEO: Página de inicio de prueba)
Contacto (SEO: Página de contacto)
EOF
    echo -e "${GREEN}✓${NC} menu.txt de prueba creado"
fi
echo ""

# 3. Upload
echo -e "${BLUE}[3/7]${NC} Subiendo template y configuración..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/upload" \
  -F "template=@$TEST_DIR/template.zip" \
  -F 'config={
    "nombreComercial": "Prueba Test",
    "dominio": "prueba-test.com",
    "emailContacto": "test@prueba.com",
    "telefono": "123456789",
    "idiomaPreferente": "es",
    "idiomaSecundario": "",
    "nombreCarpetaProyecto": "Web_PruebaTest",
    "nombreCarpetaAssets": "assets-prueba"
  }')

SESSION_ID=$(echo $UPLOAD_RESPONSE | jq -r '.sessionId')
UPLOAD_SUCCESS=$(echo $UPLOAD_RESPONSE | jq -r '.success')

if [ "$UPLOAD_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Upload exitoso"
    echo -e "   Session ID: ${YELLOW}$SESSION_ID${NC}"
    HTML_FILES=$(echo $UPLOAD_RESPONSE | jq -r '.data.totalHtmlFiles')
    echo -e "   Archivos HTML encontrados: $HTML_FILES"
else
    echo -e "${RED}✗${NC} Error en upload"
    echo $UPLOAD_RESPONSE | jq
    exit 1
fi
echo ""

# 4. Analyze
echo -e "${BLUE}[4/7]${NC} Analizando template y menu.txt..."
ANALYZE_RESPONSE=$(curl -s -X POST "$API_URL/api/analyze?sessionId=$SESSION_ID" \
  -F "menu=@$TEST_DIR/menu.txt" \
  -F "useClaudeAPI=false")

ANALYZE_SUCCESS=$(echo $ANALYZE_RESPONSE | jq -r '.success')

if [ "$ANALYZE_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Análisis completado"
    TOTAL_PAGES=$(echo $ANALYZE_RESPONSE | jq -r '.data.menuStructure.totalPages')
    echo -e "   Páginas detectadas: $TOTAL_PAGES"
    DETECTION_METHOD=$(echo $ANALYZE_RESPONSE | jq -r '.data.detectionMethod')
    echo -e "   Método de detección: $DETECTION_METHOD"
else
    echo -e "${RED}✗${NC} Error en análisis"
    echo $ANALYZE_RESPONSE | jq
    exit 1
fi
echo ""

# 5. Mapping
echo -e "${BLUE}[5/7]${NC} Validando mapeo de páginas..."
MAPPING_RESPONSE=$(curl -s -X POST "$API_URL/api/mapping?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mapping": {
      "inicio": "index.html"
    }
  }')

MAPPING_SUCCESS=$(echo $MAPPING_RESPONSE | jq -r '.success')

if [ "$MAPPING_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Mapeo validado"
    TOTAL_MAPPED=$(echo $MAPPING_RESPONSE | jq -r '.data.totalMapped')
    echo -e "   Páginas mapeadas: $TOTAL_MAPPED"
else
    echo -e "${RED}✗${NC} Error en mapeo"
    echo $MAPPING_RESPONSE | jq
    exit 1
fi
echo ""

# 6. Generate
echo -e "${BLUE}[6/7]${NC} Generando proyecto PHP..."
GENERATE_RESPONSE=$(curl -s -X POST "$API_URL/api/generate?sessionId=$SESSION_ID")

GENERATE_SUCCESS=$(echo $GENERATE_RESPONSE | jq -r '.success')

if [ "$GENERATE_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Proyecto generado exitosamente"
    PROJECT_NAME=$(echo $GENERATE_RESPONSE | jq -r '.data.projectName')
    TOTAL_PHP=$(echo $GENERATE_RESPONSE | jq -r '.data.totalPhpFiles')
    ZIP_SIZE=$(echo $GENERATE_RESPONSE | jq -r '.data.zipSize')
    echo -e "   Proyecto: ${YELLOW}$PROJECT_NAME${NC}"
    echo -e "   Archivos PHP: $TOTAL_PHP"
    echo -e "   Tamaño ZIP: $ZIP_SIZE"
else
    echo -e "${RED}✗${NC} Error generando proyecto"
    echo $GENERATE_RESPONSE | jq
    exit 1
fi
echo ""

# 7. Download
echo -e "${BLUE}[7/7]${NC} Descargando ZIP generado..."
DOWNLOAD_FILE="./generated_test_$SESSION_ID.zip"
curl -s -X GET "$API_URL/api/download/$SESSION_ID" -o "$DOWNLOAD_FILE"

if [ -f "$DOWNLOAD_FILE" ]; then
    FILE_SIZE=$(ls -lh "$DOWNLOAD_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓${NC} ZIP descargado correctamente"
    echo -e "   Archivo: ${YELLOW}$DOWNLOAD_FILE${NC}"
    echo -e "   Tamaño: $FILE_SIZE"
else
    echo -e "${RED}✗${NC} Error descargando ZIP"
    exit 1
fi
echo ""

# Verificar status
echo -e "${BLUE}[+]${NC} Verificando estado final..."
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/api/status/$SESSION_ID")
FINAL_STATUS=$(echo $STATUS_RESPONSE | jq -r '.data.status')
echo -e "${GREEN}✓${NC} Estado de sesión: ${YELLOW}$FINAL_STATUS${NC}"
echo ""

# Cleanup (opcional)
echo -e "${YELLOW}¿Limpiar sesión de prueba? (y/n)${NC}"
read -t 10 -n 1 CLEANUP_CHOICE || CLEANUP_CHOICE="n"
echo ""

if [ "$CLEANUP_CHOICE" == "y" ] || [ "$CLEANUP_CHOICE" == "Y" ]; then
    echo -e "${BLUE}[+]${NC} Limpiando sesión..."
    CLEANUP_RESPONSE=$(curl -s -X DELETE "$API_URL/api/status/$SESSION_ID")
    echo -e "${GREEN}✓${NC} Sesión limpiada"
else
    echo -e "${YELLOW}⚠️${NC}  Sesión mantenida. Para limpiar manualmente:"
    echo -e "   ${BLUE}curl -X DELETE $API_URL/api/status/$SESSION_ID${NC}"
fi
echo ""

# Resumen final
echo "╔═══════════════════════════════════════════════╗"
echo "║   PRUEBA COMPLETADA EXITOSAMENTE ✓           ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo -e "Resultados:"
echo -e "  ${GREEN}✓${NC} Upload"
echo -e "  ${GREEN}✓${NC} Analyze"
echo -e "  ${GREEN}✓${NC} Mapping"
echo -e "  ${GREEN}✓${NC} Generate"
echo -e "  ${GREEN}✓${NC} Download"
echo ""
echo -e "Archivos generados:"
echo -e "  - ${YELLOW}$DOWNLOAD_FILE${NC}"
echo ""
echo -e "Session ID: ${YELLOW}$SESSION_ID${NC}"
echo ""
echo "Para descomprimir el ZIP:"
echo -e "  ${BLUE}unzip $DOWNLOAD_FILE -d ./proyecto_generado${NC}"
echo ""

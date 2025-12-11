# Script de prueba de la API para Windows PowerShell
# Ejecutar: .\test-api.ps1

$API_URL = "http://localhost:3001"
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PRUEBA AUTOMÁTICA DE LA API (PowerShell)   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "[1/7] " -NoNewline -ForegroundColor Blue
Write-Host "Verificando health check..."

try {
    $health = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get
    if ($health.success -eq $true) {
        Write-Host "✓ Servidor funcionando correctamente" -ForegroundColor Green
    } else {
        Write-Host "✗ Servidor no responde correctamente" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error conectando al servidor: $_" -ForegroundColor Red
    Write-Host "Asegurate de que el servidor está corriendo en $API_URL" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 2. Ver sesiones activas
Write-Host "[2/7] " -NoNewline -ForegroundColor Blue
Write-Host "Consultando sesiones activas..."

try {
    $sessions = Invoke-RestMethod -Uri "$API_URL/api/sessions" -Method Get
    $total = $sessions.data.total
    Write-Host "✓ Sesiones activas: $total" -ForegroundColor Green
} catch {
    Write-Host "✗ Error consultando sesiones: $_" -ForegroundColor Red
}
Write-Host ""

# Crear datos de prueba si no existen
$TEST_DIR = ".\test-data"
if (-not (Test-Path $TEST_DIR)) {
    Write-Host "⚠️  Creando datos de prueba..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $TEST_DIR -Force | Out-Null
    
    # Crear estructura de template
    New-Item -ItemType Directory -Path "$TEST_DIR\template" -Force | Out-Null
    
    # Crear index.html
    $indexHtml = @"
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
"@
    $indexHtml | Out-File -FilePath "$TEST_DIR\template\index.html" -Encoding UTF8
    
    # Crear CSS
    New-Item -ItemType Directory -Path "$TEST_DIR\template\css" -Force | Out-Null
    "body { font-family: Arial; }" | Out-File -FilePath "$TEST_DIR\template\css\style.css" -Encoding UTF8
    
    # Crear JS
    New-Item -ItemType Directory -Path "$TEST_DIR\template\js" -Force | Out-Null
    "console.log('Test');" | Out-File -FilePath "$TEST_DIR\template\js\main.js" -Encoding UTF8
    
    # Crear carpeta images
    New-Item -ItemType Directory -Path "$TEST_DIR\template\images" -Force | Out-Null
    
    # Crear ZIP
    Compress-Archive -Path "$TEST_DIR\template\*" -DestinationPath "$TEST_DIR\template.zip" -Force
    Write-Host "✓ ZIP de prueba creado" -ForegroundColor Green
    
    # Crear menu.txt
    $menuTxt = @"
Inicio (SEO: Página de inicio de prueba)
Contacto (SEO: Página de contacto)
"@
    $menuTxt | Out-File -FilePath "$TEST_DIR\menu.txt" -Encoding UTF8
    Write-Host "✓ menu.txt de prueba creado" -ForegroundColor Green
}
Write-Host ""

# 3. Upload
Write-Host "[3/7] " -NoNewline -ForegroundColor Blue
Write-Host "Subiendo template y configuración..."

try {
    $templatePath = Resolve-Path "$TEST_DIR\template.zip"
    $configJson = @{
        nombreComercial = "Prueba Test"
        dominio = "prueba-test.com"
        emailContacto = "test@prueba.com"
        telefono = "123456789"
        idiomaPreferente = "es"
        idiomaSecundario = ""
        nombreCarpetaProyecto = "Web_PruebaTest"
        nombreCarpetaAssets = "assets-prueba"
    } | ConvertTo-Json -Compress
    
    $form = @{
        template = Get-Item -Path $templatePath
        config = $configJson
    }
    
    $uploadResponse = Invoke-RestMethod -Uri "$API_URL/api/upload" -Method Post -Form $form
    
    if ($uploadResponse.success -eq $true) {
        $SESSION_ID = $uploadResponse.sessionId
        Write-Host "✓ Upload exitoso" -ForegroundColor Green
        Write-Host "   Session ID: " -NoNewline
        Write-Host "$SESSION_ID" -ForegroundColor Yellow
        $htmlFiles = $uploadResponse.data.totalHtmlFiles
        Write-Host "   Archivos HTML encontrados: $htmlFiles"
    } else {
        Write-Host "✗ Error en upload" -ForegroundColor Red
        $uploadResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "✗ Error en upload: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Analyze
Write-Host "[4/7] " -NoNewline -ForegroundColor Blue
Write-Host "Analizando template y menu.txt..."

try {
    $menuPath = Resolve-Path "$TEST_DIR\menu.txt"
    $form = @{
        menu = Get-Item -Path $menuPath
        useClaudeAPI = "false"
    }
    
    $analyzeResponse = Invoke-RestMethod -Uri "$API_URL/api/analyze?sessionId=$SESSION_ID" -Method Post -Form $form
    
    if ($analyzeResponse.success -eq $true) {
        Write-Host "✓ Análisis completado" -ForegroundColor Green
        $totalPages = $analyzeResponse.data.menuStructure.totalPages
        Write-Host "   Páginas detectadas: $totalPages"
        $detectionMethod = $analyzeResponse.data.detectionMethod
        Write-Host "   Método de detección: $detectionMethod"
    } else {
        Write-Host "✗ Error en análisis" -ForegroundColor Red
        $analyzeResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "✗ Error en análisis: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Mapping
Write-Host "[5/7] " -NoNewline -ForegroundColor Blue
Write-Host "Validando mapeo de páginas..."

try {
    $mappingBody = @{
        mapping = @{
            inicio = "index.html"
        }
    } | ConvertTo-Json
    
    $mappingResponse = Invoke-RestMethod -Uri "$API_URL/api/mapping?sessionId=$SESSION_ID" -Method Post -Body $mappingBody -ContentType "application/json"
    
    if ($mappingResponse.success -eq $true) {
        Write-Host "✓ Mapeo validado" -ForegroundColor Green
        $totalMapped = $mappingResponse.data.totalMapped
        Write-Host "   Páginas mapeadas: $totalMapped"
    } else {
        Write-Host "✗ Error en mapeo" -ForegroundColor Red
        $mappingResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "✗ Error en mapeo: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Generate
Write-Host "[6/7] " -NoNewline -ForegroundColor Blue
Write-Host "Generando proyecto PHP..."

try {
    $generateResponse = Invoke-RestMethod -Uri "$API_URL/api/generate?sessionId=$SESSION_ID" -Method Post
    
    if ($generateResponse.success -eq $true) {
        Write-Host "✓ Proyecto generado exitosamente" -ForegroundColor Green
        $projectName = $generateResponse.data.projectName
        $totalPhp = $generateResponse.data.totalPhpFiles
        $zipSize = $generateResponse.data.zipSize
        Write-Host "   Proyecto: " -NoNewline
        Write-Host "$projectName" -ForegroundColor Yellow
        Write-Host "   Archivos PHP: $totalPhp"
        Write-Host "   Tamaño ZIP: $zipSize"
    } else {
        Write-Host "✗ Error generando proyecto" -ForegroundColor Red
        $generateResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "✗ Error generando proyecto: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Download
Write-Host "[7/7] " -NoNewline -ForegroundColor Blue
Write-Host "Descargando ZIP generado..."

try {
    $downloadFile = ".\generated_test_$SESSION_ID.zip"
    Invoke-WebRequest -Uri "$API_URL/api/download/$SESSION_ID" -OutFile $downloadFile
    
    if (Test-Path $downloadFile) {
        $fileSize = (Get-Item $downloadFile).Length
        $fileSizeFormatted = "{0:N2} MB" -f ($fileSize / 1MB)
        Write-Host "✓ ZIP descargado correctamente" -ForegroundColor Green
        Write-Host "   Archivo: " -NoNewline
        Write-Host "$downloadFile" -ForegroundColor Yellow
        Write-Host "   Tamaño: $fileSizeFormatted"
    } else {
        Write-Host "✗ Error descargando ZIP" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error descargando ZIP: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar status
Write-Host "[+] " -NoNewline -ForegroundColor Blue
Write-Host "Verificando estado final..."

try {
    $statusResponse = Invoke-RestMethod -Uri "$API_URL/api/status/$SESSION_ID" -Method Get
    $finalStatus = $statusResponse.data.status
    Write-Host "✓ Estado de sesión: " -NoNewline -ForegroundColor Green
    Write-Host "$finalStatus" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️  No se pudo verificar estado" -ForegroundColor Yellow
}
Write-Host ""

# Cleanup (opcional)
Write-Host "¿Limpiar sesión de prueba? (S/N): " -NoNewline -ForegroundColor Yellow
$cleanupChoice = Read-Host

if ($cleanupChoice -eq "S" -or $cleanupChoice -eq "s") {
    Write-Host "[+] " -NoNewline -ForegroundColor Blue
    Write-Host "Limpiando sesión..."
    try {
        $cleanupResponse = Invoke-RestMethod -Uri "$API_URL/api/status/$SESSION_ID" -Method Delete
        Write-Host "✓ Sesión limpiada" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error limpiando sesión" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Sesión mantenida. Para limpiar manualmente:" -ForegroundColor Yellow
    Write-Host "   Invoke-RestMethod -Uri '$API_URL/api/status/$SESSION_ID' -Method Delete" -ForegroundColor Blue
}
Write-Host ""

# Resumen final
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   PRUEBA COMPLETADA EXITOSAMENTE ✓           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Resultados:" -ForegroundColor Cyan
Write-Host "  ✓ Upload" -ForegroundColor Green
Write-Host "  ✓ Analyze" -ForegroundColor Green
Write-Host "  ✓ Mapping" -ForegroundColor Green
Write-Host "  ✓ Generate" -ForegroundColor Green
Write-Host "  ✓ Download" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos generados:" -ForegroundColor Cyan
Write-Host "  - $downloadFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Session ID: " -NoNewline -ForegroundColor Cyan
Write-Host "$SESSION_ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para descomprimir el ZIP:" -ForegroundColor Cyan
Write-Host "  Expand-Archive -Path '$downloadFile' -DestinationPath '.\proyecto_generado'" -ForegroundColor Blue
Write-Host ""

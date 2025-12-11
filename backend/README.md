# 🚀 Template Converter - Backend

Backend del sistema de conversión automática de plantillas HTML a PHP.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- API Key de Anthropic (Claude)

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env` y añade tu API Key de Claude:

```env
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui
```

**¿Dónde conseguir la API Key?**
1. Ve a: https://console.anthropic.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Crea una nueva key y cópiala

### 3. Verificar estructura de carpetas

Asegúrate de que existen estas carpetas:

```
backend/
├── routes/
├── services/
├── utils/
├── templates/
│   └── php-templates/
├── temp/
└── output/
```

Si falta alguna, créala manualmente.

## ▶️ Ejecutar el Servidor

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor se iniciará en: **http://localhost:3001**

## ✅ Verificar que funciona

Abre tu navegador o usa curl:

```bash
curl http://localhost:3001/health
```

Deberías ver:

```json
{
  "status": "ok",
  "timestamp": "2024-12-01T12:00:00.000Z",
  "service": "Template Converter Backend"
}
```

## 📁 Estructura del Proyecto

```
backend/
├── server.js                  # Punto de entrada principal
├── package.json              # Dependencias y scripts
├── .env                      # Variables de entorno (NO subir a git)
├── .gitignore               # Archivos a ignorar en git
├── routes/                  # Endpoints de la API
├── services/                # Lógica de negocio
│   ├── claudeAPI.js        # Integración con Claude
│   ├── htmlParser.js       # Parsing de HTML
│   ├── menuParser.js       # Parsing de menu.txt
│   └── ...
├── utils/                   # Utilidades y helpers
│   ├── validators.js       # Validaciones
│   ├── slugify.js         # Normalización URLs
│   └── ...
├── templates/              # Templates base de PHP
│   └── php-templates/
├── temp/                   # Archivos temporales (auto-limpieza)
└── output/                 # ZIPs generados para descarga
```

## 🔌 Endpoints de la API

### Health Check
```
GET /health
```
Verifica que el servidor está funcionando.

### Próximos endpoints (a implementar):
- `POST /api/upload` - Subir ZIP y menu.txt
- `POST /api/analyze` - Analizar HTML con IA
- `POST /api/mapping` - Mapear páginas
- `POST /api/generate` - Generar proyecto completo
- `GET /api/download/:id` - Descargar ZIP generado

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "EADDRINUSE: address already in use"
El puerto 3001 está ocupado. Opciones:
1. Cambiar `PORT` en `.env`
2. Matar el proceso: `lsof -ti:3001 | xargs kill`

### Error: "ANTHROPIC_API_KEY is not defined"
No has configurado tu API Key en `.env`

## 📝 Próximos Pasos

1. ✅ Configuración inicial (COMPLETADO)
2. ⏳ Implementar servicios (claudeAPI, parsers)
3. ⏳ Implementar rutas (upload, analyze, generate)
4. ⏳ Añadir validaciones
5. ⏳ Testing
6. ⏳ Deploy

## 📚 Documentación Completa

Ver: `DOCUMENTACION_SISTEMA_CONVERSION_TEMPLATES.md`

## 👤 Autor

Yhoswar - yhoswarperez@gmail.com

## 📄 Licencia

MIT

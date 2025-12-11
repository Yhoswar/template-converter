import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARES
// ========================================

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// ASEGURAR CARPETAS EXISTEN
// ========================================

const ensureDirectories = async () => {
  const dirs = [
    join(__dirname, 'temp'),
    join(__dirname, 'output'),
    join(__dirname, 'templates', 'php-templates')
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
  
  console.log('✓ Carpetas del sistema verificadas');
};

// ========================================
// RUTAS
// ========================================

// Importar rutas
import apiRoutes from './routes/index.js';
import { handleError } from './utils/errorHandler.js';

// Montar rutas de la API
app.use('/api', apiRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'Template Converter API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      sessions: 'GET /api/sessions',
      upload: 'POST /api/upload',
      analyze: 'POST /api/analyze',
      mapping: 'POST /api/mapping',
      generate: 'POST /api/generate',
      download: 'GET /api/download/:sessionId',
      status: 'GET /api/status/:sessionId',
      cleanup: 'DELETE /api/status/:sessionId'
    }
  });
});

// ========================================
// MANEJO DE ERRORES
// ========================================

// Error handler global
app.use((err, req, res, next) => {
  handleError(err, req, res);
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const startServer = async () => {
  try {
    // Asegurar que carpetas existen
    await ensureDirectories();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║   TEMPLATE CONVERTER BACKEND           ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log(`✓ Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`✓ Entorno: ${process.env.NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('Presiona CTRL+C para detener el servidor');
      console.log('');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();

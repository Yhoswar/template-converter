/**
 * Routes Index
 * Consolidador de todas las rutas de la API
 */

import express from 'express';
import uploadRoute from './upload.js';
import analyzeRoute from './analyze.js';
import mappingRoute from './mapping.js';
import generateRoute from './generate.js';
import downloadRoute from './download.js';
import statusRoute from './status.js';
import { getSessionsSummary } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Template Converter API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Obtener resumen de sesiones activas
 */
router.get('/sessions', (req, res) => {
  const summary = getSessionsSummary();
  res.json({
    success: true,
    data: summary
  });
});

/**
 * Rutas de conversión
 */
router.use('/upload', uploadRoute);
router.use('/analyze', analyzeRoute);
router.use('/mapping', mappingRoute);
router.use('/generate', generateRoute);
router.use('/download', downloadRoute);
router.use('/status', statusRoute);

/**
 * Ruta no encontrada
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

export default router;

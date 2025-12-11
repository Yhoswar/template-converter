/**
 * Download Route
 * GET /api/download/:sessionId - Descargar ZIP generado
 */

import express from 'express';
import { downloadProject } from '../controllers/conversionController.js';
import { injectSession, requireSession } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * GET /api/download/:sessionId
 * 
 * Params:
 *   - sessionId: string (required)
 * 
 * Respuesta:
 *   Archivo ZIP para descargar
 */
router.get(
  '/:sessionId',
  // Inyectar sessionId desde params
  (req, res, next) => {
    req.sessionId = req.params.sessionId;
    next();
  },
  // Inyectar sesión
  injectSession,
  requireSession,
  // Controlador
  downloadProject
);

export default router;

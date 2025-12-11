/**
 * Status Route
 * GET /api/status/:sessionId - Obtener estado de la sesión
 */

import express from 'express';
import { getSessionStatus, cleanupSession } from '../controllers/conversionController.js';
import { injectSession, requireSession } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * GET /api/status/:sessionId
 * 
 * Params:
 *   - sessionId: string (required)
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     sessionId: "uuid",
 *     data: {
 *       status: "completed",
 *       createdAt: "2024-01-01T00:00:00.000Z",
 *       updatedAt: "2024-01-01T00:05:00.000Z",
 *       config: {...},
 *       progress: {
 *         uploaded: true,
 *         analyzed: true,
 *         mapped: true,
 *         generated: true
 *       },
 *       errors: []
 *     }
 *   }
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
  getSessionStatus
);

/**
 * DELETE /api/status/:sessionId
 * 
 * Params:
 *   - sessionId: string (required)
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     message: "Sesión limpiada correctamente"
 *   }
 */
router.delete(
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
  cleanupSession
);

export default router;

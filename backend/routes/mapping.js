/**
 * Mapping Route
 * POST /api/mapping - Validar mapeo de páginas
 */

import express from 'express';
import { validateMappingStep } from '../controllers/conversionController.js';
import { injectSessionId, requireSessionId, validateSession } from '../middleware/fileUpload.js';
import { injectSession, requireSession, autoSaveSession } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * POST /api/mapping
 * 
 * Query/Body:
 *   - sessionId: string (required)
 * 
 * Body (application/json):
 *   {
 *     mapping: {
 *       "inicio": "index.html",
 *       "la-botiga": "shop.html",
 *       "contacto": "contact.html"
 *     }
 *   }
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     sessionId: "uuid",
 *     data: {
 *       mapping: {...},
 *       totalMapped: 10
 *     }
 *   }
 */
router.post(
  '/',
  // Validar sessionId
  injectSessionId,
  requireSessionId,
  // Validar que existe la sesión
  validateSession,
  // Inyectar sesión
  injectSession,
  requireSession,
  // Auto-guardar sesión
  autoSaveSession,
  // Controlador
  validateMappingStep
);

export default router;

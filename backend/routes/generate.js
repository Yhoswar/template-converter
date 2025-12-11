/**
 * Generate Route
 * POST /api/generate - Generar archivos PHP y crear ZIP
 */

import express from 'express';
import { generateProject } from '../controllers/conversionController.js';
import { injectSessionId, requireSessionId, validateSession } from '../middleware/fileUpload.js';
import { injectSession, requireSession, autoSaveSession } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * POST /api/generate
 * 
 * Query/Body:
 *   - sessionId: string (required)
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     sessionId: "uuid",
 *     data: {
 *       projectName: "Web_LarLiving",
 *       totalPhpFiles: 12,
 *       phpFiles: ["web.php", "la-botiga.php", ...],
 *       zipPath: "/api/download/uuid",
 *       zipSize: "5.23 MB",
 *       downloadUrl: "/api/download/uuid"
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
  generateProject
);

export default router;

/**
 * Analyze Route
 * POST /api/analyze - Analizar HTML y menu.txt
 */

import express from 'express';
import { analyzeTemplate } from '../controllers/conversionController.js';
import { uploadMenu, injectSessionId, requireSessionId, validateSession } from '../middleware/fileUpload.js';
import { injectSession, requireSession, autoSaveSession } from '../middleware/sessionManager.js';

const router = express.Router();

/**
 * POST /api/analyze
 * 
 * Query/Body:
 *   - sessionId: string (required)
 *   - useClaudeAPI: boolean (optional, default: false)
 * 
 * Body (multipart/form-data):
 *   - menu: archivo menu.txt (required)
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     sessionId: "uuid",
 *     data: {
 *       menuStructure: {
 *         pages: [...],
 *         hasSecondaryLanguage: true,
 *         totalPages: 10
 *       },
 *       components: [
 *         {
 *           file: "index.html",
 *           header: 0.85,
 *           menu: 0.90,
 *           footer: 0.85
 *         }
 *       ],
 *       detectionMethod: "css_selectors" | "claude_api"
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
  // Upload del menu.txt
  uploadMenu,
  // Auto-guardar sesión
  autoSaveSession,
  // Controlador
  analyzeTemplate
);

export default router;

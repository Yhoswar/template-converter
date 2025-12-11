/**
 * Upload Route
 * POST /api/upload - Subir ZIP de plantilla y configuración
 */

import express from 'express';
import { uploadTemplate as uploadController } from '../controllers/conversionController.js';
import { uploadTemplate, injectSessionId } from '../middleware/fileUpload.js';
import { injectSession, autoSaveSession } from '../middleware/sessionManager.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/upload
 * 
 * Body (multipart/form-data):
 *   - template: archivo ZIP (required)
 *   - config: JSON string con configuración (required)
 * 
 * Respuesta:
 *   {
 *     success: true,
 *     sessionId: "uuid",
 *     data: {
 *       config: {...},
 *       htmlFiles: ["index.html", ...],
 *       totalFiles: 45,
 *       totalHtmlFiles: 5
 *     }
 *   }
 */
router.post(
  '/',
  // Generar sessionId si no existe
  (req, res, next) => {
    if (!req.sessionId) {
      req.sessionId = uuidv4();
    }
    next();
  },
  // Inyectar sesión
  injectSession,
  // Upload del archivo
  uploadTemplate,
  // Auto-guardar sesión
  autoSaveSession,
  // Controlador
  uploadController
);

export default router;

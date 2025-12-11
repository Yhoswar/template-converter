/**
 * File Upload Middleware
 * Configuración de Multer para manejo de archivos
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../utils/errorHandler.js';

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Crear ID de sesión si no existe
      if (!req.sessionId) {
        req.sessionId = uuidv4();
      }
      
      // Crear carpeta temporal para esta sesión
      const uploadDir = path.join(process.cwd(), 'temp', req.sessionId, 'uploaded');
      await fs.ensureDir(uploadDir);
      
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  
  filename: (req, file, cb) => {
    // Mantener nombre original del archivo
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'text/plain' // Para menu.txt
  ];
  
  const allowedExts = ['.zip', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ValidationError(
      'Tipo de archivo no permitido. Solo ZIP y TXT',
      'file_type',
      { mimetype: file.mimetype, extension: ext }
    ));
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB por defecto
    files: 2 // Máximo 2 archivos (ZIP + menu.txt)
  }
});

/**
 * Middleware para subir ZIP de plantilla
 */
export const uploadTemplate = upload.single('template');

/**
 * Middleware para subir menu.txt
 */
export const uploadMenu = upload.single('menu');

/**
 * Middleware para subir múltiples archivos
 */
export const uploadMultiple = upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'menu', maxCount: 1 }
]);

/**
 * Middleware para inyectar sessionId en la request
 */
export const injectSessionId = (req, res, next) => {
  // Obtener de query, body o header
  const sessionId = req.query.sessionId || 
                   req.body?.sessionId || 
                   req.headers['x-session-id'];
  
  if (sessionId) {
    req.sessionId = sessionId;
  }
  
  next();
};

/**
 * Middleware para validar que existe sessionId
 */
export const requireSessionId = (req, res, next) => {
  if (!req.sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId es requerido'
    });
  }
  
  next();
};

/**
 * Middleware para validar que existe la carpeta de sesión
 */
export const validateSession = async (req, res, next) => {
  try {
    const sessionDir = path.join(process.cwd(), 'temp', req.sessionId);
    
    if (!await fs.pathExists(sessionDir)) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada o expirada'
      });
    }
    
    req.sessionDir = sessionDir;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el path de la carpeta de sesión
 */
export const getSessionPath = (sessionId, ...subpaths) => {
  return path.join(process.cwd(), 'temp', sessionId, ...subpaths);
};

/**
 * Obtiene el path de la carpeta de salida
 */
export const getOutputPath = (...subpaths) => {
  return path.join(process.cwd(), 'output', ...subpaths);
};

export default {
  uploadTemplate,
  uploadMenu,
  uploadMultiple,
  injectSessionId,
  requireSessionId,
  validateSession,
  getSessionPath,
  getOutputPath
};

/**
 * Session Manager
 * Gestión de sesiones de conversión
 */

import fs from 'fs-extra';
import path from 'path';
import { getSessionPath } from './fileUpload.js';

// Almacenamiento en memoria de sesiones activas
const sessions = new Map();

/**
 * Estructura de una sesión
 */
class ConversionSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = 'created'; // created, uploaded, analyzed, mapped, generating, completed, error
    this.config = null;
    this.files = {
      templateZip: null,
      menuTxt: null,
      htmlFiles: [],
      extractedPath: null
    };
    this.analysis = {
      menuStructure: null,
      components: {},
      assets: {}
    };
    this.mapping = null;
    this.generated = {
      phpFiles: [],
      zipPath: null
    };
    this.errors = [];
  }
  
  /**
   * Actualiza el estado de la sesión
   */
  updateStatus(status, error = null) {
    this.status = status;
    this.updatedAt = new Date();
    
    if (error) {
      this.errors.push({
        timestamp: new Date(),
        error: error.message || error,
        stack: error.stack
      });
    }
  }
  
  /**
   * Guarda configuración del proyecto
   */
  setConfig(config) {
    this.config = config;
    this.updatedAt = new Date();
  }
  
  /**
   * Guarda información de archivos subidos
   */
  setFiles(files) {
    this.files = { ...this.files, ...files };
    this.updatedAt = new Date();
  }
  
  /**
   * Guarda resultados del análisis
   */
  setAnalysis(analysis) {
    this.analysis = { ...this.analysis, ...analysis };
    this.updatedAt = new Date();
  }
  
  /**
   * Guarda mapeo de páginas
   */
  setMapping(mapping) {
    this.mapping = mapping;
    this.updatedAt = new Date();
  }
  
  /**
   * Guarda información de archivos generados
   */
  setGenerated(generated) {
    this.generated = { ...this.generated, ...generated };
    this.updatedAt = new Date();
  }
  
  /**
   * Convierte la sesión a objeto simple
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      config: this.config,
      files: this.files,
      analysis: this.analysis,
      mapping: this.mapping,
      generated: this.generated,
      errors: this.errors
    };
  }
}

/**
 * Crea una nueva sesión
 */
export const createSession = (sessionId) => {
  const session = new ConversionSession(sessionId);
  sessions.set(sessionId, session);
  return session;
};

/**
 * Obtiene una sesión existente
 */
export const getSession = (sessionId) => {
  return sessions.get(sessionId);
};

/**
 * Obtiene o crea una sesión
 */
export const getOrCreateSession = (sessionId) => {
  let session = sessions.get(sessionId);
  
  if (!session) {
    session = createSession(sessionId);
  }
  
  return session;
};

/**
 * Elimina una sesión
 */
export const deleteSession = (sessionId) => {
  return sessions.delete(sessionId);
};

/**
 * Lista todas las sesiones
 */
export const listSessions = () => {
  return Array.from(sessions.values()).map(s => s.toJSON());
};

/**
 * Limpia sesiones expiradas (más de 24 horas)
 */
export const cleanExpiredSessions = async () => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas
  let cleaned = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    const age = now - session.createdAt.getTime();
    
    if (age > maxAge) {
      // Eliminar archivos físicos
      try {
        const sessionPath = getSessionPath(sessionId);
        if (await fs.pathExists(sessionPath)) {
          await fs.remove(sessionPath);
        }
      } catch (error) {
        console.error(`Error limpiando archivos de sesión ${sessionId}:`, error);
      }
      
      // Eliminar de memoria
      sessions.delete(sessionId);
      cleaned++;
    }
  }
  
  return cleaned;
};

/**
 * Guarda estado de sesión en disco (backup)
 */
export const saveSessionToDisk = async (sessionId) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error('Sesión no encontrada');
  }
  
  const sessionPath = getSessionPath(sessionId);
  const statePath = path.join(sessionPath, 'session.json');
  
  await fs.ensureDir(sessionPath);
  await fs.writeJson(statePath, session.toJSON(), { spaces: 2 });
  
  return statePath;
};

/**
 * Carga estado de sesión desde disco
 */
export const loadSessionFromDisk = async (sessionId) => {
  const sessionPath = getSessionPath(sessionId);
  const statePath = path.join(sessionPath, 'session.json');
  
  if (!await fs.pathExists(statePath)) {
    return null;
  }
  
  const data = await fs.readJson(statePath);
  
  // Recrear sesión en memoria
  const session = new ConversionSession(sessionId);
  Object.assign(session, data);
  
  // Convertir fechas de string a Date
  session.createdAt = new Date(data.createdAt);
  session.updatedAt = new Date(data.updatedAt);
  
  sessions.set(sessionId, session);
  
  return session;
};

/**
 * Middleware para inyectar sesión en la request
 */
export const injectSession = (req, res, next) => {
  if (req.sessionId) {
    const session = getOrCreateSession(req.sessionId);
    req.session = session;
  }
  
  next();
};

/**
 * Middleware para requerir sesión existente
 */
export const requireSession = (req, res, next) => {
  if (!req.session) {
    return res.status(404).json({
      success: false,
      error: 'Sesión no encontrada'
    });
  }
  
  next();
};

/**
 * Middleware para guardar sesión automáticamente después de cada request
 */
export const autoSaveSession = async (req, res, next) => {
  // Interceptar el método json() de la response
  const originalJson = res.json.bind(res);
  
  res.json = async function(data) {
    // Guardar sesión si existe
    if (req.session && req.sessionId) {
      try {
        await saveSessionToDisk(req.sessionId);
      } catch (error) {
        console.error('Error guardando sesión:', error);
      }
    }
    
    return originalJson(data);
  };
  
  next();
};

/**
 * Obtiene resumen de todas las sesiones activas
 */
export const getSessionsSummary = () => {
  const sessionsList = Array.from(sessions.values());
  
  return {
    total: sessionsList.length,
    byStatus: {
      created: sessionsList.filter(s => s.status === 'created').length,
      uploaded: sessionsList.filter(s => s.status === 'uploaded').length,
      analyzed: sessionsList.filter(s => s.status === 'analyzed').length,
      mapped: sessionsList.filter(s => s.status === 'mapped').length,
      generating: sessionsList.filter(s => s.status === 'generating').length,
      completed: sessionsList.filter(s => s.status === 'completed').length,
      error: sessionsList.filter(s => s.status === 'error').length
    },
    sessions: sessionsList.map(s => ({
      sessionId: s.sessionId,
      status: s.status,
      createdAt: s.createdAt,
      projectName: s.config?.nombreComercial || 'Sin nombre'
    }))
  };
};

// Iniciar limpieza automática de sesiones expiradas cada hora
setInterval(async () => {
  try {
    const cleaned = await cleanExpiredSessions();
    if (cleaned > 0) {
      console.log(`🧹 Limpiadas ${cleaned} sesiones expiradas`);
    }
  } catch (error) {
    console.error('Error en limpieza automática:', error);
  }
}, 60 * 60 * 1000); // Cada hora

export default {
  createSession,
  getSession,
  getOrCreateSession,
  deleteSession,
  listSessions,
  cleanExpiredSessions,
  saveSessionToDisk,
  loadSessionFromDisk,
  injectSession,
  requireSession,
  autoSaveSession,
  getSessionsSummary
};

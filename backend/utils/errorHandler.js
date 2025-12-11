/**
 * Error Handler Utilities
 * Manejo centralizado de errores del sistema
 */

export class ConversionError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = 'ConversionError';
    this.type = type; // 'detection', 'transformation', 'validation', 'ai_processing'
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends Error {
  constructor(message, field, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class APIError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Maneja errores de forma centralizada
 */
export const handleError = (error, context = '') => {
  const errorInfo = {
    message: error.message,
    type: error.type || error.name || 'UnknownError',
    context,
    timestamp: new Date().toISOString(),
    ...(error.details && { details: error.details }),
    ...(error.stack && process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  console.error(`[ERROR] ${context}:`, errorInfo);
  
  return errorInfo;
};

/**
 * Wrapper para funciones asíncronas con manejo de errores
 */
export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Retry con backoff exponencial
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // No reintentar en ciertos errores
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Reintento ${attempt + 1}/${maxRetries} en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export default {
  ConversionError,
  ValidationError,
  APIError,
  handleError,
  asyncHandler,
  retryWithBackoff
};

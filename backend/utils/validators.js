/**
 * Validators
 * Validaciones de archivos, datos y formatos
 */

import { ValidationError } from './errorHandler.js';
import path from 'path';

/**
 * Valida el formulario de configuración del proyecto
 */
export const validateProjectConfig = (config) => {
  const errors = [];

  // Nombre comercial
  if (!config.nombreComercial || config.nombreComercial.trim().length < 2) {
    errors.push({
      field: 'nombreComercial',
      message: 'El nombre comercial debe tener al menos 2 caracteres'
    });
  }

  if (config.nombreComercial && config.nombreComercial.length > 100) {
    errors.push({
      field: 'nombreComercial',
      message: 'El nombre comercial no puede superar 100 caracteres'
    });
  }

  // Dominio
  if (!config.dominio) {
    errors.push({
      field: 'dominio',
      message: 'El dominio es obligatorio'
    });
  } else {
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(config.dominio)) {
      errors.push({
        field: 'dominio',
        message: 'Formato de dominio inválido. Ejemplo: ejemplo.com'
      });
    }
  }

  // Email
  if (!config.emailContacto) {
    errors.push({
      field: 'emailContacto',
      message: 'El email de contacto es obligatorio'
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.emailContacto)) {
      errors.push({
        field: 'emailContacto',
        message: 'Formato de email inválido'
      });
    }
  }

  // Teléfono
  if (!config.telefono) {
    errors.push({
      field: 'telefono',
      message: 'El teléfono es obligatorio'
    });
  } else {
    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(config.telefono.replace(/[\s\-\(\)]/g, ''))) {
      errors.push({
        field: 'telefono',
        message: 'Teléfono inválido (9-15 dígitos)'
      });
    }
  }

  // Idioma preferente
  const validLanguages = ['es', 'ca', 'en'];
  if (!config.idiomaPreferente) {
    errors.push({
      field: 'idiomaPreferente',
      message: 'El idioma preferente es obligatorio'
    });
  } else if (!validLanguages.includes(config.idiomaPreferente)) {
    errors.push({
      field: 'idiomaPreferente',
      message: 'Idioma no válido. Opciones: es, ca, en'
    });
  }

  // Idioma secundario (opcional)
  if (config.idiomaSecundario && !validLanguages.includes(config.idiomaSecundario)) {
    errors.push({
      field: 'idiomaSecundario',
      message: 'Idioma secundario no válido. Opciones: es, ca, en'
    });
  }

  // Nombre carpeta proyecto
  if (!config.nombreCarpetaProyecto) {
    errors.push({
      field: 'nombreCarpetaProyecto',
      message: 'El nombre de carpeta del proyecto es obligatorio'
    });
  } else {
    const folderRegex = /^[a-zA-Z0-9_]+$/;
    if (!folderRegex.test(config.nombreCarpetaProyecto)) {
      errors.push({
        field: 'nombreCarpetaProyecto',
        message: 'Nombre de carpeta inválido (solo letras, números y guión bajo)'
      });
    }
  }

  // Nombre carpeta assets
  if (!config.nombreCarpetaAssets) {
    errors.push({
      field: 'nombreCarpetaAssets',
      message: 'El nombre de carpeta de assets es obligatorio'
    });
  } else {
    const assetsRegex = /^[a-z0-9-]+$/;
    if (!assetsRegex.test(config.nombreCarpetaAssets)) {
      errors.push({
        field: 'nombreCarpetaAssets',
        message: 'Nombre de carpeta assets inválido (solo letras minúsculas, números y guiones)'
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Errores de validación en configuración', 'config', { errors });
  }

  return true;
};

/**
 * Valida archivo ZIP de plantilla
 */
export const validateTemplateZip = (file) => {
  const errors = [];
  const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 52428800; // 50MB

  if (!file) {
    throw new ValidationError('Archivo ZIP no proporcionado', 'zip');
  }

  // Validar extensión
  const ext = path.extname(file.name).toLowerCase();
  if (ext !== '.zip') {
    errors.push({
      field: 'zip',
      message: 'El archivo debe ser un ZIP'
    });
  }

  // Validar tamaño
  if (file.size > MAX_SIZE) {
    errors.push({
      field: 'zip',
      message: `El archivo supera el tamaño máximo de ${MAX_SIZE / 1024 / 1024}MB`
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Errores de validación en ZIP', 'zip', { errors });
  }

  return true;
};

/**
 * Valida contenido extraído del ZIP
 */
export const validateExtractedZip = (files) => {
  const errors = [];

  // Verificar que hay al menos 1 HTML
  const htmlFiles = files.filter(f => path.extname(f).toLowerCase() === '.html');
  if (htmlFiles.length === 0) {
    errors.push({
      field: 'zip-content',
      message: 'El ZIP debe contener al menos 1 archivo .html'
    });
  }

  // Verificar carpeta css/
  const hasCssFolder = files.some(f => f.includes('css/') || f.includes('css\\'));
  if (!hasCssFolder) {
    errors.push({
      field: 'zip-content',
      message: 'El ZIP debe contener una carpeta css/'
    });
  }

  // Verificar carpeta js/
  const hasJsFolder = files.some(f => f.includes('js/') || f.includes('js\\'));
  if (!hasJsFolder) {
    errors.push({
      field: 'zip-content',
      message: 'El ZIP debe contener una carpeta js/'
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Contenido del ZIP inválido', 'zip-content', { errors });
  }

  return true;
};

/**
 * Valida archivo menu.txt
 */
export const validateMenuTxt = (file) => {
  if (!file) {
    throw new ValidationError('Archivo menu.txt no proporcionado', 'menu');
  }

  const ext = path.extname(file.name).toLowerCase();
  if (ext !== '.txt') {
    throw new ValidationError('El archivo debe ser .txt', 'menu');
  }

  // Validar tamaño (máx 1MB)
  if (file.size > 1048576) {
    throw new ValidationError('El archivo menu.txt es demasiado grande (máx 1MB)', 'menu');
  }

  return true;
};

/**
 * Valida contenido parseado del menu.txt
 */
export const validateMenuStructure = (menuData) => {
  if (!menuData || !menuData.pages || menuData.pages.length < 2) {
    throw new ValidationError(
      'El menú debe tener al menos 2 páginas',
      'menu-structure',
      { received: menuData }
    );
  }

  return true;
};

/**
 * Valida mapeo de HTML a páginas
 */
export const validateMapping = (mapping, menuPages, htmlFiles) => {
  const errors = [];

  // Verificar que todas las páginas que requieren mapeo están mapeadas
  const requiredPages = menuPages.filter(page => !page.skipMapping);
  
  for (const page of requiredPages) {
    if (!mapping[page.slug]) {
      errors.push({
        field: 'mapping',
        message: `Falta mapear la página: ${page.name}`
      });
    } else {
      // Verificar que el HTML mapeado existe
      if (!htmlFiles.includes(mapping[page.slug])) {
        errors.push({
          field: 'mapping',
          message: `HTML no encontrado: ${mapping[page.slug]} para página ${page.name}`
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Errores en el mapeo de páginas', 'mapping', { errors });
  }

  return true;
};

/**
 * Sanitiza nombre de archivo
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Valida que un path no intente escapar del directorio
 */
export const validateSafePath = (filepath) => {
  const normalized = path.normalize(filepath);
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new ValidationError('Path inválido o inseguro', 'path', { path: filepath });
  }
  return true;
};

export default {
  validateProjectConfig,
  validateTemplateZip,
  validateExtractedZip,
  validateMenuTxt,
  validateMenuStructure,
  validateMapping,
  sanitizeFilename,
  validateSafePath
};

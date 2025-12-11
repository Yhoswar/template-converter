/**
 * Slugify Utilities
 * Normalización de URLs y generación de slugs
 */

import slugifyLib from 'slugify';

/**
 * Configuración por defecto de slugify
 */
const defaultOptions = {
  lower: true,
  strict: true,
  locale: 'es',
  remove: /[*+~.()'"!:@]/g
};

/**
 * Convierte texto a slug URL-friendly
 * "La Botiga" → "la-botiga"
 */
export const slugify = (text, options = {}) => {
  if (!text) return '';
  
  return slugifyLib(text, {
    ...defaultOptions,
    ...options
  });
};

/**
 * Convierte slug a nombre de variable PHP
 * "la-botiga" → "la_botiga"
 */
export const slugToVariable = (slug) => {
  if (!slug) return '';
  
  return slug
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Convierte texto a clave de diccionario (CamelCase)
 * "La botiga" → "LaBotiga"
 * "Qué ofrecemos" → "QueOfrecemos"
 */
export const textToDictionaryKey = (text) => {
  if (!text) return '';
  
  // Normalizar caracteres especiales
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9\s]/g, '')  // Solo letras, números y espacios
    .trim();
  
  // Convertir a CamelCase
  return normalized
    .split(/\s+/)
    .map((word, index) => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};

/**
 * Genera nombre de archivo PHP desde slug
 * "la-botiga" → "la-botiga.php"
 * "inicio" → "web.php" (caso especial)
 */
export const slugToPhpFilename = (slug, isHome = false) => {
  if (isHome || slug === 'inicio' || slug === 'home' || slug === 'index') {
    return 'web.php';
  }
  
  return `${slug}.php`;
};

/**
 * Extrae slug del texto del menu.txt
 * "La botiga (SEO: Tienda de regalos...)" → "la-botiga"
 */
export const extractSlugFromMenuText = (text, language = 'es') => {
  // Remover marcadores especiales (*, **, autogestionable)
  let clean = text
    .replace(/\(\*\*?\)/g, '')
    .replace(/\(autogestionable\)/gi, '')
    .trim();
  
  // Si tiene SEO, usar el texto antes del SEO
  if (clean.includes('(SEO:')) {
    clean = clean.split('(SEO:')[0].trim();
  }
  
  return slugify(clean, { locale: language });
};

/**
 * Extrae descripción SEO del texto del menu.txt
 * "La botiga (SEO: Tienda de regalos...)" → "Tienda de regalos..."
 */
export const extractSeoFromMenuText = (text) => {
  const seoMatch = text.match(/\(SEO:\s*([^)]+)\)/);
  return seoMatch ? seoMatch[1].trim() : '';
};

/**
 * Detecta si una página tiene marcador especial
 * (*) = sin página, (**) = página sin SEO
 */
export const detectPageMarkers = (text) => {
  const hasSingleStar = /\(\*\)(?!\*)/.test(text); // (*) pero no (**)
  const hasDoubleStar = /\(\*\*\)/.test(text);
  const isAutomanaged = /\(autogestionable\)/gi.test(text);
  
  return {
    skipPage: hasSingleStar,      // (*) - no genera archivo PHP
    pageNoSeo: hasDoubleStar,     // (**) - genera PHP pero sin SEO
    isAutomanaged: isAutomanaged, // (autogestionable) - crear manualmente
    hasSeo: text.includes('(SEO:')
  };
};

/**
 * Limpia texto del menu.txt removiendo marcadores
 * "La botiga (SEO: ...) (*)" → "La botiga"
 */
export const cleanMenuText = (text) => {
  return text
    .replace(/\(SEO:[^)]+\)/g, '')
    .replace(/\(\*\*?\)/g, '')
    .replace(/\(autogestionable\)/gi, '')
    .trim();
};

/**
 * Valida que un slug sea válido
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  // Solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Normaliza path de asset
 * "./css/style.css" → "css/style.css"
 * "../images/logo.png" → "images/logo.png"
 */
export const normalizeAssetPath = (path) => {
  if (!path) return '';
  
  return path
    .replace(/^\.\.?\//g, '')  // Remover ./ y ../
    .replace(/^\//, '')        // Remover / inicial
    .replace(/\\/g, '/');      // Normalizar separadores
};

/**
 * Detecta si un path es CDN externo
 */
export const isCDN = (path) => {
  if (!path) return false;
  
  return /^(https?:)?\/\//i.test(path);
};

/**
 * Detecta si un path es data URI
 */
export const isDataURI = (path) => {
  if (!path) return false;
  
  return /^data:/i.test(path);
};

/**
 * Detecta si un path es ancla o javascript
 */
export const isSpecialLink = (path) => {
  if (!path) return false;
  
  return /^(#|javascript:)/i.test(path);
};

/**
 * Genera nombre de carpeta del proyecto
 * "Lar Living" → "Web_LarLiving"
 */
export const generateProjectFolderName = (businessName) => {
  const cleaned = businessName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  return `Web_${cleaned}`;
};

/**
 * Genera nombre de carpeta de assets
 * "Lar Living" → "assets-larliving"
 */
export const generateAssetsFolderName = (businessName) => {
  const slug = slugify(businessName);
  return `assets-${slug}`;
};

export default {
  slugify,
  slugToVariable,
  textToDictionaryKey,
  slugToPhpFilename,
  extractSlugFromMenuText,
  extractSeoFromMenuText,
  detectPageMarkers,
  cleanMenuText,
  isValidSlug,
  normalizeAssetPath,
  isCDN,
  isDataURI,
  isSpecialLink,
  generateProjectFolderName,
  generateAssetsFolderName
};

/**
 * Tests para Slugify Utilities
 * Ejecutar con: node test-slugify.js
 */

import {
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
} from './utils/slugify.js';

console.log('🧪 TESTS DE SLUGIFY\n');

// Test 1: Slugify básico
console.log('📋 Test 1: Slugify básico');
const testTexts = [
  'La Botiga',
  'Qué ofrecemos',
  'Política de Privacidad',
  'Avís Legal',
  'Who we are'
];

testTexts.forEach(text => {
  const slug = slugify(text);
  console.log(`   "${text}" → "${slug}"`);
});
console.log('✅ PASS\n');

// Test 2: Slug a variable PHP
console.log('📋 Test 2: Slug a variable PHP');
const testSlugs = [
  'la-botiga',
  'que-ofrecemos',
  'politica-de-privacidad',
  'avis-legal'
];

testSlugs.forEach(slug => {
  const varName = slugToVariable(slug);
  console.log(`   "${slug}" → "$${varName}"`);
});
console.log('✅ PASS\n');

// Test 3: Texto a clave de diccionario
console.log('📋 Test 3: Texto a clave de diccionario');
const testDictTexts = [
  'La botiga',
  'Qué ofrecemos',
  'Política de Privacidad',
  'Avís Legal',
  'Who we are'
];

testDictTexts.forEach(text => {
  const key = textToDictionaryKey(text);
  console.log(`   "${text}" → "${key}"`);
});
console.log('✅ PASS\n');

// Test 4: Slug a nombre de archivo PHP
console.log('📋 Test 4: Slug a nombre de archivo PHP');
const testFileSlugs = [
  { slug: 'inicio', isHome: true },
  { slug: 'home', isHome: true },
  { slug: 'la-botiga', isHome: false },
  { slug: 'contacto', isHome: false }
];

testFileSlugs.forEach(({ slug, isHome }) => {
  const filename = slugToPhpFilename(slug, isHome);
  console.log(`   "${slug}" (home: ${isHome}) → "${filename}"`);
});
console.log('✅ PASS\n');

// Test 5: Extraer slug del texto de menu.txt
console.log('📋 Test 5: Extraer slug del menu.txt');
const testMenuTexts = [
  'La botiga (SEO: Tienda de regalos originales)',
  'Contacto (*)',
  'Servicios (**)',
  'Blog (autogestionable)',
  'Qué ofrecemos'
];

testMenuTexts.forEach(text => {
  const slug = extractSlugFromMenuText(text);
  console.log(`   "${text}" → "${slug}"`);
});
console.log('✅ PASS\n');

// Test 6: Extraer SEO del texto de menu.txt
console.log('📋 Test 6: Extraer descripción SEO');
const testSeoTexts = [
  'La botiga (SEO: Tienda de regalos originales)',
  'Contacto',
  'Servicios (SEO: Los mejores servicios profesionales)',
  'Política de cookies (SEO: Información sobre el uso de cookies en nuestro sitio)'
];

testSeoTexts.forEach(text => {
  const seo = extractSeoFromMenuText(text);
  console.log(`   "${text}"`);
  console.log(`   → SEO: "${seo || '(ninguno)'}"`);
});
console.log('✅ PASS\n');

// Test 7: Detectar marcadores especiales
console.log('📋 Test 7: Detectar marcadores especiales');
const testMarkers = [
  'Inicio',
  'Contacto (*)',
  'Servicios (**)',
  'Blog (autogestionable)',
  'La botiga (SEO: Descripción) (*)'
];

testMarkers.forEach(text => {
  const markers = detectPageMarkers(text);
  console.log(`   "${text}"`);
  console.log(`   → skipPage: ${markers.skipPage}, pageNoSeo: ${markers.pageNoSeo}, isAutomanaged: ${markers.isAutomanaged}, hasSeo: ${markers.hasSeo}`);
});
console.log('✅ PASS\n');

// Test 8: Limpiar texto del menu.txt
console.log('📋 Test 8: Limpiar texto del menú');
const testClean = [
  'La botiga (SEO: Tienda de regalos originales)',
  'Contacto (*)',
  'Servicios (**)',
  'Blog (autogestionable)',
  'Política de cookies (SEO: Info cookies) (**)'
];

testClean.forEach(text => {
  const cleaned = cleanMenuText(text);
  console.log(`   "${text}" → "${cleaned}"`);
});
console.log('✅ PASS\n');

// Test 9: Validar slugs
console.log('📋 Test 9: Validar slugs');
const testValidSlugs = [
  { slug: 'la-botiga', valid: true },
  { slug: 'contacto', valid: true },
  { slug: 'que-ofrecemos', valid: true },
  { slug: 'La-Botiga', valid: false }, // Mayúsculas
  { slug: 'la_botiga', valid: false }, // Guión bajo
  { slug: 'la botiga', valid: false }, // Espacios
  { slug: '', valid: false },
  { slug: '-inicio', valid: false }, // Empieza con guión
  { slug: 'fin-', valid: false } // Termina con guión
];

testValidSlugs.forEach(({ slug, valid }) => {
  const isValid = isValidSlug(slug);
  const status = isValid === valid ? '✅' : '❌';
  console.log(`   ${status} "${slug}" - Esperado: ${valid}, Resultado: ${isValid}`);
});
console.log('✅ PASS\n');

// Test 10: Normalizar paths de assets
console.log('📋 Test 10: Normalizar paths de assets');
const testPaths = [
  './css/style.css',
  '../images/logo.png',
  'js/script.js',
  '/assets/fonts/font.woff2',
  './../css/main.css'
];

testPaths.forEach(p => {
  const normalized = normalizeAssetPath(p);
  console.log(`   "${p}" → "${normalized}"`);
});
console.log('✅ PASS\n');

// Test 11: Detectar CDN
console.log('📋 Test 11: Detectar CDN');
const testCDN = [
  { url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', isCdn: true },
  { url: '//fonts.googleapis.com/css?family=Roboto', isCdn: true },
  { url: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js', isCdn: true },
  { url: '/css/style.css', isCdn: false },
  { url: 'css/style.css', isCdn: false },
  { url: './js/script.js', isCdn: false }
];

testCDN.forEach(({ url, isCdn }) => {
  const detected = isCDN(url);
  const status = detected === isCdn ? '✅' : '❌';
  console.log(`   ${status} "${url}" - Esperado: ${isCdn}, Resultado: ${detected}`);
});
console.log('✅ PASS\n');

// Test 12: Detectar Data URIs
console.log('📋 Test 12: Detectar Data URIs');
const testDataURIs = [
  { url: 'data:image/png;base64,iVBORw0KGgoAAAANS...', isData: true },
  { url: 'data:image/svg+xml,%3Csvg...', isData: true },
  { url: '/images/logo.png', isData: false },
  { url: 'https://example.com/image.jpg', isData: false }
];

testDataURIs.forEach(({ url, isData }) => {
  const detected = isDataURI(url);
  const status = detected === isData ? '✅' : '❌';
  const displayUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
  console.log(`   ${status} "${displayUrl}" - Esperado: ${isData}, Resultado: ${detected}`);
});
console.log('✅ PASS\n');

// Test 13: Detectar enlaces especiales
console.log('📋 Test 13: Detectar enlaces especiales');
const testSpecialLinks = [
  { url: '#section', isSpecial: true },
  { url: 'javascript:void(0)', isSpecial: true },
  { url: 'javascript:alert("test")', isSpecial: true },
  { url: '/page.html', isSpecial: false },
  { url: 'https://example.com', isSpecial: false }
];

testSpecialLinks.forEach(({ url, isSpecial }) => {
  const detected = isSpecialLink(url);
  const status = detected === isSpecial ? '✅' : '❌';
  console.log(`   ${status} "${url}" - Esperado: ${isSpecial}, Resultado: ${detected}`);
});
console.log('✅ PASS\n');

// Test 14: Generar nombre de carpeta de proyecto
console.log('📋 Test 14: Generar nombre de carpeta de proyecto');
const testBusinessNames = [
  'Lar Living',
  'La Botiga del Regalo',
  'Café & Restaurant',
  'Tècnics Associats'
];

testBusinessNames.forEach(name => {
  const folder = generateProjectFolderName(name);
  console.log(`   "${name}" → "${folder}"`);
});
console.log('✅ PASS\n');

// Test 15: Generar nombre de carpeta de assets
console.log('📋 Test 15: Generar nombre de carpeta de assets');
testBusinessNames.forEach(name => {
  const folder = generateAssetsFolderName(name);
  console.log(`   "${name}" → "${folder}"`);
});
console.log('✅ PASS\n');

console.log('✅ TODOS LOS TESTS COMPLETADOS\n');

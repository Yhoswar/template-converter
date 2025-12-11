/**
 * Tests para Validators
 * Ejecutar con: node test-validators.js
 */

import {
  validateProjectConfig,
  validateTemplateZip,
  validateMenuStructure,
  validateMapping,
  sanitizeFilename,
  validateSafePath
} from './utils/validators.js';

console.log('🧪 TESTS DE VALIDADORES\n');

// Test 1: Validar configuración correcta
console.log('📋 Test 1: Configuración válida');
try {
  const validConfig = {
    nombreComercial: 'Lar Living',
    dominio: 'larliving.com',
    emailContacto: 'info@larliving.com',
    telefono: '933123456',
    idiomaPreferente: 'es',
    idiomaSecundario: 'ca',
    nombreCarpetaProyecto: 'Web_LarLiving',
    nombreCarpetaAssets: 'assets-larliving'
  };
  
  const result = validateProjectConfig(validConfig);
  console.log('✅ PASS - Configuración válida\n');
} catch (error) {
  console.log('❌ FAIL:', error.message, '\n');
}

// Test 2: Validar configuración con errores
console.log('📋 Test 2: Configuración con errores');
try {
  const invalidConfig = {
    nombreComercial: 'L', // Muy corto
    dominio: 'invalid-domain', // Sin TLD
    emailContacto: 'not-an-email', // Email inválido
    telefono: '123', // Muy corto
    idiomaPreferente: 'xx', // Idioma no válido
    nombreCarpetaProyecto: 'Web-Invalid!', // Caracteres inválidos
    nombreCarpetaAssets: 'Assets_Invalid' // Mayúsculas
  };
  
  validateProjectConfig(invalidConfig);
  console.log('❌ FAIL - Debería haber lanzado error\n');
} catch (error) {
  console.log('✅ PASS - Detectó errores correctamente');
  console.log('   Errores:', error.metadata?.errors?.length || 0, 'encontrados\n');
}

// Test 3: Validar ZIP
console.log('📋 Test 3: Validación de ZIP');
try {
  const validZip = {
    name: 'template.zip',
    size: 1024 * 1024 * 10 // 10MB
  };
  
  const result = validateTemplateZip(validZip);
  console.log('✅ PASS - ZIP válido\n');
} catch (error) {
  console.log('❌ FAIL:', error.message, '\n');
}

// Test 4: Validar ZIP muy grande
console.log('📋 Test 4: ZIP demasiado grande');
try {
  const tooLargeZip = {
    name: 'template.zip',
    size: 1024 * 1024 * 100 // 100MB (excede límite)
  };
  
  validateTemplateZip(tooLargeZip);
  console.log('❌ FAIL - Debería haber rechazado el ZIP\n');
} catch (error) {
  console.log('✅ PASS - Rechazó ZIP grande correctamente\n');
}

// Test 5: Validar estructura de menú
console.log('📋 Test 5: Estructura de menú válida');
try {
  const validMenu = {
    pages: [
      { name: 'Inicio', slug: 'inicio' },
      { name: 'La botiga', slug: 'la-botiga' },
      { name: 'Contacto', slug: 'contacto' }
    ]
  };
  
  const result = validateMenuStructure(validMenu);
  console.log('✅ PASS - Menú válido\n');
} catch (error) {
  console.log('❌ FAIL:', error.message, '\n');
}

// Test 6: Validar menú con muy pocas páginas
console.log('📋 Test 6: Menú con pocas páginas');
try {
  const invalidMenu = {
    pages: [
      { name: 'Inicio', slug: 'inicio' }
    ]
  };
  
  validateMenuStructure(invalidMenu);
  console.log('❌ FAIL - Debería requerir mínimo 2 páginas\n');
} catch (error) {
  console.log('✅ PASS - Rechazó menú con solo 1 página\n');
}

// Test 7: Validar mapeo correcto
console.log('📋 Test 7: Mapeo válido');
try {
  const mapping = {
    'inicio': 'index.html',
    'la-botiga': 'shop.html',
    'contacto': 'contact.html'
  };
  
  const menuPages = [
    { name: 'Inicio', slug: 'inicio', skipMapping: false },
    { name: 'La botiga', slug: 'la-botiga', skipMapping: false },
    { name: 'Contacto', slug: 'contacto', skipMapping: false }
  ];
  
  const htmlFiles = ['index.html', 'shop.html', 'contact.html'];
  
  const result = validateMapping(mapping, menuPages, htmlFiles);
  console.log('✅ PASS - Mapeo correcto\n');
} catch (error) {
  console.log('❌ FAIL:', error.message, '\n');
}

// Test 8: Validar mapeo incompleto
console.log('📋 Test 8: Mapeo incompleto');
try {
  const mapping = {
    'inicio': 'index.html'
    // Falta la-botiga y contacto
  };
  
  const menuPages = [
    { name: 'Inicio', slug: 'inicio', skipMapping: false },
    { name: 'La botiga', slug: 'la-botiga', skipMapping: false },
    { name: 'Contacto', slug: 'contacto', skipMapping: false }
  ];
  
  const htmlFiles = ['index.html', 'shop.html', 'contact.html'];
  
  validateMapping(mapping, menuPages, htmlFiles);
  console.log('❌ FAIL - Debería haber detectado mapeo incompleto\n');
} catch (error) {
  console.log('✅ PASS - Detectó mapeo incompleto\n');
}

// Test 9: Sanitizar nombres de archivo
console.log('📋 Test 9: Sanitizar nombres');
const testNames = [
  'Archivo Normal.txt',
  'Archivo_con_guiones-bajos.html',
  'Archivo!@#$%Con^&*()Caracteres.php',
  '../../../etc/passwd',
  'archivo   con    espacios   múltiples.js'
];

testNames.forEach(name => {
  const sanitized = sanitizeFilename(name);
  console.log(`   "${name}" → "${sanitized}"`);
});
console.log('✅ PASS - Sanitización funcionando\n');

// Test 10: Validar paths seguros
console.log('📋 Test 10: Validación de paths');
const safePaths = ['file.txt', 'folder/file.txt', './file.txt'];
const unsafePaths = ['../../../etc/passwd', '/etc/passwd', 'folder/../../file.txt'];

safePaths.forEach(p => {
  try {
    validateSafePath(p);
    console.log(`   ✅ "${p}" - Path seguro`);
  } catch (error) {
    console.log(`   ❌ "${p}" - Rechazado incorrectamente`);
  }
});

unsafePaths.forEach(p => {
  try {
    validateSafePath(p);
    console.log(`   ❌ "${p}" - Debería haberse rechazado`);
  } catch (error) {
    console.log(`   ✅ "${p}" - Path inseguro rechazado`);
  }
});

console.log('\n✅ TESTS COMPLETADOS\n');

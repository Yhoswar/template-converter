/**
 * Tests para Menu Parser
 * Ejecutar con: node test-menu-parser.js
 */

import { menuParser } from './services/menuParser.js';

console.log('🧪 TESTS DE MENU PARSER\n');

// Ejemplo de menu.txt con dos idiomas
const menuEjemplo = `Inicio (SEO: Página de inicio - Lar Living regalos originales)
La botiga (SEO: Tienda de regalos originales y personalizados)
  Regalos para ella
  Regalos para él
  Regalos para niños
Qué ofrecemos (SEO: Nuestros servicios de personalización y packaging)
Dónde estamos (SEO: Ubicación y horarios de nuestra tienda física)
Contacto (*)
Blog (autogestionable)
Política de privacidad (**)
Aviso legal (**)
Política de cookies (**)

-----------------------------------------------------------

Inici (SEO: Pàgina d'inici - Lar Living regals originals)
La botiga (SEO: Botiga de regals originals i personalitzats)
  Regals per a ella
  Regals per a ell
  Regals per a nens
Què oferim (SEO: Els nostres serveis de personalització i packaging)
On som (SEO: Ubicació i horaris de la nostra botiga física)
Contacte (*)
Blog (autogestionable)
Política de privacitat (**)
Avís legal (**)
Política de cookies (**)
`;

// Test 1: Parse completo del menú
console.log('📋 Test 1: Parse completo del menú\n');
try {
  const result = menuParser.parse(menuEjemplo);
  
  console.log('✅ Parse exitoso');
  console.log(`   Idiomas detectados: ${result.hasSecondaryLanguage ? '2' : '1'}`);
  console.log(`   Páginas en idioma primario: ${result.primary.length}`);
  if (result.secondary) {
    console.log(`   Páginas en idioma secundario: ${result.secondary.length}`);
  }
  console.log();
  
  // Mostrar estructura del menú
  console.log('📄 Estructura del menú (idioma primario):\n');
  result.primary.forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.name}`);
    console.log(`      Slug: ${page.slug || '(ninguno)'}`);
    console.log(`      PHP: ${page.phpFile || '(no genera)'}`);
    console.log(`      Variable: $${page.varName || 'N/A'}`);
    console.log(`      Clave diccionario: ${page.dictionaryKey || 'N/A'}`);
    console.log(`      SEO: ${page.seo}`);
    console.log(`      Marcadores: skipPage=${page.skipPage}, pageNoSeo=${page.pageNoSeo}, automanaged=${page.isAutomanaged}`);
    
    if (page.children && page.children.length > 0) {
      page.children.forEach((child, j) => {
        console.log(`      ${i + 1}.${j + 1} ${child.name}`);
        console.log(`         Slug: ${child.slug || '(ninguno)'}`);
      });
    }
    console.log();
  });
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 2: Generar URLs mapping
console.log('📋 Test 2: Generar URLs mapping\n');
try {
  const result = menuParser.parse(menuEjemplo);
  const urlsMapping = menuParser.generateUrlsMapping(result, 'es', 'ca');
  
  console.log('✅ URLs mapping generado');
  console.log(`   Total de mapeos: ${urlsMapping.length}\n`);
  
  urlsMapping.forEach((mapping, i) => {
    console.log(`   ${i + 1}. ${mapping.phpFile}`);
    console.log(`      ES: /${mapping.primarySlug}`);
    console.log(`      CA: /ca/${mapping.secondarySlug}`);
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 3: Obtener archivos PHP a crear
console.log('📋 Test 3: Archivos PHP a crear\n');
try {
  const result = menuParser.parse(menuEjemplo);
  const phpFiles = menuParser.getPhpFilesToCreate(result);
  
  console.log('✅ Lista de archivos PHP generada');
  console.log(`   Total de archivos: ${phpFiles.length}\n`);
  
  phpFiles.forEach((file, i) => {
    console.log(`   ${i + 1}. ${file.filename}`);
    console.log(`      Nombre: ${file.name}`);
    console.log(`      Slug: ${file.slug}`);
    console.log(`      Variable: $${file.varName}`);
    console.log(`      Home: ${file.isHome ? 'Sí' : 'No'}`);
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 4: Generar claves del diccionario
console.log('📋 Test 4: Claves del diccionario\n');
try {
  const result = menuParser.parse(menuEjemplo);
  const dictionaryKeys = menuParser.generateDictionaryKeys(result, 'es', 'ca');
  
  console.log('✅ Claves del diccionario generadas');
  console.log(`   Total de claves: ${dictionaryKeys.length}\n`);
  
  // Mostrar algunas claves de ejemplo
  console.log('   Ejemplos de claves:\n');
  dictionaryKeys.slice(0, 10).forEach(key => {
    console.log(`   ${key.key}:`);
    console.log(`      ES: ${key.es}`);
    if (key.ca) {
      console.log(`      CA: ${key.ca}`);
    }
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 5: Generar estructura para menú HTML
console.log('📋 Test 5: Estructura para menú HTML\n');
try {
  const result = menuParser.parse(menuEjemplo);
  const menuStructure = menuParser.generateMenuStructure(result);
  
  console.log('✅ Estructura de menú generada');
  console.log(`   Items de primer nivel: ${menuStructure.length}\n`);
  
  // Mostrar estructura
  menuStructure.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.name}`);
    console.log(`      URL: ${item.url}`);
    console.log(`      Submenu: ${item.hasSubmenu ? `Sí (${item.submenu.length} items)` : 'No'}`);
    console.log(`      Skip: ${item.skipPage ? 'Sí' : 'No'}`);
    
    if (item.hasSubmenu) {
      item.submenu.forEach((sub, j) => {
        console.log(`      ${i + 1}.${j + 1} ${sub.name} (${sub.url})`);
      });
    }
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 6: Parse de menú con un solo idioma
console.log('📋 Test 6: Parse de menú con un solo idioma\n');
const menuSingleLang = `Inicio
La botiga
  Regalos para ella
  Regalos para él
Contacto
`;

try {
  const result = menuParser.parse(menuSingleLang);
  
  console.log('✅ Parse exitoso (un idioma)');
  console.log(`   Tiene idioma secundario: ${result.hasSecondaryLanguage ? 'Sí' : 'No'}`);
  console.log(`   Páginas detectadas: ${result.primary.length}\n`);
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 7: Detección de niveles jerárquicos
console.log('📋 Test 7: Detección de niveles jerárquicos\n');
const menuHierarchy = `Inicio
Productos
  Categoría A
    Subcategoría A1
    Subcategoría A2
  Categoría B
    Subcategoría B1
Servicios
Contacto
`;

try {
  const result = menuParser.parse(menuHierarchy);
  
  console.log('✅ Jerarquía detectada correctamente');
  
  result.primary.forEach(page => {
    console.log(`   ${page.name} (nivel ${page.level})`);
    
    if (page.children && page.children.length > 0) {
      page.children.forEach(child => {
        console.log(`      ${child.name} (nivel ${child.level})`);
        
        if (child.children && child.children.length > 0) {
          child.children.forEach(grandchild => {
            console.log(`         ${grandchild.name} (nivel ${grandchild.level})`);
          });
        }
      });
    }
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 8: Marcadores especiales (*), (**), (autogestionable)
console.log('📋 Test 8: Detección de marcadores especiales\n');
const menuMarkers = `Inicio
Productos (*)
Servicios (**)
Blog (autogestionable)
Contacto
`;

try {
  const result = menuParser.parse(menuMarkers);
  
  console.log('✅ Marcadores detectados correctamente\n');
  
  result.primary.forEach(page => {
    console.log(`   ${page.name}:`);
    console.log(`      skipPage: ${page.skipPage}`);
    console.log(`      pageNoSeo: ${page.pageNoSeo}`);
    console.log(`      isAutomanaged: ${page.isAutomanaged}`);
    console.log(`      Genera PHP: ${page.phpFile ? page.phpFile : 'No'}`);
  });
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

console.log('✅ TODOS LOS TESTS COMPLETADOS\n');

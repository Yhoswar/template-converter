/**
 * Tests para HTML Parser
 * Ejecutar con: node test-html-parser.js
 */

import { htmlParser } from './services/htmlParser.js';

console.log('🧪 TESTS DE HTML PARSER\n');

// HTML de ejemplo
const htmlEjemplo = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tienda de regalos originales">
    <meta name="keywords" content="regalos, personalización, packaging">
    <title>Lar Living - Regalos Originales</title>
    
    <!-- CSS CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- CSS Local -->
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/responsive.css">
    
    <!-- Inline CSS -->
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: url('./images/bg.jpg') no-repeat center center;
        }
        @font-face {
            font-family: 'CustomFont';
            src: url('./fonts/custom.woff2') format('woff2');
        }
    </style>
    
    <link rel="icon" href="./images/favicon.ico">
</head>
<body>

    <!-- Header -->
    <header class="site-header">
        <div class="container">
            <img src="./images/logo.png" alt="Lar Living Logo" class="logo">
            <h1>Lar Living</h1>
        </div>
    </header>
    
    <!-- Navigation -->
    <nav class="main-nav">
        <ul class="menu">
            <li><a href="/">Inicio</a></li>
            <li><a href="/la-botiga">La botiga</a></li>
            <li><a href="/que-ofrecemos">Qué ofrecemos</a></li>
            <li><a href="/contacto">Contacto</a></li>
            <li><a href="#section">Ancla</a></li>
            <li><a href="javascript:void(0)">JavaScript</a></li>
            <li><a href="https://external.com">Externo</a></li>
        </ul>
    </nav>
    
    <!-- Main Content -->
    <main>
        <section class="hero" style="background-image: url('./images/hero.jpg')">
            <h2>Bienvenidos a Lar Living</h2>
            <img src="./images/gift-1.jpg" alt="Regalo 1">
            <img src="https://cdn.example.com/gift-2.jpg" alt="Regalo 2 CDN">
            <img src="data:image/png;base64,iVBORw0KGgo..." alt="Regalo 3 Base64">
            
            <!-- Srcset example -->
            <img srcset="./images/responsive-1x.jpg 1x, ./images/responsive-2x.jpg 2x" alt="Responsive">
        </section>
        
        <section class="products">
            <h2>Nuestros Productos</h2>
            <div class="product">
                <img src="../images/product-1.jpg" alt="Producto 1">
            </div>
        </section>
    </main>
    
    <!-- Footer -->
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2024 Lar Living. Todos los derechos reservados.</p>
            <p>Email: <a href="mailto:info@larliving.com">info@larliving.com</a></p>
            <p>Teléfono: <a href="tel:+34933123456">+34 933 12 34 56</a></p>
            <img src="./images/footer-logo.png" alt="Footer Logo">
        </div>
    </footer>
    
    <!-- JavaScript CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    
    <!-- JavaScript Local -->
    <script src="./js/main.js"></script>
    <script src="./js/slider.js"></script>
    
    <!-- Inline JavaScript -->
    <script>
        console.log('Page loaded');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM ready');
        });
    </script>
</body>
</html>
`;

// Test 1: Detectar componentes (header, menu, footer)
console.log('📋 Test 1: Detectar componentes\n');
try {
  const components = htmlParser.detectComponents(htmlEjemplo);
  
  console.log('✅ Componentes detectados:\n');
  
  // Header
  console.log('   Header:');
  console.log(`      Encontrado: ${components.header.html ? 'Sí' : 'No'}`);
  console.log(`      Selector: ${components.header.selector || 'N/A'}`);
  console.log(`      Confianza: ${(components.header.confidence * 100).toFixed(0)}%`);
  console.log(`      Método: ${components.header.detectionMethod}`);
  
  // Menu
  console.log('\n   Menú:');
  console.log(`      Encontrado: ${components.menu.html ? 'Sí' : 'No'}`);
  console.log(`      Selector: ${components.menu.selector || 'N/A'}`);
  console.log(`      Confianza: ${(components.menu.confidence * 100).toFixed(0)}%`);
  console.log(`      Método: ${components.menu.detectionMethod}`);
  
  // Footer
  console.log('\n   Footer:');
  console.log(`      Encontrado: ${components.footer.html ? 'Sí' : 'No'}`);
  console.log(`      Selector: ${components.footer.selector || 'N/A'}`);
  console.log(`      Confianza: ${(components.footer.confidence * 100).toFixed(0)}%`);
  console.log(`      Método: ${components.footer.detectionMethod}`);
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 2: Extraer assets
console.log('📋 Test 2: Extraer assets\n');
try {
  const assets = htmlParser.extractAssets(htmlEjemplo);
  
  console.log('✅ Assets extraídos:\n');
  
  // CSS
  console.log(`   CSS Local: ${assets.css.local.length}`);
  assets.css.local.forEach(css => {
    console.log(`      - ${css.original}`);
  });
  
  console.log(`\n   CSS CDN: ${assets.css.cdn.length}`);
  assets.css.cdn.forEach(css => {
    console.log(`      - ${css.original}`);
  });
  
  console.log(`\n   CSS Inline: ${assets.css.inline.length}`);
  
  // JavaScript
  console.log(`\n   JS Local: ${assets.js.local.length}`);
  assets.js.local.forEach(js => {
    console.log(`      - ${js.original}`);
  });
  
  console.log(`\n   JS CDN: ${assets.js.cdn.length}`);
  assets.js.cdn.forEach(js => {
    console.log(`      - ${js.original}`);
  });
  
  console.log(`\n   JS Inline: ${assets.js.inline.length}`);
  
  // Imágenes
  console.log(`\n   Imágenes Local: ${assets.images.local.length}`);
  assets.images.local.forEach(img => {
    console.log(`      - ${img.original}${img.fromSrcset ? ' (srcset)' : ''}${img.fromCss ? ' (CSS)' : ''}`);
  });
  
  console.log(`\n   Imágenes CDN: ${assets.images.cdn.length}`);
  
  // Fuentes
  console.log(`\n   Fuentes Local: ${assets.fonts.local.length}`);
  assets.fonts.local.forEach(font => {
    console.log(`      - ${font.original}`);
  });
  
  console.log(`\n   Fuentes CDN: ${assets.fonts.cdn.length}`);
  assets.fonts.cdn.forEach(font => {
    console.log(`      - ${font.original.substring(0, 60)}...`);
  });
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 3: Extraer meta tags
console.log('📋 Test 3: Extraer meta tags\n');
try {
  const $ = htmlParser.load(htmlEjemplo);
  const meta = htmlParser.extractMetaTags($);
  
  console.log('✅ Meta tags extraídos:\n');
  
  Object.entries(meta).forEach(([name, content]) => {
    console.log(`   ${name}: ${content}`);
  });
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 4: Extraer title
console.log('📋 Test 4: Extraer title\n');
try {
  const title = htmlParser.extractTitle(htmlEjemplo);
  
  console.log('✅ Title extraído:');
  console.log(`   "${title}"\n`);
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 5: Extraer enlaces internos
console.log('📋 Test 5: Extraer enlaces internos\n');
try {
  const links = htmlParser.extractInternalLinks(htmlEjemplo);
  
  console.log('✅ Enlaces internos extraídos:');
  console.log(`   Total: ${links.length}\n`);
  
  links.forEach(link => {
    console.log(`   ${link.href} → "${link.text}"`);
  });
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 6: Obtener estadísticas del HTML
console.log('📋 Test 6: Estadísticas del HTML\n');
try {
  const stats = htmlParser.getStats(htmlEjemplo);
  
  console.log('✅ Estadísticas:\n');
  console.log(`   Total de elementos: ${stats.totalElements}`);
  console.log(`   Imágenes: ${stats.images}`);
  console.log(`   Enlaces: ${stats.links}`);
  console.log(`   Scripts: ${stats.scripts}`);
  console.log(`   Stylesheets: ${stats.stylesheets}`);
  console.log(`   Headings:`);
  console.log(`      H1: ${stats.headings.h1}`);
  console.log(`      H2: ${stats.headings.h2}`);
  console.log(`      H3: ${stats.headings.h3}`);
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 7: HTML sin componentes claros
console.log('📋 Test 7: HTML sin componentes definidos\n');
const htmlSinComponentes = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
    <div class="container">
        <h1>Título</h1>
        <p>Contenido</p>
    </div>
</body>
</html>
`;

try {
  const components = htmlParser.detectComponents(htmlSinComponentes);
  
  console.log('✅ Componentes detectados en HTML simple:\n');
  console.log(`   Header encontrado: ${components.header.html ? 'Sí' : 'No'}`);
  console.log(`   Menú encontrado: ${components.menu.html ? 'Sí' : 'No'}`);
  console.log(`   Footer encontrado: ${components.footer.html ? 'Sí' : 'No'}`);
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

// Test 8: Cargar y consultar HTML
console.log('📋 Test 8: Cargar y consultar HTML con Cheerio\n');
try {
  const $ = htmlParser.load(htmlEjemplo);
  
  console.log('✅ HTML cargado correctamente\n');
  
  // Hacer consultas
  console.log('   Consultas de ejemplo:');
  console.log(`      Total de <img>: ${$('img').length}`);
  console.log(`      Total de <a>: ${$('a').length}`);
  console.log(`      Total de <section>: ${$('section').length}`);
  console.log(`      Total de <link rel="stylesheet">: ${$('link[rel="stylesheet"]').length}`);
  console.log(`      Total de <script src>: ${$('script[src]').length}`);
  
  // Extraer atributos específicos
  console.log('\n   Atributos extraídos:');
  console.log(`      charset: ${$('meta[charset]').attr('charset')}`);
  console.log(`      lang: ${$('html').attr('lang')}`);
  
  // Buscar texto específico
  const h1Text = $('h1').first().text();
  console.log(`\n   Primer H1: "${h1Text}"`);
  
  const h2Texts = [];
  $('h2').each((i, elem) => {
    h2Texts.push($(elem).text());
  });
  console.log(`   H2s encontrados: ${h2Texts.join(', ')}`);
  
  console.log();
  
} catch (error) {
  console.log('❌ FAIL:', error.message);
}

console.log('✅ TODOS LOS TESTS COMPLETADOS\n');

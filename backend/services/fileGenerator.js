/**
 * File Generator
 * Generador de archivos PHP del framework
 */

import path from 'path';
import fs from 'fs-extra';

/**
 * Clase para generar archivos PHP
 */
class FileGenerator {
  
  /**
   * Genera archivo web.php o página PHP
   */
  generatePageFile(pageData, config) {
    const { slug, varName, dictionaryKey, isHome } = pageData;
    const filename = isHome ? 'web.php' : `${slug}.php`;
    
    const content = `<?php
/**
 * ${pageData.name}
 * Archivo generado automáticamente
 */

// Variables de página
$${varName}_Titulo = $diccionario["${dictionaryKey}Title"];
$${varName}_KeyWords = $diccionario["${dictionaryKey}KeyWords"];
$${varName}_Description = $diccionario["${dictionaryKey}Description"];

// Incluir header
include '_header.php';
?>

<!-- CONTENIDO DE ${pageData.name.toUpperCase()} -->
<main>
    <h1><?php echo $diccionario["${dictionaryKey}Title"]; ?></h1>
    
    <!-- TODO: Añadir contenido aquí -->
    
</main>

<?php
// Incluir footer
include '_footer.php';
?>
`;
    
    return {
      filename,
      content,
      path: filename
    };
  }
  
  /**
   * Genera archivo _header.php
   */
  generateHeaderFile(config, assets) {
    const { nombreCarpetaProyecto, nombreCarpetaAssets, dominio } = config;
    
    const content = `<?php
/**
 * Header del sitio
 * Incluye meta tags, CSS y estructura inicial
 */
?>
<!DOCTYPE html>
<html lang="<?php echo $idioma; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Meta Tags SEO -->
    <title><?php echo $$pagina . "_Titulo"; ?></title>
    <meta name="keywords" content="<?php echo $$pagina . "_KeyWords"; ?>">
    <meta name="description" content="<?php echo $$pagina . "_Description"; ?>">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo $url_actual; ?>">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $$pagina . "_Titulo"; ?>">
    <meta property="og:description" content="<?php echo $$pagina . "_Description"; ?>">
    <meta property="og:url" content="<?php echo $url_actual; ?>">
    <meta property="og:type" content="website">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/<?php echo CARPETA_ASSETS; ?>/images/favicon.ico">
    
    <!-- CSS -->
${this.generateCSSLinks(assets.css)}
    
    <!-- Preload de fuentes críticas -->
${this.generateFontPreloads(assets.fonts)}
</head>
<body>

<!-- Header -->
<header>
    <?php include '_menu.php'; ?>
</header>
`;
    
    return {
      filename: '_header.php',
      content,
      path: '_header.php'
    };
  }
  
  /**
   * Genera archivo _footer.php
   */
  generateFooterFile(config, contactData) {
    const content = `<?php
/**
 * Footer del sitio
 * Incluye información de contacto y scripts
 */
?>

<!-- Footer -->
<footer>
    <div class="footer-container">
        <div class="footer-info">
            <h3><?php echo $diccionario["FooterContacto"]; ?></h3>
            <p>
                <strong><?php echo $diccionario["FooterTelefono"]; ?>:</strong> 
                <a href="tel:${contactData.telefono}">${contactData.telefono}</a>
            </p>
            <p>
                <strong><?php echo $diccionario["FooterEmail"]; ?>:</strong> 
                <a href="mailto:${contactData.email}">${contactData.email}</a>
            </p>
        </div>
        
        <div class="footer-legal">
            <p>&copy; <?php echo date('Y'); ?> ${contactData.nombreComercial}. <?php echo $diccionario["FooterDerechos"]; ?></p>
            <p>
                <a href="<?php echo crear_url('aviso-legal', $idioma); ?>"><?php echo $diccionario["FooterAvisoLegal"]; ?></a> |
                <a href="<?php echo crear_url('politica-privacidad', $idioma); ?>"><?php echo $diccionario["FooterPrivacidad"]; ?></a> |
                <a href="<?php echo crear_url('politica-cookies', $idioma); ?>"><?php echo $diccionario["FooterCookies"]; ?></a>
            </p>
        </div>
    </div>
</footer>

<!-- JavaScript -->
${this.generateJSLinks()}

</body>
</html>
`;
    
    return {
      filename: '_footer.php',
      content,
      path: '_footer.php'
    };
  }
  
  /**
   * Genera archivo _menu.php
   */
  generateMenuFile(menuStructure, config) {
    const content = `<?php
/**
 * Menú de navegación
 * Generado desde menu.txt
 */
?>

<nav class="main-nav">
    <div class="nav-container">
        <a href="<?php echo crear_url('inicio', $idioma); ?>" class="logo">
            <img src="/<?php echo CARPETA_ASSETS; ?>/images/logo.png" alt="<?php echo NOMBRE_COMERCIAL; ?>">
        </a>
        
        <button class="menu-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <ul class="menu">
${this.generateMenuItems(menuStructure, 3)}
        </ul>
    </div>
</nav>
`;
    
    return {
      filename: '_menu.php',
      content,
      path: '_menu.php'
    };
  }
  
  /**
   * Genera items del menú recursivamente
   */
  generateMenuItems(items, indent = 0) {
    const indentStr = ' '.repeat(indent * 4);
    let html = '';
    
    for (const item of items) {
      if (item.skipPage) {
        // Item sin enlace (solo texto)
        html += `${indentStr}<li class="menu-item no-link">
${indentStr}    <span><?php echo $diccionario["Menu${item.dictionaryKey}"]; ?></span>\n`;
      } else {
        // Item con enlace
        const activeClass = `<?php echo ($pagina == '${item.varName}') ? ' active' : ''; ?>`;
        html += `${indentStr}<li class="menu-item${activeClass}">
${indentStr}    <a href="<?php echo crear_url('${item.slug}', $idioma); ?>">
${indentStr}        <?php echo $diccionario["Menu${item.dictionaryKey}"]; ?>
${indentStr}    </a>\n`;
      }
      
      // Submenu si tiene hijos
      if (item.hasSubmenu && item.submenu.length > 0) {
        html += `${indentStr}    <ul class="submenu">\n`;
        html += this.generateMenuItems(item.submenu, indent + 2);
        html += `${indentStr}    </ul>\n`;
      }
      
      html += `${indentStr}</li>\n`;
    }
    
    return html;
  }
  
  /**
   * Genera archivo _config.php
   */
  generateConfigFile(config) {
    const { nombreComercial, dominio, emailContacto, telefono, idiomaPreferente, 
            idiomaSecundario, nombreCarpetaProyecto, nombreCarpetaAssets } = config;
    
    const content = `<?php
/**
 * Configuración del sitio
 * Archivo generado automáticamente
 */

// Información del negocio
define('NOMBRE_COMERCIAL', '${nombreComercial}');
define('DOMINIO', '${dominio}');
define('EMAIL_CONTACTO', '${emailContacto}');
define('TELEFONO', '${telefono}');

// Idiomas
define('IDIOMA_PREFERENTE', '${idiomaPreferente}');
${idiomaSecundario ? `define('IDIOMA_SECUNDARIO', '${idiomaSecundario}');\n` : ''}define('IDIOMAS_DISPONIBLES', [${idiomaSecundario ? `'${idiomaPreferente}', '${idiomaSecundario}'` : `'${idiomaPreferente}'`}]);

// Carpetas
define('CARPETA_PROYECTO', '${nombreCarpetaProyecto}');
define('CARPETA_ASSETS', '${nombreCarpetaAssets}');

// Rutas
define('URL_BASE', 'https://' . DOMINIO);
define('PATH_ROOT', __DIR__);

// Timezone
date_default_timezone_set('Europe/Madrid');

// Error reporting (cambiar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluir archivos necesarios
require_once '_funciones.php';
require_once '_diccionario.php';
require_once '_urls.php';
?>
`;
    
    return {
      filename: '_config.php',
      content,
      path: '_config.php'
    };
  }
  
  /**
   * Genera archivo _funciones.php
   */
  generateFunctionsFile() {
    const content = `<?php
/**
 * Funciones auxiliares del framework
 */

/**
 * Crea URL según idioma y slug
 */
function crear_url($slug, $idioma) {
    global $urls;
    
    // Si es inicio/home
    if ($slug == 'inicio' || $slug == 'home' || $slug == 'index') {
        return $idioma == IDIOMA_PREFERENTE ? '/' : '/' . $idioma;
    }
    
    // Buscar URL en el mapeo
    if (isset($urls[$slug][$idioma])) {
        return $urls[$slug][$idioma];
    }
    
    // Fallback
    return '/' . $slug;
}

/**
 * Detecta idioma desde URL
 */
function detectar_idioma() {
    $uri = $_SERVER['REQUEST_URI'];
    $uri = parse_url($uri, PHP_URL_PATH);
    $uri = trim($uri, '/');
    
    // Primer segmento de la URL
    $segments = explode('/', $uri);
    $first = $segments[0] ?? '';
    
    // Verificar si es un idioma válido
    if (in_array($first, IDIOMAS_DISPONIBLES)) {
        return $first;
    }
    
    return IDIOMA_PREFERENTE;
}

/**
 * Detecta página actual desde URL
 */
function detectar_pagina() {
    global $urls;
    
    $uri = $_SERVER['REQUEST_URI'];
    $uri = parse_url($uri, PHP_URL_PATH);
    $uri = trim($uri, '/');
    
    // Si es raíz o solo idioma
    if (empty($uri) || in_array($uri, IDIOMAS_DISPONIBLES)) {
        return 'web';
    }
    
    // Buscar en URLs inversamente
    foreach ($urls as $slug => $translations) {
        foreach ($translations as $lang => $url) {
            if (trim($url, '/') == $uri) {
                return $slug;
            }
        }
    }
    
    // Fallback
    return 'web';
}

/**
 * Obtiene URL actual completa
 */
function url_actual() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
    return $protocol . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
}

/**
 * Cambia idioma manteniendo la página actual
 */
function cambiar_idioma($nuevo_idioma) {
    global $pagina, $urls;
    
    if (isset($urls[$pagina][$nuevo_idioma])) {
        return $urls[$pagina][$nuevo_idioma];
    }
    
    return '/' . $nuevo_idioma;
}

/**
 * Sanitiza texto para prevenir XSS
 */
function limpiar_texto($texto) {
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}
?>
`;
    
    return {
      filename: '_funciones.php',
      content,
      path: '_funciones.php'
    };
  }
  
  /**
   * Genera archivo _diccionario.php
   */
  generateDictionaryFile(dictionaryKeys, primaryLang, secondaryLang) {
    let content = `<?php
/**
 * Diccionario multiidioma
 * Generado desde menu.txt y contenidos detectados
 */

$diccionario = [];

`;
    
    // Agrupar por idioma
    for (const item of dictionaryKeys) {
      content += `// ${item.key}\n`;
      content += `$diccionario["${item.key}"]["${primaryLang}"] = "${item[primaryLang]}";\n`;
      
      if (secondaryLang && item[secondaryLang]) {
        content += `$diccionario["${item.key}"]["${secondaryLang}"] = "${item[secondaryLang]}";\n`;
      }
      
      content += '\n';
    }
    
    // Añadir textos base del footer
    content += `// Textos base del footer
$diccionario["FooterContacto"]["${primaryLang}"] = "Contacto";
$diccionario["FooterTelefono"]["${primaryLang}"] = "Teléfono";
$diccionario["FooterEmail"]["${primaryLang}"] = "Email";
$diccionario["FooterDerechos"]["${primaryLang}"] = "Todos los derechos reservados.";
$diccionario["FooterAvisoLegal"]["${primaryLang}"] = "Aviso Legal";
$diccionario["FooterPrivacidad"]["${primaryLang}"] = "Política de Privacidad";
$diccionario["FooterCookies"]["${primaryLang}"] = "Política de Cookies";

`;
    
    if (secondaryLang) {
      const translations = {
        ca: {
          FooterContacto: 'Contacte',
          FooterTelefono: 'Telèfon',
          FooterEmail: 'Correu',
          FooterDerechos: 'Tots els drets reservats.',
          FooterAvisoLegal: 'Avís Legal',
          FooterPrivacidad: 'Política de Privacitat',
          FooterCookies: 'Política de Cookies'
        },
        en: {
          FooterContacto: 'Contact',
          FooterTelefono: 'Phone',
          FooterEmail: 'Email',
          FooterDerechos: 'All rights reserved.',
          FooterAvisoLegal: 'Legal Notice',
          FooterPrivacidad: 'Privacy Policy',
          FooterCookies: 'Cookies Policy'
        }
      };
      
      const trans = translations[secondaryLang] || translations.en;
      
      Object.entries(trans).forEach(([key, value]) => {
        content += `$diccionario["${key}"]["${secondaryLang}"] = "${value}";\n`;
      });
    }
    
    content += `
// Seleccionar idioma actual
$idioma = detectar_idioma();

// Extraer traducciones del idioma actual
foreach ($diccionario as $clave => $traducciones) {
    $diccionario[$clave] = $traducciones[$idioma] ?? $traducciones[IDIOMA_PREFERENTE] ?? '';
}
?>
`;
    
    return {
      filename: '_diccionario.php',
      content,
      path: '_diccionario.php'
    };
  }
  
  /**
   * Genera archivo _urls.php
   */
  generateUrlsFile(urlsMapping, primaryLang, secondaryLang) {
    let content = `<?php
/**
 * Mapeo de URLs multiidioma
 * Generado desde menu.txt
 */

$urls = [
`;
    
    // Home/inicio
    content += `    'web' => [\n`;
    content += `        '${primaryLang}' => '/',\n`;
    if (secondaryLang) {
      content += `        '${secondaryLang}' => '/${secondaryLang}',\n`;
    }
    content += `    ],\n\n`;
    
    // Resto de páginas
    for (const mapping of urlsMapping) {
      content += `    '${mapping.primarySlug}' => [\n`;
      content += `        '${primaryLang}' => '/${mapping.primarySlug}',\n`;
      if (secondaryLang && mapping.secondarySlug) {
        content += `        '${secondaryLang}' => '/${secondaryLang}/${mapping.secondarySlug}',\n`;
      }
      content += `    ],\n`;
    }
    
    content += `];
?>
`;
    
    return {
      filename: '_urls.php',
      content,
      path: '_urls.php'
    };
  }
  
  /**
   * Genera archivo .htaccess
   */
  generateHtaccessFile(config) {
    const { idiomaPreferente, idiomaSecundario } = config;
    
    const content = `# Rewrite rules para URLs limpias y multiidioma
RewriteEngine On
RewriteBase /

# Forzar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Remover www (opcional)
RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# Página principal
RewriteRule ^$ web.php [L]
RewriteRule ^${idiomaPreferente}/?$ web.php [L]
${idiomaSecundario ? `RewriteRule ^${idiomaSecundario}/?$ web.php [L]\n` : ''}
# Rutas de páginas
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([a-z]{2})/([a-z0-9-]+)/?$ $2.php [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([a-z0-9-]+)/?$ $1.php [L]

# Errores
ErrorDocument 404 /404.php
ErrorDocument 500 /500.php
`;
    
    return {
      filename: '.htaccess',
      content,
      path: '.htaccess'
    };
  }
  
  /**
   * Genera archivo index.php (redirección)
   */
  generateIndexFile() {
    const content = `<?php
/**
 * Punto de entrada principal
 * Redirige a web.php
 */

require_once '_config.php';

// Detectar idioma y página
$idioma = detectar_idioma();
$pagina = detectar_pagina();

// Cargar archivo correspondiente
$archivo = $pagina . '.php';

if (file_exists($archivo)) {
    include $archivo;
} else {
    // 404
    http_response_code(404);
    if (file_exists('404.php')) {
        include '404.php';
    } else {
        echo '404 - Página no encontrada';
    }
}
?>
`;
    
    return {
      filename: 'index.php',
      content,
      path: 'index.php'
    };
  }
  
  /**
   * Genera README.md del proyecto
   */
  generateReadme(config) {
    const content = `# ${config.nombreComercial}

Proyecto web generado automáticamente con el Sistema de Conversión de Templates.

## Estructura del proyecto

\`\`\`
${config.nombreCarpetaProyecto}/
├── web.php                    # Página de inicio
├── [paginas].php              # Resto de páginas
├── _config.php                # Configuración
├── _funciones.php             # Funciones auxiliares
├── _diccionario.php           # Textos multiidioma
├── _urls.php                  # Mapeo de URLs
├── _header.php                # Header común
├── _footer.php                # Footer común
├── _menu.php                  # Menú de navegación
├── .htaccess                  # Reglas de reescritura
├── index.php                  # Punto de entrada
└── ${config.nombreCarpetaAssets}/  # Assets (CSS, JS, imágenes)
\`\`\`

## Configuración

1. **Subir archivos al servidor**
   - Subir todos los archivos a la raíz del dominio
   - Verificar permisos de archivos

2. **Configurar base de datos** (si aplica)
   - Editar \`_config.php\` con credenciales

3. **Verificar .htaccess**
   - Confirmar que mod_rewrite está activo
   - Ajustar RewriteBase si el sitio no está en la raíz

## Idiomas

- Idioma preferente: **${config.idiomaPreferente.toUpperCase()}**
${config.idiomaSecundario ? `- Idioma secundario: **${config.idiomaSecundario.toUpperCase()}**` : ''}

## URLs

- Idioma preferente: \`${config.dominio}/pagina\`
${config.idiomaSecundario ? `- Idioma secundario: \`${config.dominio}/${config.idiomaSecundario}/pagina\`` : ''}

## Contacto

- Email: ${config.emailContacto}
- Teléfono: ${config.telefono}
- Dominio: ${config.dominio}

---

Generado el ${new Date().toLocaleDateString('es-ES')}
`;
    
    return {
      filename: 'README.md',
      content,
      path: 'README.md'
    };
  }
  
  /**
   * Genera enlaces CSS
   */
  generateCSSLinks(cssAssets) {
    if (!cssAssets) return '    <!-- No CSS detected -->';
    
    let links = '';
    
    // CDN primero
    if (cssAssets.cdn && cssAssets.cdn.length > 0) {
      links += '    <!-- CSS CDN -->\n';
      cssAssets.cdn.forEach(css => {
        links += `    <link rel="stylesheet" href="${css.original}">\n`;
      });
    }
    
    // CSS locales
    if (cssAssets.local && cssAssets.local.length > 0) {
      links += '    <!-- CSS Local -->\n';
      cssAssets.local.forEach(css => {
        links += `    <link rel="stylesheet" href="/<?php echo CARPETA_ASSETS; ?>/${css.original}">\n`;
      });
    }
    
    return links.trim();
  }
  
  /**
   * Genera preloads de fuentes
   */
  generateFontPreloads(fontAssets) {
    if (!fontAssets || !fontAssets.local || fontAssets.local.length === 0) {
      return '    <!-- No fonts to preload -->';
    }
    
    let preloads = '';
    fontAssets.local.slice(0, 2).forEach(font => {
      const ext = path.extname(font.original).toLowerCase();
      const type = ext === '.woff2' ? 'font/woff2' : ext === '.woff' ? 'font/woff' : 'font/ttf';
      preloads += `    <link rel="preload" href="/<?php echo CARPETA_ASSETS; ?>/${font.original}" as="font" type="${type}" crossorigin>\n`;
    });
    
    return preloads.trim();
  }
  
  /**
   * Genera enlaces JavaScript
   */
  generateJSLinks(jsAssets) {
    if (!jsAssets) return '<!-- No JavaScript detected -->';
    
    let scripts = '';
    
    // CDN primero
    if (jsAssets.cdn && jsAssets.cdn.length > 0) {
      scripts += '<!-- JavaScript CDN -->\n';
      jsAssets.cdn.forEach(js => {
        scripts += `<script src="${js.original}"></script>\n`;
      });
    }
    
    // JS locales
    if (jsAssets.local && jsAssets.local.length > 0) {
      scripts += '<!-- JavaScript Local -->\n';
      jsAssets.local.forEach(js => {
        scripts += `<script src="/<?php echo CARPETA_ASSETS; ?>/${js.original}"></script>\n`;
      });
    }
    
    return scripts.trim();
  }
}

// Exportar instancia única
export const fileGenerator = new FileGenerator();

export default fileGenerator;

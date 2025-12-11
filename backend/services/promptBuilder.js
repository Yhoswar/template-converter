/**
 * Prompt Builder
 * Constructor de prompts para Claude API
 * Implementa los 8 prompts diseñados en el Punto C
 */

/**
 * PROMPT 1: Detección de Header, Footer y Menú
 */
export const buildDetectionPrompt = (html, fileName) => {
  return `Eres un experto en análisis de plantillas HTML. Tu tarea es identificar y extraer las siguientes secciones de este archivo HTML:

1. HEADER: La sección superior que contiene el logo y navegación principal
2. MENU: El menú de navegación (puede estar dentro o fuera del header)
3. FOOTER: La sección inferior con información de contacto, copyright, enlaces legales

IMPORTANTE:
- Extrae el HTML completo de cada sección, incluyendo TODAS las etiquetas de apertura y cierre
- Mantén TODAS las clases CSS, IDs y atributos originales
- Incluye imágenes, scripts inline y estilos que estén dentro de cada sección
- Si el menú está dentro del header, extráelo por separado también

ESTRATEGIA DE DETECCIÓN:
1. Buscar tags semánticos: <header>, <nav>, <footer>
2. Buscar por IDs: #header, #navigation, #navbar, #menu, #footer
3. Buscar por clases comunes: .header, .navbar, .nav, .menu, .footer, .site-header, .main-nav
4. Si no encuentras con lo anterior, analiza la estructura del documento y usa tu criterio

HTML A ANALIZAR:
${html}

RESPONDE ÚNICAMENTE con un objeto JSON en este formato exacto (sin markdown, sin explicaciones):
{
  "header": {
    "html": "<header>...</header>",
    "confidence": 0.95,
    "detectionMethod": "semantic_tag",
    "notes": "Detectado usando tag <header>"
  },
  "menu": {
    "html": "<nav>...</nav>",
    "confidence": 0.90,
    "detectionMethod": "semantic_tag",
    "notes": "Menú principal dentro de <nav>"
  },
  "footer": {
    "html": "<footer>...</footer>",
    "confidence": 0.98,
    "detectionMethod": "semantic_tag",
    "notes": "Footer detectado correctamente"
  },
  "warnings": []
}

Si no puedes detectar alguna sección con confianza, usa "html": null y explica en "notes".`;
};

/**
 * PROMPT 2: Extracción de Assets
 */
export const buildAssetsExtractionPrompt = (html) => {
  return `Analiza este código HTML y extrae TODAS las rutas de assets (CSS, JavaScript, imágenes, fuentes).

Clasifícalas en:
1. LOCALES: Rutas relativas o absolutas del proyecto (css/, js/, images/, ../assets/, etc.)
2. CDN: URLs externas (https://cdn.com, https://fonts.google.com, etc.)
3. INLINE: Estilos o scripts inline que necesitan extracción

HTML A ANALIZAR:
${html}

RESPONDE ÚNICAMENTE con JSON (sin markdown):
{
  "css": {
    "local": [
      { "original": "css/style.css", "tag": "<link rel='stylesheet' href='css/style.css'>" }
    ],
    "cdn": [
      { "original": "https://cdn.com/bootstrap.css", "tag": "<link...>" }
    ],
    "inline": [
      { "content": "body { margin: 0; }", "location": "line 45" }
    ]
  },
  "js": {
    "local": [
      { "original": "js/script.js", "tag": "<script src='js/script.js'></script>" }
    ],
    "cdn": [
      { "original": "https://code.jquery.com/jquery.min.js", "tag": "<script...>" }
    ],
    "inline": []
  },
  "images": {
    "local": [
      { "original": "images/logo.png", "tag": "<img src='images/logo.png' alt='Logo'>" }
    ],
    "cdn": []
  },
  "fonts": {
    "local": [],
    "cdn": []
  }
}`;
};

/**
 * PROMPT 3: Transformación de URLs
 */
export const buildTransformURLsPrompt = (originalHtml, assetsFolderName) => {
  return `Transforma este código HTML reemplazando las rutas de assets locales por el formato PHP del sistema.

REGLAS DE TRANSFORMACIÓN:
1. Rutas locales CSS: 
   ANTES: <link href="css/style.css">
   DESPUÉS: <link href="//www.<?= HostURL() ?>/${assetsFolderName}/css/style.css">

2. Rutas locales JS:
   ANTES: <script src="js/script.js">
   DESPUÉS: <script src="//www.<?= HostURL() ?>/${assetsFolderName}/js/script.js">

3. Rutas locales imágenes:
   ANTES: <img src="images/logo.png">
   DESPUÉS: <img src="//www.<?= HostURL() ?>/${assetsFolderName}/images/logo.png">

4. Background images en CSS inline:
   ANTES: style="background-image: url('images/bg.jpg')"
   DESPUÉS: style="background-image: url('//www.<?= HostURL() ?>/${assetsFolderName}/images/bg.jpg')"

5. NO MODIFICAR:
   - CDNs externos (https://cdn.com/...)
   - Data URIs (data:image/svg+xml;base64,...)
   - Anclas (#section)
   - JavaScript void (javascript:;)

HTML ORIGINAL:
${originalHtml}

RESPONDE ÚNICAMENTE con JSON:
{
  "transformedHtml": "<header>... HTML con rutas transformadas ...</header>",
  "transformations": [
    {
      "original": "css/style.css",
      "transformed": "//www.<?= HostURL() ?>/${assetsFolderName}/css/style.css",
      "type": "css"
    }
  ],
  "untransformed": [
    {
      "path": "https://cdn.com/bootstrap.css",
      "reason": "CDN externo - no modificado",
      "type": "css"
    }
  ]
}`;
};

/**
 * PROMPT 4: Generación de _menu.php
 */
export const buildMenuGenerationPrompt = (menuHtml, menuStructure, languagePreference, assetsFolderName) => {
  return `Genera el archivo _menu.php manteniendo la estructura HTML exacta de la plantilla pero transformando URLs y textos.

ESTRUCTURA HTML ORIGINAL DEL MENÚ:
${menuHtml}

ESTRUCTURA DEL MENÚ (del menu.txt):
${JSON.stringify(menuStructure, null, 2)}

IDIOMA PREFERENTE: ${languagePreference}
CARPETA ASSETS: ${assetsFolderName}

REGLAS DE TRANSFORMACIÓN:

1. MANTENER estructura HTML exacta (clases, divs, estructura)

2. TRANSFORMAR URLs:
   - Enlaces internos: <a href="/about"> → <a href="<?= construct_url('about', $_Lang) ?>">
   - Enlaces a home: <a href="/"> → <a href="<?= construct_url('', $_Lang) ?>">
   - Enlaces vacíos (submenús): <a href="#"> → mantener así

3. TRANSFORMAR textos a variables del diccionario:
   - "Inicio" → <?= $__['MenuInicio'] ?>
   - "La botiga" → <?= $__['MenuLaBotiga'] ?>

4. AÑADIR clases de menú activo:
   - En <li>: class="<?= $varName ?> [clases-originales]"

5. AÑADIR atributos de accesibilidad en submenús:
   - En enlace parent: class="AccessibilityLinkFirstLevelWithMenu"
   - En <ul> submenú: class="AccessibilityDropDownMenu" aria-expanded="false"

6. ACTUALIZAR rutas de imágenes (logos):
   - images/logo.png → //www.<?= HostURL() ?>/${assetsFolderName}/images/logo.png

RESPONDE ÚNICAMENTE con JSON:
{
  "menuPhp": "<?php\\n/* Menu generado */\\n<nav>...</nav>",
  "dictionaryKeys": [
    { "key": "MenuInicio", "ca": "Inici", "es": "Inicio" }
  ],
  "notes": []
}`;
};

/**
 * PROMPT 5: Generación de _footer.php
 */
export const buildFooterGenerationPrompt = (footerHtml, assetsFolderName, contactData) => {
  return `Genera el archivo _footer.php manteniendo la estructura HTML exacta pero transformando URLs y reemplazando textos fijos por variables cuando sea apropiado.

HTML ORIGINAL DEL FOOTER:
${footerHtml}

CARPETA ASSETS: ${assetsFolderName}
DATOS DE CONTACTO:
${JSON.stringify(contactData, null, 2)}

REGLAS:

1. MANTENER estructura HTML completa

2. TRANSFORMAR URLs:
   - Enlaces internos: href="/about" → href="<?= construct_url('about', $_Lang) ?>"
   - Enlaces legales: href="/aviso-legal" → href="<?= construct_url('aviso-legal', $_Lang) ?>"

3. REEMPLAZAR textos por variables:
   - "Aviso legal" → <?= $__['FooterAviso'] ?>
   - "Política de cookies" → <?= $__['FooterCookies'] ?>
   - Dirección/teléfono: mantener como texto (se cambia manualmente)

4. ACTUALIZAR rutas de imágenes

RESPONDE con JSON:
{
  "footerPhp": "<?php\\n...\\n?>",
  "dictionaryKeys": [
    { "key": "FooterAviso", "ca": "Avís legal", "es": "Aviso legal" }
  ],
  "manualTasks": []
}`;
};

/**
 * PROMPT 6: Detección de textos para diccionario
 */
export const buildDictionaryDetectionPrompt = (htmlFragment, languages) => {
  return `Analiza este fragmento de HTML y detecta qué textos deberían ser variables del diccionario.

HTML:
${htmlFragment}

CRITERIOS PARA VARIABLES:
✓ SÍ convertir:
- Textos de navegación (Inicio, Contacto)
- Títulos de secciones comunes
- Llamadas a acción (Ver más, Contactar)
- Enlaces legales (Aviso legal, Cookies)

✗ NO convertir:
- Direcciones físicas específicas
- Números de teléfono
- Emails
- Contenido único de cada página

IDIOMAS: ${languages.join(', ')}

RESPONDE con JSON:
{
  "replacements": [
    {
      "original": "Contact Us",
      "dictionaryKey": "ContactUs",
      "translations": {
        "en": "Contact Us",
        "es": "Contáctanos",
        "ca": "Contacta'ns"
      },
      "htmlBefore": "<button>Contact Us</button>",
      "htmlAfter": "<button><?= $__['ContactUs'] ?></button>",
      "confidence": 0.95
    }
  ],
  "ignored": []
}`;
};

/**
 * PROMPT 7: Generación de _urls.php y .htaccess
 */
export const buildUrlsConfigPrompt = (menuStructure, languagePreference, languageSecondary, domain) => {
  return `Genera los archivos _urls.php y .local.htaccess para el sistema de URLs multiidioma.

ESTRUCTURA DEL MENÚ:
${JSON.stringify(menuStructure, null, 2)}

IDIOMA PREFERENTE: ${languagePreference}
IDIOMA SECUNDARIO: ${languageSecondary}
DOMINIO: ${domain}

REGLAS:
1. Los archivos PHP se crean con el nombre del idioma preferente
2. _urls.php mapea slug preferente → slug secundario
3. .htaccess redirige slug secundario → archivo PHP

RESPONDE con JSON:
{
  "urlsPhp": "<?php\\n\\nglobal $_urls;\\n\\n$_urls['la-botiga']['es'] = 'la-tienda';\\n...",
  "htaccess": "RewriteEngine on\\nRewriteBase /\\n\\n...",
  "mapping": [
    {
      "phpFile": "la-botiga.php",
      "urlPreferente": "/la-botiga",
      "urlSecundario": "/es/la-tienda.html"
    }
  ]
}`;
};

/**
 * PROMPT 8: Validación final
 */
export const buildValidationPrompt = (generatedCode) => {
  return `Valida este código PHP/HTML generado y detecta posibles errores.

CÓDIGO:
${generatedCode}

VALIDACIONES:
1. SINTAXIS: Tags PHP correctos, HTML cerrado
2. RUTAS: Todas usan HostURL(), no hay rutas sin transformar
3. VARIABLES: Formato correcto $__['Key']
4. ESTRUCTURA: Includes presentes, tags semánticos
5. ASSETS: Imágenes con alt, scripts con defer si apropiado

RESPONDE con JSON:
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "suggestions": []
}`;
};

export default {
  buildDetectionPrompt,
  buildAssetsExtractionPrompt,
  buildTransformURLsPrompt,
  buildMenuGenerationPrompt,
  buildFooterGenerationPrompt,
  buildDictionaryDetectionPrompt,
  buildUrlsConfigPrompt,
  buildValidationPrompt
};

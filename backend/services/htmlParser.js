/**
 * HTML Parser
 * Parser y extractor de información de HTML usando Cheerio
 */

import * as cheerio from 'cheerio';
import { normalizeAssetPath, isCDN, isDataURI, isSpecialLink } from '../utils/slugify.js';

/**
 * Clase para parsear HTML
 */
class HTMLParser {
  
  /**
   * Carga HTML y retorna instancia de Cheerio
   */
  load(html) {
    return cheerio.load(html, {
      decodeEntities: false,
      xmlMode: false
    });
  }
  
  /**
   * Detecta componentes del HTML (header, menu, footer)
   * Versión sin IA - usa selectores CSS
   */
  detectComponents(html) {
    const $ = this.load(html);
    
    const result = {
      header: this.detectHeader($),
      menu: this.detectMenu($),
      footer: this.detectFooter($)
    };
    
    return result;
  }
  
  /**
   * Detecta header usando selectores comunes
   */
  detectHeader($) {
    const selectors = [
      'header',
      '[role="banner"]',
      '#header',
      '#site-header',
      '#masthead',
      '.header',
      '.site-header',
      '.page-header'
    ];
    
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return {
          html: $.html(element),
          selector,
          confidence: 0.85,
          detectionMethod: 'css_selector',
          notes: `Detectado usando selector: ${selector}`
        };
      }
    }
    
    return {
      html: null,
      confidence: 0,
      detectionMethod: 'not_found',
      notes: 'No se pudo detectar el header con selectores estándar'
    };
  }
  
  /**
   * Detecta menú usando selectores comunes
   */
  detectMenu($) {
    const selectors = [
      'nav',
      '[role="navigation"]',
      '#navigation',
      '#navbar',
      '#menu',
      '#main-menu',
      '.navbar',
      '.nav',
      '.menu',
      '.main-nav',
      '.navigation'
    ];
    
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return {
          html: $.html(element),
          selector,
          confidence: 0.85,
          detectionMethod: 'css_selector',
          notes: `Detectado usando selector: ${selector}`
        };
      }
    }
    
    return {
      html: null,
      confidence: 0,
      detectionMethod: 'not_found',
      notes: 'No se pudo detectar el menú con selectores estándar'
    };
  }
  
  /**
   * Detecta footer usando selectores comunes
   */
  detectFooter($) {
    const selectors = [
      'footer',
      '[role="contentinfo"]',
      '#footer',
      '#site-footer',
      '#colophon',
      '.footer',
      '.site-footer',
      '.page-footer'
    ];
    
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return {
          html: $.html(element),
          selector,
          confidence: 0.85,
          detectionMethod: 'css_selector',
          notes: `Detectado usando selector: ${selector}`
        };
      }
    }
    
    return {
      html: null,
      confidence: 0,
      detectionMethod: 'not_found',
      notes: 'No se pudo detectar el footer con selectores estándar'
    };
  }
  
  /**
   * Extrae todos los assets del HTML
   */
  extractAssets(html) {
    const $ = this.load(html);
    
    return {
      css: this.extractCSS($),
      js: this.extractJS($),
      images: this.extractImages($),
      fonts: this.extractFonts($)
    };
  }
  
  /**
   * Extrae archivos CSS
   */
  extractCSS($) {
    const css = {
      local: [],
      cdn: [],
      inline: []
    };
    
    // CSS externos (link tags)
    $('link[rel="stylesheet"], link[rel="preload"][as="style"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (!href) return;
      
      const tag = $.html(elem);
      
      if (isCDN(href) || isDataURI(href)) {
        css.cdn.push({ original: href, tag });
      } else {
        const normalized = normalizeAssetPath(href);
        css.local.push({ original: normalized, tag });
      }
    });
    
    // CSS inline (style tags)
    $('style').each((i, elem) => {
      const content = $(elem).html();
      if (content && content.trim()) {
        css.inline.push({
          content: content.trim(),
          location: `style tag ${i + 1}`
        });
      }
    });
    
    // CSS inline en atributos style
    $('[style]').each((i, elem) => {
      const style = $(elem).attr('style');
      if (style && style.trim()) {
        // Detectar si tiene background-image u otras URLs
        if (style.includes('url(')) {
          css.inline.push({
            content: style.trim(),
            location: `inline style on ${elem.tagName}`,
            element: $.html(elem).substring(0, 100)
          });
        }
      }
    });
    
    return css;
  }
  
  /**
   * Extrae archivos JavaScript
   */
  extractJS($) {
    const js = {
      local: [],
      cdn: [],
      inline: []
    };
    
    // JS externos (script tags con src)
    $('script[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (!src) return;
      
      const tag = $.html(elem);
      
      if (isCDN(src) || isDataURI(src)) {
        js.cdn.push({ original: src, tag });
      } else {
        const normalized = normalizeAssetPath(src);
        js.local.push({ original: normalized, tag });
      }
    });
    
    // JS inline (script tags sin src)
    $('script:not([src])').each((i, elem) => {
      const content = $(elem).html();
      if (content && content.trim() && content.trim().length > 10) {
        js.inline.push({
          content: content.trim().substring(0, 200) + '...',
          location: `script tag ${i + 1}`
        });
      }
    });
    
    return js;
  }
  
  /**
   * Extrae imágenes
   */
  extractImages($) {
    const images = {
      local: [],
      cdn: []
    };
    
    // Imágenes en <img> tags
    $('img[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (!src) return;
      
      const tag = $.html(elem);
      
      if (isCDN(src) || isDataURI(src)) {
        images.cdn.push({ original: src, tag });
      } else {
        const normalized = normalizeAssetPath(src);
        images.local.push({ original: normalized, tag });
      }
    });
    
    // Imágenes en srcset
    $('[srcset]').each((i, elem) => {
      const srcset = $(elem).attr('srcset');
      if (!srcset) return;
      
      // Parsear srcset (formato: "url 1x, url 2x")
      const urls = srcset.split(',').map(item => item.trim().split(/\s+/)[0]);
      
      urls.forEach(url => {
        if (!isCDN(url) && !isDataURI(url)) {
          const normalized = normalizeAssetPath(url);
          images.local.push({ 
            original: normalized, 
            tag: $.html(elem),
            fromSrcset: true
          });
        }
      });
    });
    
    // Background images en CSS inline
    $('[style*="background"]').each((i, elem) => {
      const style = $(elem).attr('style');
      if (!style) return;
      
      // Extraer URLs de background-image
      const urlMatches = style.match(/url\(['"]?([^'")]+)['"]?\)/g);
      if (urlMatches) {
        urlMatches.forEach(match => {
          const url = match.replace(/url\(['"]?|['"]?\)/g, '');
          if (!isCDN(url) && !isDataURI(url)) {
            const normalized = normalizeAssetPath(url);
            images.local.push({
              original: normalized,
              tag: $.html(elem).substring(0, 100),
              fromCss: true
            });
          }
        });
      }
    });
    
    return images;
  }
  
  /**
   * Extrae fuentes
   */
  extractFonts($) {
    const fonts = {
      local: [],
      cdn: []
    };
    
    // Fuentes en <link> (Google Fonts, etc.)
    $('link[href*="fonts"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (!href) return;
      
      const tag = $.html(elem);
      
      if (isCDN(href)) {
        fonts.cdn.push({ original: href, tag });
      }
    });
    
    // Fuentes en CSS inline (@font-face)
    $('style').each((i, elem) => {
      const content = $(elem).html();
      if (!content) return;
      
      // Buscar @font-face con url()
      const fontFaceMatches = content.match(/@font-face\s*{[^}]*}/g);
      if (fontFaceMatches) {
        fontFaceMatches.forEach(fontFace => {
          const urlMatches = fontFace.match(/url\(['"]?([^'")]+)['"]?\)/g);
          if (urlMatches) {
            urlMatches.forEach(match => {
              const url = match.replace(/url\(['"]?|['"]?\)/g, '');
              if (!isCDN(url) && !isDataURI(url)) {
                const normalized = normalizeAssetPath(url);
                fonts.local.push({
                  original: normalized,
                  tag: fontFace.substring(0, 100)
                });
              }
            });
          }
        });
      }
    });
    
    return fonts;
  }
  
  /**
   * Extrae meta tags
   */
  extractMetaTags($) {
    const meta = {};
    
    $('meta').each((i, elem) => {
      const name = $(elem).attr('name') || $(elem).attr('property');
      const content = $(elem).attr('content');
      
      if (name && content) {
        meta[name] = content;
      }
    });
    
    return meta;
  }
  
  /**
   * Extrae title del documento
   */
  extractTitle(html) {
    const $ = this.load(html);
    return $('title').text().trim();
  }
  
  /**
   * Lista todos los enlaces internos
   */
  extractInternalLinks(html) {
    const $ = this.load(html);
    const links = [];
    
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (!href) return;
      
      // Solo enlaces internos (no externos, no anclas, no javascript)
      if (!isCDN(href) && !isSpecialLink(href)) {
        const text = $(elem).text().trim();
        links.push({
          href: normalizeAssetPath(href),
          text,
          tag: $.html(elem)
        });
      }
    });
    
    return links;
  }
  
  /**
   * Cuenta elementos del HTML
   */
  getStats(html) {
    const $ = this.load(html);
    
    return {
      totalElements: $('*').length,
      images: $('img').length,
      links: $('a').length,
      scripts: $('script').length,
      stylesheets: $('link[rel="stylesheet"]').length,
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length
      }
    };
  }
}

// Exportar instancia única
export const htmlParser = new HTMLParser();

export default htmlParser;

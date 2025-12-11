/**
 * Menu Parser
 * Parser de archivos menu.txt con estructura jerárquica
 */

import {
  slugify,
  slugToVariable,
  textToDictionaryKey,
  slugToPhpFilename,
  extractSlugFromMenuText,
  extractSeoFromMenuText,
  detectPageMarkers,
  cleanMenuText
} from '../utils/slugify.js';
import { ConversionError } from '../utils/errorHandler.js';

/**
 * Clase para parsear menu.txt
 */
class MenuParser {
  
  /**
   * Parse completo del archivo menu.txt
   */
  parse(content) {
    try {
      const lines = content.split('\n');
      
      // Separar por idiomas (usando el separador ---)
      const sections = this.splitByLanguages(lines);
      
      if (sections.length === 0) {
        throw new ConversionError(
          'El archivo menu.txt está vacío',
          'menu_parsing'
        );
      }
      
      // Parsear primera sección (idioma preferente)
      const primaryLanguage = this.parseSection(sections[0]);
      
      // Parsear segunda sección si existe (idioma secundario)
      const secondaryLanguage = sections[1] ? this.parseSection(sections[1]) : null;
      
      // Combinar información
      const combined = this.combineLanguages(primaryLanguage, secondaryLanguage);
      
      return {
        primary: primaryLanguage,
        secondary: secondaryLanguage,
        combined,
        hasSecondaryLanguage: secondaryLanguage !== null
      };
      
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new ConversionError(
        'Error parseando menu.txt',
        'menu_parsing',
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Divide el contenido por idiomas (separador: línea con solo guiones)
   */
  splitByLanguages(lines) {
    const sections = [];
    let currentSection = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Línea separadora (solo guiones, mínimo 10)
      if (/^-{10,}$/.test(trimmed)) {
        if (currentSection.length > 0) {
          sections.push(currentSection);
          currentSection = [];
        }
      } else if (trimmed.length > 0) {
        currentSection.push(line);
      }
    }
    
    // Añadir última sección
    if (currentSection.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  }
  
  /**
   * Parsea una sección del menú (un idioma)
   */
  parseSection(lines) {
    const pages = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detectar nivel de indentación
      const indent = this.getIndentLevel(line);
      const text = line.trim();
      
      // Saltar líneas vacías
      if (!text || text.startsWith('#')) continue;
      
      // Remover guión inicial si existe
      const cleanText = text.replace(/^-\s*/, '');
      
      // Parsear página
      const page = this.parsePage(cleanText, indent);
      
      // Añadir al nivel correcto
      if (indent === 0) {
        pages.push(page);
      } else {
        this.addToParent(pages, page, indent);
      }
    }
    
    return pages;
  }
  
  /**
   * Detecta nivel de indentación (0, 1, 2, etc.)
   */
  getIndentLevel(line) {
    const leadingSpaces = line.match(/^(\s*)/)[1].length;
    
    // Cada 2 espacios o 1 tab = 1 nivel
    if (line.startsWith('\t')) {
      return line.match(/^(\t*)/)[1].length;
    }
    
    return Math.floor(leadingSpaces / 2);
  }
  
  /**
   * Parsea una línea individual del menú
   */
  parsePage(text, level) {
    const markers = detectPageMarkers(text);
    const cleanedText = cleanMenuText(text);
    const seoDescription = extractSeoFromMenuText(text);
    
    // Generar slug
    const slug = extractSlugFromMenuText(text);
    
    // Detectar si es home/inicio
    const isHome = level === 0 && (
      slug === 'inicio' || 
      slug === 'inici' || 
      slug === 'home' || 
      slug === 'index'
    );
    
    return {
      name: cleanedText,
      slug: markers.skipPage ? null : slug,
      seo: seoDescription || cleanedText,
      level,
      isHome,
      skipPage: markers.skipPage,           // (*) - no genera archivo
      pageNoSeo: markers.pageNoSeo,         // (**) - genera archivo sin SEO
      isAutomanaged: markers.isAutomanaged, // (autogestionable)
      hasSeo: markers.hasSeo,
      varName: slug ? slugToVariable(slug) : null,
      phpFile: (!markers.skipPage && !markers.isAutomanaged && slug) 
        ? slugToPhpFilename(slug, isHome) 
        : null,
      dictionaryKey: cleanedText ? textToDictionaryKey(cleanedText) : null,
      children: []
    };
  }
  
  /**
   * Añade una página como hijo del padre correcto según nivel
   */
  addToParent(pages, page, level) {
    if (level === 1) {
      // Añadir al último elemento de nivel 0
      const parent = pages[pages.length - 1];
      if (parent) {
        parent.children.push(page);
      }
    } else if (level === 2) {
      // Añadir al último elemento de nivel 1
      const parent = pages[pages.length - 1];
      if (parent && parent.children.length > 0) {
        const subParent = parent.children[parent.children.length - 1];
        subParent.children.push(page);
      }
    }
    // Soporta hasta 3 niveles de profundidad
  }
  
  /**
   * Combina información de dos idiomas
   */
  combineLanguages(primary, secondary) {
    if (!secondary) {
      return primary.map(page => ({
        ...page,
        translations: {}
      }));
    }
    
    const combined = [];
    
    for (let i = 0; i < primary.length; i++) {
      const primaryPage = primary[i];
      const secondaryPage = secondary[i] || null;
      
      combined.push({
        ...primaryPage,
        translations: secondaryPage ? {
          name: secondaryPage.name,
          slug: secondaryPage.slug,
          seo: secondaryPage.seo
        } : {},
        children: this.combineLanguages(
          primaryPage.children || [],
          secondaryPage ? secondaryPage.children || [] : []
        )
      });
    }
    
    return combined;
  }
  
  /**
   * Genera URLs mapping para _urls.php
   */
  generateUrlsMapping(menuData, primaryLang, secondaryLang) {
    const mapping = [];
    
    const traverse = (pages) => {
      for (const page of pages) {
        if (page.phpFile && page.slug && page.translations.slug) {
          mapping.push({
            primarySlug: page.slug,
            secondarySlug: page.translations.slug,
            phpFile: page.phpFile
          });
        }
        
        if (page.children && page.children.length > 0) {
          traverse(page.children);
        }
      }
    };
    
    traverse(menuData.combined);
    
    return mapping;
  }
  
  /**
   * Genera lista de archivos PHP a crear
   */
  getPhpFilesToCreate(menuData) {
    const files = [];
    
    const traverse = (pages) => {
      for (const page of pages) {
        if (page.phpFile) {
          files.push({
            filename: page.phpFile,
            slug: page.slug,
            name: page.name,
            varName: page.varName,
            dictionaryKey: page.dictionaryKey,
            seo: page.seo,
            isHome: page.isHome
          });
        }
        
        if (page.children && page.children.length > 0) {
          traverse(page.children);
        }
      }
    };
    
    traverse(menuData.combined);
    
    return files;
  }
  
  /**
   * Genera claves del diccionario para el menú
   */
  generateDictionaryKeys(menuData, primaryLang, secondaryLang) {
    const keys = [];
    
    const traverse = (pages) => {
      for (const page of pages) {
        if (page.dictionaryKey) {
          // Clave para el menú
          keys.push({
            key: `Menu${page.dictionaryKey}`,
            [primaryLang]: page.name,
            ...(page.translations.name && { [secondaryLang]: page.translations.name })
          });
          
          // Claves para la página (Title, KeyWords, Description)
          if (page.phpFile) {
            keys.push(
              {
                key: `${page.dictionaryKey}Title`,
                [primaryLang]: `${page.name} - [Nombre Empresa]`,
                ...(page.translations.name && { 
                  [secondaryLang]: `${page.translations.name} - [Nombre Empresa]` 
                })
              },
              {
                key: `${page.dictionaryKey}KeyWords`,
                [primaryLang]: page.seo,
                ...(page.translations.seo && { [secondaryLang]: page.translations.seo })
              },
              {
                key: `${page.dictionaryKey}Description`,
                [primaryLang]: page.seo,
                ...(page.translations.seo && { [secondaryLang]: page.translations.seo })
              }
            );
          }
        }
        
        if (page.children && page.children.length > 0) {
          traverse(page.children);
        }
      }
    };
    
    traverse(menuData.combined);
    
    return keys;
  }
  
  /**
   * Genera estructura para el menú HTML
   */
  generateMenuStructure(menuData) {
    return menuData.combined.map(page => ({
      name: page.name,
      slug: page.slug,
      url: page.slug ? `/${page.slug}` : '#',
      varName: page.varName,
      dictionaryKey: page.dictionaryKey,
      hasSubmenu: page.children && page.children.length > 0,
      skipPage: page.skipPage,
      submenu: page.children ? this.generateMenuStructure({ combined: page.children }) : []
    }));
  }
}

// Exportar instancia única
export const menuParser = new MenuParser();

export default menuParser;

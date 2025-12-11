/**
 * Conversion Controller
 * Lógica de negocio para conversión de templates
 */

import fs from 'fs-extra';
import path from 'path';
import unzipper from 'unzipper';
import { getSessionPath, getOutputPath } from '../middleware/fileUpload.js';
import { validateProjectConfig, validateTemplateZip, validateExtractedZip, validateMenuStructure, validateMapping } from '../utils/validators.js';
import { generateProjectFolderName, generateAssetsFolderName } from '../utils/slugify.js';
import { menuParser } from '../services/menuParser.js';
import { htmlParser } from '../services/htmlParser.js';
import { fileGenerator } from '../services/fileGenerator.js';
import { zipBuilder } from '../services/zipBuilder.js';
import { claudeAPI } from '../services/claudeAPI.js';
import { buildDetectionPrompt, buildAssetsExtractionPrompt } from '../services/promptBuilder.js';
import { ConversionError, asyncHandler } from '../utils/errorHandler.js';

/**
 * PASO 1: Upload - Subir ZIP y configuración
 */
export const uploadTemplate = asyncHandler(async (req, res) => {
  const session = req.session;
  
  // Validar que se subió archivo
  if (!req.file) {
    throw new ConversionError('No se subió ningún archivo', 'upload');
  }
  
  // Validar configuración del proyecto
  const config = JSON.parse(req.body.config || '{}');
  validateProjectConfig(config);
  
  // Validar archivo ZIP
  validateTemplateZip({
    name: req.file.originalname,
    size: req.file.size
  });
  
  // Guardar configuración en sesión
  session.setConfig(config);
  session.setFiles({
    templateZip: req.file.path
  });
  
  // Extraer ZIP
  const extractedPath = getSessionPath(req.sessionId, 'extracted');
  await fs.ensureDir(extractedPath);
  
  await fs.createReadStream(req.file.path)
    .pipe(unzipper.Extract({ path: extractedPath }))
    .promise();
  
  // Listar archivos extraídos
  const allFiles = await getAllFiles(extractedPath);
  const htmlFiles = allFiles.filter(f => path.extname(f).toLowerCase() === '.html');
  
  // Validar contenido del ZIP
  validateExtractedZip(allFiles);
  
  // Actualizar sesión
  session.setFiles({
    extractedPath,
    htmlFiles: htmlFiles.map(f => path.relative(extractedPath, f))
  });
  session.updateStatus('uploaded');
  
  res.json({
    success: true,
    sessionId: req.sessionId,
    data: {
      config: session.config,
      htmlFiles: session.files.htmlFiles,
      totalFiles: allFiles.length,
      totalHtmlFiles: htmlFiles.length
    }
  });
});

/**
 * PASO 2: Analyze - Analizar HTML y menu.txt
 */
export const analyzeTemplate = asyncHandler(async (req, res) => {
  const session = req.session;
  
  // Validar que se subió menu.txt
  if (!req.file) {
    throw new ConversionError('No se subió el archivo menu.txt', 'analyze');
  }
  
  // Leer contenido de menu.txt
  const menuContent = await fs.readFile(req.file.path, 'utf-8');
  
  // Parsear menu.txt
  const menuData = menuParser.parse(menuContent);
  validateMenuStructure(menuData);
  
  // Determinar si usar Claude API o selectores CSS para detección
  const useClaudeAPI = req.body.useClaudeAPI === 'true' && process.env.ANTHROPIC_API_KEY;
  
  // Detectar componentes en HTMLs
  const components = {};
  const assets = {};
  
  for (const htmlFile of session.files.htmlFiles) {
    const htmlPath = path.join(session.files.extractedPath, htmlFile);
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    
    if (useClaudeAPI) {
      // Usar Claude API para detección inteligente
      try {
        const prompt = buildDetectionPrompt(htmlContent, htmlFile);
        const detection = await claudeAPI.sendMessageAndParseJSON(prompt);
        components[htmlFile] = detection;
        
        // Extraer assets con Claude
        const assetsPrompt = buildAssetsExtractionPrompt(htmlContent);
        const assetsData = await claudeAPI.sendMessageAndParseJSON(assetsPrompt);
        assets[htmlFile] = assetsData;
      } catch (error) {
        console.warn(`Error usando Claude API para ${htmlFile}, usando fallback:`, error.message);
        // Fallback a selectores CSS
        components[htmlFile] = htmlParser.detectComponents(htmlContent);
        assets[htmlFile] = htmlParser.extractAssets(htmlContent);
      }
    } else {
      // Usar selectores CSS (sin Claude API)
      components[htmlFile] = htmlParser.detectComponents(htmlContent);
      assets[htmlFile] = htmlParser.extractAssets(htmlContent);
    }
  }
  
  // Guardar análisis en sesión
  session.setAnalysis({
    menuStructure: menuData,
    components,
    assets,
    usedClaudeAPI: useClaudeAPI
  });
  session.setFiles({
    menuTxt: req.file.path
  });
  session.updateStatus('analyzed');
  
  res.json({
    success: true,
    sessionId: req.sessionId,
    data: {
      menuStructure: {
        pages: menuData.combined,
        hasSecondaryLanguage: menuData.hasSecondaryLanguage,
        totalPages: menuData.combined.length
      },
      components: Object.keys(components).map(file => ({
        file,
        header: components[file].header.confidence,
        menu: components[file].menu.confidence,
        footer: components[file].footer.confidence
      })),
      detectionMethod: useClaudeAPI ? 'claude_api' : 'css_selectors'
    }
  });
});

/**
 * PASO 3: Mapping - Validar mapeo de páginas
 */
export const validateMappingStep = asyncHandler(async (req, res) => {
  const session = req.session;
  
  // Recibir mapeo del cliente
  const mapping = req.body.mapping;
  
  if (!mapping || typeof mapping !== 'object') {
    throw new ConversionError('Mapeo inválido', 'mapping');
  }
  
  // Obtener páginas del menú
  const menuPages = session.analysis.menuStructure.combined;
  const htmlFiles = session.files.htmlFiles;
  
  // Validar mapeo
  validateMapping(mapping, menuPages, htmlFiles);
  
  // Guardar mapeo en sesión
  session.setMapping(mapping);
  session.updateStatus('mapped');
  
  res.json({
    success: true,
    sessionId: req.sessionId,
    data: {
      mapping,
      totalMapped: Object.keys(mapping).length
    }
  });
});

/**
 * Obtener todos los archivos recursivamente
 */
async function getAllFiles(dir) {
  const files = [];
  
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Copiar carpeta recursivamente excluyendo archivos HTML
 */
async function copyAssetsFolder(src, dest, exclude = ['.html']) {
  await fs.ensureDir(dest);
  
  const items = await fs.readdir(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = await fs.stat(srcPath);
    
    if (stat.isDirectory()) {
      await copyAssetsFolder(srcPath, destPath, exclude);
    } else {
      const ext = path.extname(item).toLowerCase();
      if (!exclude.includes(ext)) {
        await fs.copy(srcPath, destPath);
      }
    }
  }
}

/**
 * PASO 4: Generate - Generar archivos PHP y crear ZIP
 */
export const generateProject = asyncHandler(async (req, res) => {
  const session = req.session;
  session.updateStatus('generating');
  
  const config = session.config;
  const menuData = session.analysis.menuStructure;
  const mapping = session.mapping;
  const components = session.analysis.components;
  const assetsData = session.analysis.assets;
  
  // Crear carpetas de trabajo
  const generatedDir = getSessionPath(req.sessionId, 'generated');
  const assetsDir = getSessionPath(req.sessionId, 'assets');
  await fs.ensureDir(generatedDir);
  await fs.ensureDir(assetsDir);
  
  // 1. Generar archivos de configuración
  const configFile = fileGenerator.generateConfigFile(config);
  await fs.writeFile(path.join(generatedDir, configFile.filename), configFile.content);
  
  const functionsFile = fileGenerator.generateFunctionsFile();
  await fs.writeFile(path.join(generatedDir, functionsFile.filename), functionsFile.content);
  
  // 2. Generar diccionario
  const dictionaryKeys = menuParser.generateDictionaryKeys(
    menuData,
    config.idiomaPreferente,
    config.idiomaSecundario
  );
  const dictionaryFile = fileGenerator.generateDictionaryFile(
    dictionaryKeys,
    config.idiomaPreferente,
    config.idiomaSecundario
  );
  await fs.writeFile(path.join(generatedDir, dictionaryFile.filename), dictionaryFile.content);
  
  // 3. Generar URLs
  const urlsMapping = menuParser.generateUrlsMapping(
    menuData,
    config.idiomaPreferente,
    config.idiomaSecundario
  );
  const urlsFile = fileGenerator.generateUrlsFile(
    urlsMapping,
    config.idiomaPreferente,
    config.idiomaSecundario
  );
  await fs.writeFile(path.join(generatedDir, urlsFile.filename), urlsFile.content);
  
  // 4. Generar .htaccess
  const htaccessFile = fileGenerator.generateHtaccessFile(config);
  await fs.writeFile(path.join(generatedDir, htaccessFile.filename), htaccessFile.content);
  
  // 5. Generar index.php
  const indexFile = fileGenerator.generateIndexFile();
  await fs.writeFile(path.join(generatedDir, indexFile.filename), indexFile.content);
  
  // 6. Generar _header.php
  // Combinar assets de todos los HTMLs
  const allAssets = {
    css: { local: [], cdn: [], inline: [] },
    js: { local: [], cdn: [], inline: [] },
    images: { local: [], cdn: [] },
    fonts: { local: [], cdn: [] }
  };
  
  Object.values(assetsData).forEach(assets => {
    if (assets.css) {
      allAssets.css.local.push(...(assets.css.local || []));
      allAssets.css.cdn.push(...(assets.css.cdn || []));
      allAssets.css.inline.push(...(assets.css.inline || []));
    }
    if (assets.js) {
      allAssets.js.local.push(...(assets.js.local || []));
      allAssets.js.cdn.push(...(assets.js.cdn || []));
    }
    if (assets.images) {
      allAssets.images.local.push(...(assets.images.local || []));
      allAssets.images.cdn.push(...(assets.images.cdn || []));
    }
    if (assets.fonts) {
      allAssets.fonts.local.push(...(assets.fonts.local || []));
      allAssets.fonts.cdn.push(...(assets.fonts.cdn || []));
    }
  });
  
  // Eliminar duplicados
  allAssets.css.local = [...new Set(allAssets.css.local.map(a => a.original))].map(original => ({ original }));
  allAssets.css.cdn = [...new Set(allAssets.css.cdn.map(a => a.original))].map(original => ({ original }));
  allAssets.js.local = [...new Set(allAssets.js.local.map(a => a.original))].map(original => ({ original }));
  allAssets.js.cdn = [...new Set(allAssets.js.cdn.map(a => a.original))].map(original => ({ original }));
  
  const headerFile = fileGenerator.generateHeaderFile(config, allAssets);
  await fs.writeFile(path.join(generatedDir, headerFile.filename), headerFile.content);
  
  // 7. Generar _footer.php
  const contactData = {
    nombreComercial: config.nombreComercial,
    telefono: config.telefono,
    email: config.emailContacto
  };
  const footerFile = fileGenerator.generateFooterFile(config, contactData);
  await fs.writeFile(path.join(generatedDir, footerFile.filename), footerFile.content);
  
  // 8. Generar _menu.php
  const menuStructure = menuParser.generateMenuStructure(menuData);
  const menuFile = fileGenerator.generateMenuFile(menuStructure, config);
  await fs.writeFile(path.join(generatedDir, menuFile.filename), menuFile.content);
  
  // 9. Generar páginas PHP
  const phpFiles = menuParser.getPhpFilesToCreate(menuData);
  const generatedPages = [];
  
  for (const pageData of phpFiles) {
    const pageFile = fileGenerator.generatePageFile(pageData, config);
    await fs.writeFile(path.join(generatedDir, pageFile.filename), pageFile.content);
    generatedPages.push(pageFile.filename);
  }
  
  // 10. Generar README.md
  const readmeFile = fileGenerator.generateReadme(config);
  await fs.writeFile(path.join(generatedDir, readmeFile.filename), readmeFile.content);
  
  // 11. Copiar assets
  const assetsFolderName = config.nombreCarpetaAssets;
  const assetsDest = path.join(assetsDir, assetsFolderName);
  await copyAssetsFolder(session.files.extractedPath, assetsDest);
  
  // 12. Crear ZIP final
  const projectFolderName = config.nombreCarpetaProyecto;
  const zipFilename = zipBuilder.generateZipFilename(projectFolderName);
  const zipPath = getOutputPath(zipFilename);
  
  const zipResult = await zipBuilder.createProjectZip(
    generatedDir,
    assetsDest,
    zipPath,
    projectFolderName
  );
  
  // Validar ZIP
  const validation = await zipBuilder.validateZip(zipPath);
  
  if (!validation.valid) {
    throw new ConversionError('ZIP generado inválido', 'generation', validation);
  }
  
  // Actualizar sesión
  session.setGenerated({
    phpFiles: generatedPages,
    zipPath,
    zipSize: validation.size,
    zipSizeFormatted: validation.sizeFormatted
  });
  session.updateStatus('completed');
  
  res.json({
    success: true,
    sessionId: req.sessionId,
    data: {
      projectName: projectFolderName,
      totalPhpFiles: generatedPages.length,
      phpFiles: generatedPages,
      zipPath: `/api/download/${req.sessionId}`,
      zipSize: validation.sizeFormatted,
      downloadUrl: `/api/download/${req.sessionId}`
    }
  });
});

/**
 * Descargar ZIP generado
 */
export const downloadProject = asyncHandler(async (req, res) => {
  const session = req.session;
  
  if (!session.generated.zipPath) {
    throw new ConversionError('Proyecto no generado aún', 'download');
  }
  
  const zipPath = session.generated.zipPath;
  
  if (!await fs.pathExists(zipPath)) {
    throw new ConversionError('Archivo ZIP no encontrado', 'download');
  }
  
  const filename = path.basename(zipPath);
  
  res.download(zipPath, filename, (err) => {
    if (err) {
      console.error('Error descargando archivo:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error descargando archivo'
        });
      }
    }
  });
});

/**
 * Obtener estado de la sesión
 */
export const getSessionStatus = asyncHandler(async (req, res) => {
  const session = req.session;
  
  res.json({
    success: true,
    sessionId: req.sessionId,
    data: {
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      config: session.config,
      progress: {
        uploaded: session.status !== 'created',
        analyzed: ['analyzed', 'mapped', 'generating', 'completed'].includes(session.status),
        mapped: ['mapped', 'generating', 'completed'].includes(session.status),
        generated: session.status === 'completed'
      },
      errors: session.errors
    }
  });
});

/**
 * Limpiar archivos de sesión
 */
export const cleanupSession = asyncHandler(async (req, res) => {
  const session = req.session;
  const sessionPath = getSessionPath(req.sessionId);
  
  // Eliminar archivos físicos
  if (await fs.pathExists(sessionPath)) {
    await fs.remove(sessionPath);
  }
  
  // Eliminar ZIP generado si existe
  if (session.generated.zipPath && await fs.pathExists(session.generated.zipPath)) {
    await fs.remove(session.generated.zipPath);
  }
  
  res.json({
    success: true,
    message: 'Sesión limpiada correctamente'
  });
});

export default {
  uploadTemplate,
  analyzeTemplate,
  validateMappingStep,
  generateProject,
  downloadProject,
  getSessionStatus,
  cleanupSession
};

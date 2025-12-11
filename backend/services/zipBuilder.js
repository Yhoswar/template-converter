/**
 * ZIP Builder
 * Constructor del archivo ZIP final con todo el proyecto
 */

import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { ConversionError } from '../utils/errorHandler.js';

/**
 * Clase para construir ZIP
 */
class ZipBuilder {
  
  /**
   * Crea ZIP del proyecto completo
   * 
   * @param {string} sourceDir - Carpeta con archivos PHP generados
   * @param {string} assetsDir - Carpeta con assets copiados
   * @param {string} outputPath - Ruta donde guardar el ZIP
   * @param {string} projectName - Nombre del proyecto (carpeta raíz en ZIP)
   * @returns {Promise<object>} - Info del ZIP creado
   */
  async createProjectZip(sourceDir, assetsDir, outputPath, projectName) {
    try {
      // Verificar que existen las carpetas
      if (!await fs.pathExists(sourceDir)) {
        throw new ConversionError(
          `Carpeta de origen no encontrada: ${sourceDir}`,
          'zip_builder'
        );
      }
      
      // Crear carpeta de salida si no existe
      await fs.ensureDir(path.dirname(outputPath));
      
      // Crear stream de escritura
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Máxima compresión
      });
      
      // Promesa para esperar fin del ZIP
      const zipPromise = new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve({
            path: outputPath,
            size: archive.pointer(),
            totalFiles: this.fileCount
          });
        });
        
        archive.on('error', (err) => {
          reject(new ConversionError(
            'Error creando ZIP',
            'zip_builder',
            { originalError: err.message }
          ));
        });
        
        output.on('error', (err) => {
          reject(new ConversionError(
            'Error escribiendo ZIP',
            'zip_builder',
            { originalError: err.message }
          ));
        });
      });
      
      // Conectar archive con output
      archive.pipe(output);
      
      // Contador de archivos
      this.fileCount = 0;
      
      // Añadir archivos PHP (raíz del proyecto)
      await this.addPhpFiles(archive, sourceDir, projectName);
      
      // Añadir assets (en subcarpeta)
      if (await fs.pathExists(assetsDir)) {
        const assetsFolderName = path.basename(assetsDir);
        await this.addAssets(archive, assetsDir, `${projectName}/${assetsFolderName}`);
      }
      
      // Finalizar ZIP
      await archive.finalize();
      
      // Esperar a que termine
      return await zipPromise;
      
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new ConversionError(
        'Error construyendo ZIP',
        'zip_builder',
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Añade archivos PHP al ZIP
   */
  async addPhpFiles(archive, sourceDir, basePath) {
    const files = await fs.readdir(sourceDir);
    
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        // Solo añadir archivos PHP, .htaccess, README.md
        const ext = path.extname(file).toLowerCase();
        if (ext === '.php' || file === '.htaccess' || file === 'README.md') {
          archive.file(filePath, {
            name: `${basePath}/${file}`
          });
          this.fileCount++;
        }
      }
    }
  }
  
  /**
   * Añade assets al ZIP
   */
  async addAssets(archive, assetsDir, basePath) {
    // Añadir toda la carpeta de assets de forma recursiva
    archive.directory(assetsDir, basePath);
    
    // Contar archivos
    const count = await this.countFilesRecursive(assetsDir);
    this.fileCount += count;
  }
  
  /**
   * Cuenta archivos en una carpeta recursivamente
   */
  async countFilesRecursive(dir) {
    let count = 0;
    
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        count += await this.countFilesRecursive(filePath);
      } else {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Crea ZIP solo de assets
   * Útil para descargas parciales
   */
  async createAssetsZip(assetsDir, outputPath) {
    try {
      if (!await fs.pathExists(assetsDir)) {
        throw new ConversionError(
          `Carpeta de assets no encontrada: ${assetsDir}`,
          'zip_builder'
        );
      }
      
      await fs.ensureDir(path.dirname(outputPath));
      
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      const zipPromise = new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve({
            path: outputPath,
            size: archive.pointer()
          });
        });
        
        archive.on('error', reject);
        output.on('error', reject);
      });
      
      archive.pipe(output);
      
      // Añadir carpeta completa
      const assetsFolderName = path.basename(assetsDir);
      archive.directory(assetsDir, assetsFolderName);
      
      await archive.finalize();
      
      return await zipPromise;
      
    } catch (error) {
      throw new ConversionError(
        'Error creando ZIP de assets',
        'zip_builder',
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Valida ZIP creado
   */
  async validateZip(zipPath) {
    try {
      // Verificar que existe
      if (!await fs.pathExists(zipPath)) {
        return {
          valid: false,
          error: 'ZIP no encontrado'
        };
      }
      
      // Verificar tamaño
      const stats = await fs.stat(zipPath);
      if (stats.size === 0) {
        return {
          valid: false,
          error: 'ZIP vacío'
        };
      }
      
      // Verificar tamaño máximo (500MB)
      const MAX_SIZE = 500 * 1024 * 1024;
      if (stats.size > MAX_SIZE) {
        return {
          valid: false,
          error: `ZIP demasiado grande: ${(stats.size / 1024 / 1024).toFixed(2)}MB`
        };
      }
      
      return {
        valid: true,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size)
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  /**
   * Formatea bytes a formato legible
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  /**
   * Genera nombre de archivo ZIP único
   */
  generateZipFilename(projectName) {
    const timestamp = Date.now();
    const safeName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    
    return `${safeName}_${timestamp}.zip`;
  }
  
  /**
   * Limpia ZIPs antiguos de la carpeta output
   */
  async cleanOldZips(outputDir, maxAge = 24 * 60 * 60 * 1000) {
    try {
      const files = await fs.readdir(outputDir);
      const now = Date.now();
      let cleaned = 0;
      
      for (const file of files) {
        if (path.extname(file).toLowerCase() === '.zip') {
          const filePath = path.join(outputDir, file);
          const stats = await fs.stat(filePath);
          
          // Eliminar si es más viejo que maxAge
          if (now - stats.mtimeMs > maxAge) {
            await fs.remove(filePath);
            cleaned++;
          }
        }
      }
      
      return {
        cleaned,
        message: `${cleaned} ZIP(s) antiguos eliminados`
      };
      
    } catch (error) {
      return {
        cleaned: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Obtiene info de un ZIP sin descomprimirlo
   */
  async getZipInfo(zipPath) {
    try {
      if (!await fs.pathExists(zipPath)) {
        throw new ConversionError('ZIP no encontrado', 'zip_info');
      }
      
      const stats = await fs.stat(zipPath);
      
      return {
        path: zipPath,
        name: path.basename(zipPath),
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        created: stats.birthtime,
        modified: stats.mtime
      };
      
    } catch (error) {
      throw new ConversionError(
        'Error obteniendo info del ZIP',
        'zip_info',
        { originalError: error.message }
      );
    }
  }
}

// Exportar instancia única
export const zipBuilder = new ZipBuilder();

export default zipBuilder;

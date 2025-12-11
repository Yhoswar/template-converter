/**
 * Claude API Service
 * Integración con Anthropic Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { ConversionError, retryWithBackoff } from '../utils/errorHandler.js';

dotenv.config();

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4000;

/**
 * System message base para todas las llamadas
 */
const SYSTEM_MESSAGE = `Eres un experto en conversión de plantillas HTML a PHP.
Siempre respondes únicamente con JSON válido, sin markdown ni explicaciones.
Mantienes la estructura HTML exacta de la plantilla original.
Nunca añades comentarios fuera del JSON de respuesta.`;

/**
 * Clase principal del servicio Claude API
 */
class ClaudeAPIService {
  
  /**
   * Realiza una llamada a Claude API
   */
  async sendMessage(prompt, options = {}) {
    try {
      const {
        maxTokens = MAX_TOKENS,
        temperature = 1,
        system = SYSTEM_MESSAGE
      } = options;

      console.log('[Claude API] Enviando mensaje...');
      
      const response = await retryWithBackoff(async () => {
        return await anthropic.messages.create({
          model: MODEL,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });
      });

      console.log('[Claude API] Respuesta recibida');
      console.log(`[Claude API] Tokens usados: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);

      return response;
      
    } catch (error) {
      console.error('[Claude API] Error:', error);
      
      if (error.status === 401) {
        throw new ConversionError(
          'API Key inválida o no configurada',
          'authentication',
          { originalError: error.message }
        );
      }
      
      if (error.status === 429) {
        throw new ConversionError(
          'Rate limit excedido. Intenta de nuevo en unos momentos.',
          'rate_limit',
          { originalError: error.message }
        );
      }
      
      throw new ConversionError(
        'Error al comunicarse con Claude API',
        'ai_processing',
        { originalError: error.message, status: error.status }
      );
    }
  }

  /**
   * Extrae texto de la respuesta de Claude
   */
  extractText(response) {
    if (!response || !response.content || !response.content[0]) {
      throw new ConversionError(
        'Respuesta de Claude API vacía o inválida',
        'ai_processing'
      );
    }

    const content = response.content[0];
    
    if (content.type !== 'text') {
      throw new ConversionError(
        'Tipo de contenido inesperado en respuesta de Claude',
        'ai_processing',
        { receivedType: content.type }
      );
    }

    return content.text;
  }

  /**
   * Parsea JSON de la respuesta de Claude
   */
  parseJSON(response) {
    const text = this.extractText(response);
    
    try {
      // Limpiar markdown si existe
      let cleanText = text.trim();
      
      // Remover bloques de código markdown
      cleanText = cleanText.replace(/```json\n?/g, '');
      cleanText = cleanText.replace(/```\n?/g, '');
      cleanText = cleanText.trim();
      
      const parsed = JSON.parse(cleanText);
      return parsed;
      
    } catch (error) {
      console.error('[Claude API] Error parseando JSON:', text.substring(0, 200));
      throw new ConversionError(
        'No se pudo parsear la respuesta JSON de Claude',
        'ai_processing',
        { 
          parseError: error.message,
          receivedText: text.substring(0, 500)
        }
      );
    }
  }

  /**
   * Llama a Claude y retorna JSON parseado
   */
  async sendMessageAndParseJSON(prompt, options = {}) {
    const response = await this.sendMessage(prompt, options);
    return this.parseJSON(response);
  }

  /**
   * Valida que Claude API está configurada correctamente
   */
  async validateSetup() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ConversionError(
        'ANTHROPIC_API_KEY no está configurada en .env',
        'configuration'
      );
    }

    try {
      console.log('[Claude API] Validando configuración...');
      
      const response = await this.sendMessage('Responde únicamente con: {"status":"ok"}', {
        maxTokens: 100
      });
      
      const result = this.parseJSON(response);
      
      if (result.status === 'ok') {
        console.log('[Claude API] ✓ Configuración válida');
        return true;
      }
      
      throw new Error('Respuesta inesperada de Claude');
      
    } catch (error) {
      console.error('[Claude API] ✗ Error en configuración:', error.message);
      throw error;
    }
  }

  /**
   * Comprime HTML para reducir tokens
   */
  compressHTML(html) {
    return html
      .replace(/\s+/g, ' ')           // Múltiples espacios → 1 espacio
      .replace(/>\s+</g, '><')        // Espacios entre tags
      .replace(/<!--.*?-->/gs, '')    // Comentarios HTML
      .trim();
  }

  /**
   * Estima tokens de un texto (aproximación)
   */
  estimateTokens(text) {
    // Aproximación: ~4 caracteres = 1 token
    return Math.ceil(text.length / 4);
  }
}

// Exportar instancia única (singleton)
export const claudeAPI = new ClaudeAPIService();

export default claudeAPI;

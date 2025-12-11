import { useState } from 'react'
import { FileText, ArrowRight, ArrowLeft, Loader2, Brain, Zap } from 'lucide-react'
import { analyzeTemplate } from '../../../services/api'
import FileUploader from '../../common/FileUploader'

export default function Step2Analyze({ sessionData, onComplete, onPrevious }) {
  const [menuFile, setMenuFile] = useState(null)
  const [useClaudeAPI, setUseClaudeAPI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleMenuDrop = (files) => {
    const file = files[0]
    if (file && file.name.endsWith('.txt')) {
      setMenuFile(file)
      setError(null)
    } else {
      setError('Solo archivos .txt permitidos')
    }
  }

  const handleAnalyze = async () => {
    if (!menuFile) {
      setError('Por favor sube el archivo menu.txt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await analyzeTemplate(
        sessionData.sessionId, 
        menuFile, 
        useClaudeAPI
      )
      
      onComplete({
        menuStructure: response.data.menuStructure,
        components: response.data.components,
        detectionMethod: response.data.detectionMethod,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al analizar el template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Analizar Estructura del Menú
        </h3>
        <p className="text-gray-600">
          Sube tu archivo menu.txt para que podamos analizar la estructura de navegación
        </p>
      </div>

      {/* Session Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <div className="font-medium">Archivos HTML encontrados:</div>
          <div className="font-mono">{sessionData.htmlFiles?.length || 0}</div>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <label className="label flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Archivo menu.txt
        </label>
        <FileUploader
          accept=".txt"
          maxSize={1}
          onDrop={handleMenuDrop}
          file={menuFile}
          onRemove={() => setMenuFile(null)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Archivo de texto con la estructura del menú (máximo 1MB)
        </p>
      </div>

      {/* Claude API Option */}
      <div className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="useClaudeAPI"
            checked={useClaudeAPI}
            onChange={(e) => setUseClaudeAPI(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex-1">
            <label 
              htmlFor="useClaudeAPI" 
              className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer"
            >
              <Brain className="w-5 h-5 text-purple-500" />
              Usar detección inteligente con Claude API
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Usa inteligencia artificial para detectar componentes con mayor precisión 
              (requiere créditos de Anthropic)
            </p>
            {!useClaudeAPI && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                Por defecto se usarán selectores CSS (funciona sin Claude API)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Anterior
        </button>

        <button
          onClick={handleAnalyze}
          disabled={!menuFile || loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              Analizar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

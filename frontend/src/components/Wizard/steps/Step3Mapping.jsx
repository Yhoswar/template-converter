import { useState, useEffect } from 'react'
import { Link2, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { validateMapping } from '../../../services/api'

export default function Step3Mapping({ sessionData, onComplete, onPrevious }) {
  const [mapping, setMapping] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Inicializar mapeo automático
  useEffect(() => {
    if (sessionData.menuStructure?.pages) {
      const autoMapping = {}
      const htmlFiles = sessionData.htmlFiles || []
      
      sessionData.menuStructure.pages.forEach((page, index) => {
        // Intentar auto-mapeo inteligente
        const matchingFile = htmlFiles.find(file => {
          const fileName = file.toLowerCase().replace('.html', '')
          const pageSlug = page.slug.toLowerCase()
          return fileName === pageSlug || fileName === 'index' && page.isHome
        })
        
        autoMapping[page.slug] = matchingFile || htmlFiles[index] || ''
      })
      
      setMapping(autoMapping)
    }
  }, [sessionData])

  const handleMappingChange = (pageSlug, htmlFile) => {
    setMapping(prev => ({
      ...prev,
      [pageSlug]: htmlFile
    }))
  }

  const isMappingComplete = () => {
    const pages = sessionData.menuStructure?.pages || []
    return pages.every(page => mapping[page.slug])
  }

  const handleValidate = async () => {
    if (!isMappingComplete()) {
      setError('Por favor mapea todas las páginas antes de continuar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await validateMapping(sessionData.sessionId, mapping)
      
      onComplete({ mapping })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al validar el mapeo')
    } finally {
      setLoading(false)
    }
  }

  const pages = sessionData.menuStructure?.pages || []
  const htmlFiles = sessionData.htmlFiles || []

  return (
    <div className="card max-w-5xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Mapear Páginas
        </h3>
        <p className="text-gray-600">
          Vincula cada página del menú con su archivo HTML correspondiente
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
          <div className="text-sm text-blue-700">Páginas totales</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(mapping).filter(Boolean).length}
          </div>
          <div className="text-sm text-green-700">Páginas mapeadas</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{htmlFiles.length}</div>
          <div className="text-sm text-purple-700">Archivos HTML</div>
        </div>
      </div>

      {/* Mapping Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Página del Menú
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Archivo HTML
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.slug} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {page.name}
                      {page.isHome && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Home
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {page.slug}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={mapping[page.slug] || ''}
                    onChange={(e) => handleMappingChange(page.slug, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-mono"
                  >
                    <option value="">Seleccionar archivo...</option>
                    {htmlFiles.map((file) => (
                      <option key={file} value={file}>
                        {file}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4 text-center">
                  {mapping[page.slug] ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del mapeo</span>
          <span className="text-sm font-bold text-primary-600">
            {Math.round((Object.values(mapping).filter(Boolean).length / pages.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(Object.values(mapping).filter(Boolean).length / pages.length) * 100}%`
            }}
          />
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
          onClick={handleValidate}
          disabled={!isMappingComplete() || loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validando...
            </>
          ) : (
            <>
              Validar Mapeo
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

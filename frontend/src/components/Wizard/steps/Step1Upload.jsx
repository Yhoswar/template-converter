import { useState } from 'react'
import { Upload, FileArchive, Settings, ArrowRight, Loader2 } from 'lucide-react'
import { uploadTemplate } from '../../../services/api'
import FileUploader from '../../common/FileUploader'
import ConfigForm from '../../common/ConfigForm'

export default function Step1Upload({ onComplete }) {
  const [zipFile, setZipFile] = useState(null)
  const [config, setConfig] = useState({
    nombreComercial: '',
    dominio: '',
    emailContacto: '',
    telefono: '',
    idiomaPreferente: 'es',
    idiomaSecundario: '',
    nombreCarpetaProyecto: '',
    nombreCarpetaAssets: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleZipDrop = (files) => {
    const file = files[0]
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file)
      setError(null)
    } else {
      setError('Solo archivos ZIP permitidos')
    }
  }

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    
    // Auto-generar nombres de carpetas
    if (field === 'nombreComercial') {
      const cleanName = value.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '')
      setConfig(prev => ({
        ...prev,
        nombreCarpetaProyecto: `Web_${cleanName}`,
        nombreCarpetaAssets: `assets-${cleanName.toLowerCase()}`,
      }))
    }
  }

  const isFormValid = () => {
    return zipFile &&
      config.nombreComercial &&
      config.dominio &&
      config.emailContacto &&
      config.telefono &&
      config.nombreCarpetaProyecto &&
      config.nombreCarpetaAssets
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await uploadTemplate(zipFile, config)
      
      onComplete({
        sessionId: response.sessionId,
        config: response.data.config,
        htmlFiles: response.data.htmlFiles,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir el template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Sube tu Template HTML
        </h3>
        <p className="text-gray-600">
          Sube el archivo ZIP de tu plantilla HTML y completa la configuración del proyecto
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <label className="label flex items-center gap-2">
          <FileArchive className="w-4 h-4" />
          Template ZIP
        </label>
        <FileUploader
          accept=".zip"
          maxSize={50}
          onDrop={handleZipDrop}
          file={zipFile}
          onRemove={() => setZipFile(null)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Máximo 50MB. El ZIP debe contener archivos HTML, CSS, JS e imágenes.
        </p>
      </div>

      {/* Config Form */}
      <div className="mb-8">
        <label className="label flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configuración del Proyecto
        </label>
        <ConfigForm
          config={config}
          onChange={handleConfigChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

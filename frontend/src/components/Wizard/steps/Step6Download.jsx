import { Download, CheckCircle, RefreshCw, FileArchive, Folder, Code, Info } from 'lucide-react'
import { downloadProject } from '../../../services/api'

export default function Step6Download({ sessionData, onReset }) {
  const { generatedProject, sessionId, config } = sessionData

  const handleDownload = () => {
    const downloadUrl = downloadProject(sessionId)
    window.location.href = downloadUrl
  }

  const handleNewProject = () => {
    if (confirm('¿Estás seguro de que quieres iniciar un nuevo proyecto? Se perderán los datos actuales.')) {
      onReset()
    }
  }

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Proyecto Completado!
        </h3>
        <p className="text-lg text-gray-600">
          Tu proyecto PHP está listo para descargar
        </p>
      </div>

      {/* Project Info */}
      <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Folder className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Proyecto</div>
              <div className="font-semibold text-gray-900 font-mono text-sm">
                {generatedProject?.projectName}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Code className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Archivos PHP</div>
              <div className="font-semibold text-gray-900">
                {generatedProject?.totalPhpFiles} archivos
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileArchive className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Tamaño</div>
              <div className="font-semibold text-gray-900">
                {generatedProject?.zipSize}
              </div>
            </div>
          </div>
        </div>

        {/* Files List Preview */}
        {generatedProject?.phpFiles && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-primary-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Archivos incluidos:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {generatedProject.phpFiles.slice(0, 9).map((file, index) => (
                <div
                  key={index}
                  className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded"
                >
                  {file}
                </div>
              ))}
              {generatedProject.phpFiles.length > 9 && (
                <div className="text-xs text-gray-500 italic px-2 py-1">
                  +{generatedProject.phpFiles.length - 9} más...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="mb-8">
        <button
          onClick={handleDownload}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 group"
        >
          <Download className="w-6 h-6 group-hover:animate-bounce" />
          Descargar Proyecto
          <span className="text-sm font-normal">({generatedProject?.zipSize})</span>
        </button>
      </div>

      {/* Next Steps Info */}
      <div className="mb-8 p-5 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Pasos siguientes:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Descarga el archivo ZIP</li>
              <li>Extrae el contenido en tu servidor web</li>
              <li>Configura la base de datos si es necesario</li>
              <li>Accede a tu dominio para ver el resultado</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="mb-8">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Ver instrucciones de instalación
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </div>
            </div>
          </summary>
          
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">1. Extrae el ZIP:</p>
                <code className="block bg-gray-800 text-gray-100 p-2 rounded font-mono text-xs">
                  unzip {generatedProject?.projectName}.zip -d /var/www/html/
                </code>
              </div>
              
              <div>
                <p className="font-semibold mb-1">2. Configura permisos:</p>
                <code className="block bg-gray-800 text-gray-100 p-2 rounded font-mono text-xs">
                  chmod -R 755 {config?.nombreCarpetaProyecto}
                </code>
              </div>
              
              <div>
                <p className="font-semibold mb-1">3. Configura el dominio:</p>
                <p className="text-xs text-gray-600">
                  Apunta tu dominio {config?.dominio} a la carpeta del proyecto
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">4. Verifica el sitio:</p>
                <p className="text-xs text-gray-600">
                  Accede a http://{config?.dominio} para ver tu sitio en funcionamiento
                </p>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleNewProject}
          className="flex-1 btn-outline flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Nuevo Proyecto
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Descargar de Nuevo
        </button>
      </div>
    </div>
  )
}

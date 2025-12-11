import { ArrowRight, ArrowLeft, Settings, FileText, Link2, CheckCircle } from 'lucide-react'

export default function Step4Review({ sessionData, onComplete, onPrevious }) {
  const { config, htmlFiles, menuStructure, mapping, components } = sessionData

  const handleContinue = () => {
    onComplete({})
  }

  return (
    <div className="card max-w-5xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Revisar Configuración
        </h3>
        <p className="text-gray-600">
          Verifica que toda la información sea correcta antes de generar el proyecto
        </p>
      </div>

      {/* Configuration Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Configuración del Proyecto</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <InfoItem label="Nombre Comercial" value={config?.nombreComercial} />
          <InfoItem label="Dominio" value={config?.dominio} />
          <InfoItem label="Email" value={config?.emailContacto} />
          <InfoItem label="Teléfono" value={config?.telefono} />
          <InfoItem label="Idioma Preferente" value={config?.idiomaPreferente?.toUpperCase()} />
          <InfoItem label="Idioma Secundario" value={config?.idiomaSecundario?.toUpperCase() || 'Ninguno'} />
          <InfoItem 
            label="Carpeta Proyecto" 
            value={config?.nombreCarpetaProyecto}
            mono 
          />
          <InfoItem 
            label="Carpeta Assets" 
            value={config?.nombreCarpetaAssets}
            mono 
          />
        </div>
      </div>

      {/* Menu Structure Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Estructura del Menú</h4>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard 
              label="Total Páginas" 
              value={menuStructure?.pages?.length || 0}
              color="blue"
            />
            <StatCard 
              label="Archivos HTML" 
              value={htmlFiles?.length || 0}
              color="green"
            />
            <StatCard 
              label="Mapeadas" 
              value={Object.keys(mapping || {}).length}
              color="purple"
            />
            <StatCard 
              label="Componentes" 
              value={components?.length || 0}
              color="orange"
            />
          </div>
          
          {menuStructure?.pages && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Páginas detectadas:</p>
              <div className="flex flex-wrap gap-2">
                {menuStructure.pages.map((page) => (
                  <span
                    key={page.slug}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                  >
                    {page.isHome && <CheckCircle className="w-3 h-3 text-green-500" />}
                    {page.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mapping Preview Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Mapeo de Archivos</h4>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {Object.entries(mapping || {}).map(([slug, htmlFile]) => (
              <div
                key={slug}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-900">{slug}</span>
                <span className="text-sm text-gray-500">→</span>
                <span className="text-sm font-mono text-gray-700">{htmlFile}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border-2 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-600 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Todo listo para generar
            </h4>
            <p className="text-sm text-gray-700">
              Tu proyecto está configurado correctamente. Al continuar, se generarán 
              automáticamente todos los archivos PHP con la estructura del framework 
              personalizado y soporte multiidioma.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Archivos de configuración PHP
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Sistema de rutas multiidioma
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Componentes (header, menu, footer)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Assets optimizados
              </li>
            </ul>
          </div>
        </div>
      </div>

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
          onClick={handleContinue}
          className="btn-primary flex items-center gap-2"
        >
          Generar Proyecto
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Helper Components
function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>
        {value || '-'}
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
  }

  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}

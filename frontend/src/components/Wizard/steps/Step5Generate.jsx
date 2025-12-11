import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, FileCode, Folder, Package, Zap } from 'lucide-react'
import { generateProject } from '../../../services/api'

const GENERATION_STEPS = [
  { id: 1, label: 'Creando archivos de configuración', icon: FileCode },
  { id: 2, label: 'Generando páginas PHP', icon: FileCode },
  { id: 3, label: 'Procesando componentes', icon: Package },
  { id: 4, label: 'Copiando assets', icon: Folder },
  { id: 5, label: 'Creando archivo ZIP', icon: Package },
  { id: 6, label: 'Finalizando proyecto', icon: Zap },
]

export default function Step5Generate({ sessionData, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('generating') // generating, success, error
  const [error, setError] = useState(null)
  const [generatedData, setGeneratedData] = useState(null)

  useEffect(() => {
    startGeneration()
  }, [])

  const startGeneration = async () => {
    try {
      // Simular progreso mientras se genera
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 300)

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= GENERATION_STEPS.length - 1) {
            clearInterval(stepInterval)
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Llamar al backend para generar
      const response = await generateProject(sessionData.sessionId)

      // Limpiar intervalos
      clearInterval(progressInterval)
      clearInterval(stepInterval)

      // Completar progreso
      setProgress(100)
      setCurrentStep(GENERATION_STEPS.length - 1)
      setStatus('success')
      setGeneratedData(response.data)

      // Esperar un momento antes de pasar al siguiente paso
      setTimeout(() => {
        onComplete({ 
          generatedProject: response.data 
        })
      }, 1500)

    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || 'Error al generar el proyecto')
    }
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Generando tu Proyecto
        </h3>
        <p className="text-gray-600">
          Esto puede tomar unos segundos...
        </p>
      </div>

      {/* Main Progress Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="text-primary-600 transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {status === 'generating' && (
                <>
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{progress}%</div>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">¡Listo!</div>
                </>
              )}
              {status === 'error' && (
                <div className="text-xl font-bold text-red-600">Error</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Steps */}
      <div className="mb-8 space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : isCurrent
                  ? 'bg-primary-50 border-primary-300 shadow-md'
                  : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              <div className={`
                p-2 rounded-lg
                ${isCompleted 
                  ? 'bg-green-100' 
                  : isCurrent
                  ? 'bg-primary-100'
                  : 'bg-gray-200'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <Icon className="w-5 h-5 text-primary-600 animate-pulse" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`
                  text-sm font-medium
                  ${isCompleted 
                    ? 'text-green-700' 
                    : isCurrent
                    ? 'text-primary-700'
                    : 'text-gray-500'
                  }
                `}>
                  {step.label}
                </p>
              </div>

              {isCompleted && (
                <span className="text-xs text-green-600 font-medium">Completado</span>
              )}
              {isCurrent && status === 'generating' && (
                <span className="text-xs text-primary-600 font-medium">En progreso...</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Info */}
      {status === 'success' && generatedData && (
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                ¡Proyecto generado exitosamente!
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>📦 Nombre: <span className="font-mono">{generatedData.projectName}</span></p>
                <p>📄 Archivos PHP: <span className="font-semibold">{generatedData.totalPhpFiles}</span></p>
                <p>💾 Tamaño: <span className="font-semibold">{generatedData.zipSize}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

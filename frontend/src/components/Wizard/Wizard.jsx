import { useState } from 'react'
import StepIndicator from './StepIndicator'
import Step1Upload from './steps/Step1Upload'
import Step2Analyze from './steps/Step2Analyze'
import Step3Mapping from './steps/Step3Mapping'
import Step4Review from './steps/Step4Review'
import Step5Generate from './steps/Step5Generate'
import Step6Download from './steps/Step6Download'

const STEPS = [
  { id: 1, title: 'Subir Template', description: 'Archivo ZIP y configuración' },
  { id: 2, title: 'Analizar', description: 'Menu y componentes' },
  { id: 3, title: 'Mapeo', description: 'Vincular páginas' },
  { id: 4, title: 'Revisar', description: 'Confirmar cambios' },
  { id: 5, title: 'Generar', description: 'Crear proyecto PHP' },
  { id: 6, title: 'Descargar', description: 'Obtener resultado' },
]

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    config: null,
    htmlFiles: [],
    menuStructure: null,
    components: null,
    mapping: null,
    generatedProject: null,
  })

  const handleStepComplete = (data) => {
    setSessionData(prev => ({ ...prev, ...data }))
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSessionData({
      sessionId: null,
      config: null,
      htmlFiles: [],
      menuStructure: null,
      components: null,
      mapping: null,
      generatedProject: null,
    })
  }

  const renderStep = () => {
    const stepProps = {
      sessionData,
      onComplete: handleStepComplete,
      onPrevious: handlePrevious,
    }

    switch (currentStep) {
      case 1:
        return <Step1Upload {...stepProps} />
      case 2:
        return <Step2Analyze {...stepProps} />
      case 3:
        return <Step3Mapping {...stepProps} />
      case 4:
        return <Step4Review {...stepProps} />
      case 5:
        return <Step5Generate {...stepProps} />
      case 6:
        return <Step6Download {...stepProps} onReset={handleReset} />
      default:
        return <Step1Upload {...stepProps} />
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Convierte tu Template HTML a PHP
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transforma plantillas HTML comerciales en un framework PHP personalizado 
          con soporte multiidioma en minutos
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator 
        steps={STEPS} 
        currentStep={currentStep}
        className="mb-8"
      />

      {/* Current Step Content */}
      <div className="animate-slide-up">
        {renderStep()}
      </div>

      {/* Progress Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Paso {currentStep} de {STEPS.length}
      </div>
    </div>
  )
}

import { Check } from 'lucide-react'

export default function StepIndicator({ steps, currentStep, className = '' }) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${step.id < currentStep 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : step.id === currentStep
                    ? 'bg-primary-600 text-white shadow-xl ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step Info - Hidden on mobile */}
              <div className="mt-2 text-center hidden md:block">
                <p className={`text-sm font-medium ${
                  step.id === currentStep ? 'text-primary-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    step.id < currentStep
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Info */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm font-medium text-primary-600">
          {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  )
}

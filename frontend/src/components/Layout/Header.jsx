import { Code2, Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Template Converter</h1>
              <p className="text-xs text-gray-500">HTML → PHP Framework</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>Conversión automática con IA</span>
          </div>
        </div>
      </div>
    </header>
  )
}

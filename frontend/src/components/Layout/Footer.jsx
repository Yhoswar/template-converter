import { Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Creado con</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>por Yhoswar</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/Yhoswar/template-converter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden md:inline">Ver en GitHub</span>
            </a>
            
            <span className="text-sm text-gray-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

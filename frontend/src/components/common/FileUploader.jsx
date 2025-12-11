import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, FileArchive } from 'lucide-react'

export default function FileUploader({ 
  accept = '*', 
  maxSize = 50, 
  onDrop, 
  file = null,
  onRemove 
}) {
  const onDropCallback = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      onDrop(acceptedFiles)
    }
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: accept === '.zip' ? { 'application/zip': ['.zip'] } : accept,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false,
  })

  if (file) {
    return (
      <div className="border-2 border-primary-300 bg-primary-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileArchive className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`
          p-4 rounded-full transition-colors
          ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}
        `}>
          <Upload className={`w-8 h-8 ${
            isDragActive ? 'text-primary-600' : 'text-gray-400'
          }`} />
        </div>
        
        {isDragActive ? (
          <p className="text-lg font-medium text-primary-600">
            Suelta el archivo aquí...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-900">
              Arrastra y suelta tu archivo ZIP
            </p>
            <p className="text-sm text-gray-500">
              o haz click para seleccionar
            </p>
          </>
        )}
        
        <p className="text-xs text-gray-400">
          Tamaño máximo: {maxSize}MB
        </p>
      </div>
    </div>
  )
}

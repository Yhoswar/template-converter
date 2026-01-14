import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * PASO 1: Upload Template
 */
export const uploadTemplate = async (zipFile, config) => {
  const formData = new FormData()
  formData.append('template', zipFile)
  formData.append('config', JSON.stringify(config))

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

/**
 * PASO 2: Analyze Template
 * @param {string} sessionId - ID de la sesión
 * @param {File} menuFile - Archivo menu.txt
 * @param {boolean} useClaudeAPI - Usar Claude API para detección inteligente
 * @param {AbortSignal} signal - Signal para cancelar la petición
 */
export const analyzeTemplate = async (sessionId, menuFile, useClaudeAPI = false, signal = null) => {
  const formData = new FormData()
  formData.append('menu', menuFile)
  formData.append('useClaudeAPI', useClaudeAPI.toString())

  const response = await api.post(`/analyze?sessionId=${sessionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000, // 2 minutos de timeout
    signal, // Permite cancelar la petición
  })

  return response.data
}

/**
 * PASO 3: Validate Mapping
 */
export const validateMapping = async (sessionId, mapping) => {
  const response = await api.post(`/mapping?sessionId=${sessionId}`, {
    mapping,
  })

  return response.data
}

/**
 * PASO 4: Generate Project
 */
export const generateProject = async (sessionId) => {
  const response = await api.post(`/generate?sessionId=${sessionId}`)

  return response.data
}

/**
 * Download Project
 */
export const downloadProject = (sessionId) => {
  return `${API_BASE_URL}/download/${sessionId}`
}

/**
 * Get Session Status
 */
export const getSessionStatus = async (sessionId) => {
  const response = await api.get(`/status/${sessionId}`)

  return response.data
}

/**
 * Cleanup Session
 */
export const cleanupSession = async (sessionId) => {
  const response = await api.delete(`/status/${sessionId}`)

  return response.data
}

/**
 * Health Check
 */
export const healthCheck = async () => {
  const response = await api.get('/health')

  return response.data
}

export default api

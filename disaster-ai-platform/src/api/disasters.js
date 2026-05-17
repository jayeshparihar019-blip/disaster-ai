import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Fetch all active disaster alerts.
 * @returns {Promise<Array>} List of disaster objects
 */
export const getDisasters = async () => {
  const response = await api.get('/api/disasters')
  return response.data
}

/**
 * Fetch a single disaster by ID.
 * @param {string|number} id - Disaster ID
 * @returns {Promise<Object>} Disaster detail object
 */
export const getDisasterById = async (id) => {
  const response = await api.get(`/api/disasters/${id}`)
  return response.data
}

/**
 * Submit a new disaster report.
 * @param {FormData} formData - Report form data (name, location, description, image)
 * @returns {Promise<Object>} Created report object
 */
export const reportDisaster = async (formData) => {
  const response = await api.post('/api/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Fetch dashboard statistics.
 * @returns {Promise<Object>} Stats: totalAlerts, highSeverity, citiesAffected, resourcesRecommended
 */
export const getDashboardStats = async () => {
  const response = await api.get('/api/stats')
  return response.data
}

export default api

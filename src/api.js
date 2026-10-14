import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://ai-smart-hospital-backend-4cpf.onrender.com'}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const errMsg = (e) =>
  e?.response?.data?.message ||
  (e?.response?.status === 401 ? 'Please log in again' : e?.message) ||
  'Something went wrong'

export default api
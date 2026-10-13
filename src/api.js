import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Pull a readable message out of any axios error
export const errMsg = (e) =>
  e?.response?.data?.message || (e?.response?.status === 401 ? 'Please log in again' : e?.message) || 'Something went wrong'

export default api

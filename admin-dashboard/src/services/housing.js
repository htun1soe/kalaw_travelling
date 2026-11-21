import { apiRequest } from './api.js'

// Public reads (client site) and super-admin writes (dashboard), all backed by kalaw_db.
export const housingApi = {
  list: () => apiRequest('/api/housing'),
  get: (id) => apiRequest(`/api/housing/${id}`),
  // `form` is a FormData so images can be uploaded together with the fields.
  create: (form) => apiRequest('/api/admin/housing', { method: 'POST', body: form }),
  update: (id, form) => {
    form.append('_method', 'PUT') // PHP only parses multipart bodies on POST
    return apiRequest(`/api/admin/housing/${id}`, { method: 'POST', body: form })
  },
  remove: (id) => apiRequest(`/api/admin/housing/${id}`, { method: 'DELETE' }),
}

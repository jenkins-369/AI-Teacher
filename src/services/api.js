const getApiBase = () => {
  if (typeof window !== 'undefined') return '/api'
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api`
    : 'http://localhost:3000/api'
}

const API_BASE = getApiBase()

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      throw new Error(data.error || 'Request failed')
    } catch {
      throw new Error(`Request failed with status ${response.status}`)
    }
  }
  return response.json()
}

export const coursesApi = {
  getAll: () => fetch(`${API_BASE}/courses`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/courses/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/courses/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
}

export const studyMaterialsApi = {
  getAll: () => fetch(`${API_BASE}/study-materials`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/study-materials/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/study-materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE}/study-materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/study-materials/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
}

export const documentChunksApi = {
  getAll: (materialId) => fetch(`${API_BASE}/document-chunks?material_id=${materialId}`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/document-chunks/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/document-chunks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE}/document-chunks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/document-chunks/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
}

export const generateApi = {
  summary: (material_id) => fetch(`${API_BASE}/generate/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material_id })
  }).then(handleResponse),
  
  flashcards: (material_id, count) => fetch(`${API_BASE}/generate/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material_id, count })
  }).then(handleResponse),
  
  quiz: (material_id, count) => fetch(`${API_BASE}/generate/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material_id, count })
  }).then(handleResponse),

  assignment: (material_id, count) => fetch(`${API_BASE}/generate/assignment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material_id, count })
  }).then(handleResponse)
}

export const flashcardsApi = {
  getAll: (materialId) => fetch(`${API_BASE}/flashcards${materialId ? `?material_id=${materialId}` : ''}`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/flashcards/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE}/flashcards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/flashcards/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
}

export const quizzesApi = {
  getAll: () => fetch(`${API_BASE}/quizzes`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/quizzes/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/quizzes/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  createQuestions: (data) => fetch(`${API_BASE}/quizzes/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)
}

export const quizAttemptsApi = {
  getAll: () => fetch(`${API_BASE}/quiz-attempts`).then(handleResponse),
  create: (data) => fetch(`${API_BASE}/quiz-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)
}

export const chatApi = {
  getAll: (material_id) => fetch(`${API_BASE}/chat?material_id=${material_id}`).then(handleResponse),
  sendMessage: (data) => fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)
}

export const assignmentsApi = {
  getAll: () => fetch(`${API_BASE}/assignments`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/assignments/${id}`).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/assignments/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  submit: (id, data) => fetch(`${API_BASE}/assignments/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)
}

export const progressApi = {
  getAll: () => fetch(`${API_BASE}/progress`).then(handleResponse),
  get: (id) => fetch(`${API_BASE}/progress/${id}`).then(handleResponse),
  upsert: (data) => fetch(`${API_BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/progress/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
}


export const dashboardApi = {
  getStats: () => fetch(`${API_BASE}/dashboard`).then(handleResponse)
}
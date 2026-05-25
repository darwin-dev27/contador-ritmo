const API_URL = 'http://localhost:8000/api';

// Helper para obtener headers con autenticación
const getHeaders = (token = null, isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  
  const currentToken = token || localStorage.getItem('access_token');
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
};

// API de Autenticación
export const authAPI = {
  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: getHeaders(null, true),
      // El backend requiere 'password_confirm' explícitamente en el serializador
      body: JSON.stringify({ username, email, password, password_confirm: password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.detail || JSON.stringify(data));
    }
    return res.json();
  },
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: getHeaders(null, true),
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    return res.json();
  },
  getProfile: async (token) => {
    const res = await fetch(`${API_URL}/auth/profile/`, {
      headers: getHeaders(token, true)
    });
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
  }
};

// API de Actividades
export const activityAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/activities/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falló al obtener actividades');
    return res.json();
  },
  create: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_URL}/activities/`, {
      method: 'POST',
      headers: getHeaders(null, !isFormData),
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falló al crear actividad');
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/activities/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falló al actualizar');
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/activities/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Falló al borrar');
  },
  getStats: async () => {
    const res = await fetch(`${API_URL}/activities/stats/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falló al obtener estadísticas globales');
    return res.json();
  }
};

// API de Equipamiento / Material
export const gearAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/gear/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falló al obtener el material deportivo');
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/gear/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falló al registrar el material');
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/gear/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falló al actualizar el material');
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/gear/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Falló al eliminar el material');
  }
};


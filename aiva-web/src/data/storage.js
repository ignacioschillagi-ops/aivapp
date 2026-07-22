// localStorage wrapper matching AsyncStorage API

export const storage = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val;
    } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
  getJSON: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  setJSON: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

// Profile helpers
export const getPerfilActivoId = () => storage.get('perfil_activo_id') || 'principal';

export const getPerfilPrincipal = () => storage.getJSON('perfil_principal');

export const getPerfilesAdicionales = () => storage.getJSON('perfiles_adicionales') || [];

export const getPerfilActivo = () => {
  const id = getPerfilActivoId();
  if (id === 'principal') return getPerfilPrincipal();
  const adicionales = getPerfilesAdicionales();
  return adicionales.find(p => p.id === id) || getPerfilPrincipal();
};

export const getTodosLosPerfiles = () => {
  const principal = getPerfilPrincipal();
  const adicionales = getPerfilesAdicionales();
  const perfiles = [];
  if (principal) perfiles.push({ ...principal, id: 'principal' });
  perfiles.push(...adicionales);
  return perfiles;
};

// Medidas helpers
export const getMedidas = (perfilId, categoria) => {
  return storage.getJSON(`medidas_${perfilId}_${categoria}`) || {};
};

export const setMedidas = (perfilId, categoria, valores) => {
  storage.setJSON(`medidas_${perfilId}_${categoria}`, valores);
};

// Prendas personalizadas
export const getPrendasPersonalizadas = (perfilId) => {
  return storage.getJSON(`prendas_personalizadas_${perfilId}`) || [];
};

export const setPrendasPersonalizadas = (perfilId, prendas) => {
  storage.setJSON(`prendas_personalizadas_${perfilId}`, prendas);
};

// Estado de medidas (vacio, incompleto, completo)
export const getEstadoMedidas = (perfilId, categoria, campos) => {
  const medidas = getMedidas(perfilId, categoria);
  const completados = campos.filter(c => medidas[c.id] && medidas[c.id] !== '').length;
  if (completados === 0) return 'vacio';
  if (completados < campos.length) return 'incompleto';
  return 'completo';
};

// Groq API key
export const getGroqKey = () => storage.get('groq_api_key');
export const setGroqKey = (key) => storage.set('groq_api_key', key);
export const removeGroqKey = () => storage.remove('groq_api_key');

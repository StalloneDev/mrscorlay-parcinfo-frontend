// URL de l'API en fonction de l'environnement
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://mrscorlay-parcinfo.vercel.app'
  : '';

// Fonction utilitaire pour construire les URLs de l'API
export const getApiUrl = (path: string) => {
  const basePath = path.startsWith('/') ? path : `/${path}`;
  return process.env.NODE_ENV === 'production'
    ? `${API_URL}${basePath}`
    : basePath;
};

// Configuration des en-têtes par défaut
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 
// URL de l'API en fonction de l'environnement
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://mrscorlay-parc-info-backend.vercel.app'
  : 'http://localhost:3000';

// Fonction utilitaire pour construire les URLs de l'API
export const getApiUrl = (path: string) => {
  const basePath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${basePath}`;
};

// Configuration des en-têtes par défaut
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 
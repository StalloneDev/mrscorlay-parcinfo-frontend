// URL de l'API en fonction de l'environnement
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://mrscorlay-parc-info-backend.vercel.app'
  : 'http://localhost:3000';

// Fonction utilitaire pour construire les URLs de l'API
export const getApiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`; 
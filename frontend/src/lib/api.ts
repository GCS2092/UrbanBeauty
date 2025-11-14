// Configuration de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://urbanbeauty.onrender.com';

export const apiConfig = {
  baseURL: API_URL,
  endpoints: {
    health: `${API_URL}/health`,
    testDb: `${API_URL}/test-db`,
    products: `${API_URL}/api/products`,
    services: `${API_URL}/api/services`,
    auth: `${API_URL}/api/auth`,
  },
};

// Fonction utilitaire pour les appels API
export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}


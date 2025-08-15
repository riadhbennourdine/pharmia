import { MemoFiche } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export interface Recommendation {
  fiche: MemoFiche;
  reason: string;
}

const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const getRecommendations = async (userId: string): Promise<Recommendation[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai-coach/recommendations/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  return response.json();
};

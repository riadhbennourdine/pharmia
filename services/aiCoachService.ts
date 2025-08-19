import { MemoFiche } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export interface Recommendation {
  fiche: MemoFiche;
  reason: string;
}

// The backend now returns a single suggestion, not an array
export interface AISuggestion {
    type: "fiche" | "quiz";
    ficheId: string;
    title: string;
    reasoning: string;
}

const getAuthToken = () => {
    return localStorage.getItem('token');
};

// This function is now adapted to call the correct endpoint
export const getChallengeSuggestion = async (excludeId?: string): Promise<AISuggestion> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai-coach/suggest-challenge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ excludeId })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch challenge suggestion: ${response.statusText}`);
  }

  return response.json();
};

export const findFicheByObjective = async (objective: string): Promise<AISuggestion> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai-coach/find-by-objective`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ objective })
  });

  if (!response.ok) {
    throw new Error(`Failed to find fiche by objective: ${response.statusText}`);
  }

  return response.json();
};

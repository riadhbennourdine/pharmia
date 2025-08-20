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
export const getChallengeSuggestion = async (excludedIds?: string[]): Promise<AISuggestion> => {
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
    body: JSON.stringify({ excludedIds })
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

export const getGlobalConsigne = async (): Promise<string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai-coach/global-consigne`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    // If the global consigne is not found or there's an error, return an empty string or throw an error
    // For now, let's return an empty string to allow fallback to user.consigne
    return "";
  }

  const data = await response.json();
  return data.consigne || "";
};

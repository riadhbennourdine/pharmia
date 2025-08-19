export interface QuizAttempt {
  quizId: string;
  score: number;
  completedAt: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'pharmacien' | 'préparateur' | 'admin';
  subscriptionStatus: 'free' | 'premium';
  skillLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  readFicheIds: string[];
  quizHistory: QuizAttempt[];
  consigne?: string; // New field for pharmacist's instruction
  pharmacienReferent?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  lastLogin?: string; // New field for last login date
  fichesReadCount?: number; // New calculated field
  averageQuizScore?: string; // New calculated field (string because of toFixed(1))
}

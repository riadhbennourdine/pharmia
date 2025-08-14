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
  pharmacienReferent?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

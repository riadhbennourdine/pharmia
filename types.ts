

export interface Flashcard {
  question: string;
  answer: string;
}

export enum QuizQuestionType {
    MCQ = 'mcq',
    TRUE_FALSE = 'truefalse'
}

export interface QuizQuestion {
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface ExternalResource {
  type: 'video' | 'podcast' | 'quiz' | 'article';
  title: string;
  url: string;
}

export interface Section {
  id: string;
  title:string;
  content: string;
  children?: Section[];
}

export interface Theme {
  id: string;
  Nom: string;
  description?: string;
}

export interface SystemeOrgane {
  id: string;
  Nom: string;
  description?: string;
}

export interface MemoFiche {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  imagePosition?: 'top' | 'middle' | 'bottom';
  flashSummary: string;
  memoContent: Section[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  glossaryTerms: GlossaryTerm[];
  theme: Theme;
  systeme_organe: SystemeOrgane;
  level: string; 
  createdAt: string;
  externalResources: ExternalResource[];
  kahootUrl?: string;
  youtubeUrl?: string;
}

export interface PharmIaData {
    themes: Theme[];
    systemesOrganes: SystemeOrgane[];
    memofiches: MemoFiche[];
}

// --- START: Added for Authentication ---
export enum UserRole {
  Admin = 'Admin',
  Formateur = 'Formateur',
  Pharmacien = 'Pharmacien',
  Preparateur = 'Preparateur',
  Guest = 'Guest'
}

export interface AuthContextType {
  userRole: UserRole;
  token: string | null;
  username: string | null;
  isLoggedIn: boolean;
  login: (role: UserRole, token: string, username: string) => void;
  logout: () => void;
  canGenerateMemoFiche: boolean;
  canEditMemoFiches: boolean;
  canDeleteMemoFiches: boolean;
}
// --- END: Added for Authentication ---

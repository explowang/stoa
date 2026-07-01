export type Theme =
  | 'death'
  | 'happiness'
  | 'friendship'
  | 'self-knowledge'
  | 'fate'
  | 'virtue'
  | 'wisdom'
  | 'justice'
  | 'truth'
  | 'education'
  | 'politics'
  | 'ethics'
  | 'metaphysics'
  | 'logic'
  | 'nature'
  | 'time'
  | 'knowledge'
  | 'courage'
  | 'moderation'
  | 'purpose';

export interface Philosopher {
  id: string;
  name: string;
  nameEn: string;
  nameGreek?: string;
  birthYear: number;
  deathYear: number;
  school: string;
  schoolEn: string;
  region: string;
  biography: string;
  coreIdeas: string[];
  portrait: string;
  chatPersonality?: {
    systemPrompt: string;
    style: string;
    knowledgeScope: string;
  };
}

export interface Quote {
  id: string;
  philosopherId: string;
  content: string;
  contentOriginal?: string;
  source: string;
  sourceWork?: string;
  themes: Theme[];
  imageUrl?: string;
  year?: number;
  context?: string;
  isVerified: boolean;
}

export interface ThemeInfo {
  id: Theme;
  name: string;
  nameEn: string;
  description: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

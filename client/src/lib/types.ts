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
}

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
  philosopher?: {
    id: string;
    name: string;
    nameEn: string;
    portrait: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

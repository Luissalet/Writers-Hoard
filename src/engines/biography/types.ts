export interface Biography {
  id: string;
  projectId: string;
  subjectId?: string;        // Codex entry ID
  subjectName: string;
  subjectPhoto?: string;     // base64
  createdAt: number;
  updatedAt: number;
}

export type BiographyCategory =
  | 'birth' | 'death' | 'education' | 'career'
  | 'relationship' | 'achievement' | 'conflict'
  | 'travel' | 'health' | 'personal' | 'political'
  | 'creative' | 'custom';

export interface BiographyFact {
  id: string;
  biographyId: string;
  projectId: string;
  title: string;
  content: string;           // Rich text
  date?: string;
  endDate?: string;
  category: BiographyCategory;
  order: number;
  sources: FactSource[];
  confidence: 'confirmed' | 'likely' | 'uncertain' | 'disputed';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FactSource {
  type: 'snapshot' | 'link' | 'manual' | 'interview';
  entityId?: string;
  description: string;
  url?: string;
}

export const BIOGRAPHY_CATEGORIES: Record<BiographyCategory, { label: string; color: string }> = {
  birth: { label: 'Birth', color: 'from-emerald-500 to-green-600' },
  death: { label: 'Death', color: 'from-slate-700 to-gray-800' },
  education: { label: 'Education', color: 'from-blue-500 to-cyan-600' },
  career: { label: 'Career', color: 'from-amber-500 to-orange-600' },
  relationship: { label: 'Relationship', color: 'from-pink-500 to-rose-600' },
  achievement: { label: 'Achievement', color: 'from-yellow-500 to-amber-600' },
  conflict: { label: 'Conflict', color: 'from-red-500 to-rose-600' },
  travel: { label: 'Travel', color: 'from-purple-500 to-indigo-600' },
  health: { label: 'Health', color: 'from-red-400 to-pink-500' },
  personal: { label: 'Personal', color: 'from-violet-500 to-purple-600' },
  political: { label: 'Political', color: 'from-red-600 to-amber-600' },
  creative: { label: 'Creative', color: 'from-cyan-500 to-blue-600' },
  custom: { label: 'Custom', color: 'from-gray-400 to-gray-600' },
};

export const CONFIDENCE_LEVELS = {
  confirmed: { label: 'Confirmed', icon: 'check', color: 'text-green-500' },
  likely: { label: 'Likely', icon: 'questionmark', color: 'text-yellow-500' },
  uncertain: { label: 'Uncertain', icon: 'tilde', color: 'text-gray-500' },
  disputed: { label: 'Disputed', icon: 'exclamation', color: 'text-red-500' },
};

// ============================================
// Scrapper Engine — Type Definitions
// ============================================

export type SnapshotSource = 'url' | 'tweet' | 'instagram' | 'youtube' | 'manual';

export interface Snapshot {
  id: string;
  projectId: string;
  url: string;
  title: string;
  source: SnapshotSource;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  thumbnail?: string; // base64
  author?: string;
  publishDate?: string;
  notes: string;
  tags: string[];
  extractedText?: string;
  htmlContent?: string;
  screenshotBase64?: string;
  metadata?: Record<string, string>;
  preservedAt: number;
  createdAt: number;
}

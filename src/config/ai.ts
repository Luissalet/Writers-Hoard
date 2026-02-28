// ============================================
// AI Configuration Defaults
// ============================================

import type { AiConfig } from '@/types';

export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl: 'http://localhost:8317',
  model: 'claude-haiku-4-5-20251001',
  enabled: true,
};

export const AVAILABLE_MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (rápido)', description: 'Menor consumo de quota' },
  { id: 'claude-sonnet-4-20250514', label: 'Sonnet 4 (equilibrado)', description: 'Balance velocidad/calidad' },
  { id: 'claude-sonnet-4-5-20250929', label: 'Sonnet 4.5 (mejor)', description: 'Mayor calidad, más lento' },
] as const;

// Settings keys for Dexie persistence
export const AI_SETTINGS_KEYS = {
  BASE_URL: 'ai_base_url',
  MODEL: 'ai_model',
  ENABLED: 'ai_enabled',
} as const;

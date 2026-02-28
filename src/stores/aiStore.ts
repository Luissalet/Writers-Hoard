import { create } from 'zustand';
import type { AiConfig } from '@/types';
import { DEFAULT_AI_CONFIG, AI_SETTINGS_KEYS } from '@/config/ai';
import * as ops from '@/db/operations';
import { testConnection } from '@/services/aiService';

interface AiState {
  config: AiConfig;
  isConnected: boolean;
  availableModels: string[];
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSettings: (config: Partial<AiConfig>) => Promise<void>;
  checkConnection: () => Promise<void>;
}

export const useAiStore = create<AiState>((set, get) => ({
  config: { ...DEFAULT_AI_CONFIG },
  isConnected: false,
  availableModels: [],
  isLoading: false,
  error: null,

  loadSettings: async () => {
    try {
      const baseUrl = await ops.getSetting(AI_SETTINGS_KEYS.BASE_URL);
      const model = await ops.getSetting(AI_SETTINGS_KEYS.MODEL);
      const enabled = await ops.getSetting(AI_SETTINGS_KEYS.ENABLED);

      set({
        config: {
          baseUrl: baseUrl || DEFAULT_AI_CONFIG.baseUrl,
          model: model || DEFAULT_AI_CONFIG.model,
          enabled: enabled !== undefined ? enabled === 'true' : DEFAULT_AI_CONFIG.enabled,
        },
      });
    } catch {
      // Use defaults if settings can't be loaded
    }
  },

  saveSettings: async (changes: Partial<AiConfig>) => {
    const current = get().config;
    const updated = { ...current, ...changes };

    if (changes.baseUrl !== undefined) {
      await ops.setSetting(AI_SETTINGS_KEYS.BASE_URL, changes.baseUrl);
    }
    if (changes.model !== undefined) {
      await ops.setSetting(AI_SETTINGS_KEYS.MODEL, changes.model);
    }
    if (changes.enabled !== undefined) {
      await ops.setSetting(AI_SETTINGS_KEYS.ENABLED, String(changes.enabled));
    }

    set({ config: updated });
  },

  checkConnection: async () => {
    set({ isLoading: true, error: null });
    const result = await testConnection(get().config.baseUrl);
    set({
      isConnected: result.connected,
      availableModels: result.models,
      isLoading: false,
      error: result.error || null,
    });
  },
}));

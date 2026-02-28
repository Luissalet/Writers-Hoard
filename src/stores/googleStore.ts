import { create } from 'zustand';
import { requestAccessToken, revokeToken, getGoogleUserInfo } from '@/services/googleAuth';

interface GoogleState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
  isLoading: boolean;
  error: string | null;

  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useGoogleStore = create<GoogleState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  userEmail: null,
  userName: null,
  userPicture: null,
  isLoading: false,
  error: null,

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await requestAccessToken();
      const userInfo = await getGoogleUserInfo(token);
      set({
        isAuthenticated: true,
        accessToken: token,
        userEmail: userInfo.email,
        userName: userInfo.name,
        userPicture: userInfo.picture,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación con Google';
      set({ isLoading: false, error: message });
    }
  },

  logout: async () => {
    const { accessToken } = get();
    if (accessToken) {
      await revokeToken(accessToken);
    }
    set({
      isAuthenticated: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      userPicture: null,
    });
  },

  clearError: () => set({ error: null }),
}));

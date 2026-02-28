// ============================================
// Google OAuth2 Authentication via Google Identity Services (GIS)
// ============================================

// GIS types (loaded via script tag in index.html)
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type: string; message: string }) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

let tokenClient: GoogleTokenClient | null = null;

/**
 * Check if GIS library is loaded
 */
export function isGisLoaded(): boolean {
  return !!window.google?.accounts?.oauth2;
}

/**
 * Get the Client ID from environment variable
 */
function getClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID not set. Add it to your .env file.'
    );
  }
  return clientId;
}

/**
 * Initialize OAuth2 and request an access token.
 * Returns a promise that resolves with the access token.
 */
export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isGisLoaded()) {
      reject(new Error('Google Identity Services not loaded. Check your internet connection.'));
      return;
    }

    try {
      tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: getClientId(),
        scope: SCOPES,
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            reject(new Error(`Google Auth error: ${response.error}`));
            return;
          }
          resolve(response.access_token);
        },
        error_callback: (error) => {
          reject(new Error(`Google Auth error: ${error.message}`));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: unknown) {
      reject(err);
    }
  });
}

/**
 * Revoke the current access token
 */
export function revokeToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    if (!isGisLoaded()) {
      resolve();
      return;
    }
    window.google!.accounts.oauth2.revoke(token, () => {
      resolve();
    });
  });
}

/**
 * Fetch Google user info to get email/name
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  email: string;
  name: string;
  picture: string;
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }
  return response.json();
}

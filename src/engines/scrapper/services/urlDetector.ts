// ============================================
// Scrapper Engine — URL Detection Service
// ============================================

import type { SnapshotSource } from '../types';

export function detectUrlSource(url: string): SnapshotSource {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'tweet';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'url';
}

export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be short form
    if (urlObj.hostname === 'youtu.be') {
      const id = urlObj.pathname.slice(1).split('?')[0];
      return id || null;
    }

    // Handle youtube.com long form
    if (urlObj.hostname.includes('youtube.com')) {
      const id = urlObj.searchParams.get('v');
      if (id) return id;

      // Handle youtube.com/embed/ID
      const match = urlObj.pathname.match(/\/embed\/([^/?]+)/);
      if (match) return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function extractTweetInfo(url: string): { username?: string; tweetId?: string } {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Match /username/status/tweetId
    const match = pathname.match(/\/([^/]+)\/status\/(\d+)/);
    if (match) {
      return {
        username: match[1],
        tweetId: match[2],
      };
    }

    return {};
  } catch {
    return {};
  }
}

export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

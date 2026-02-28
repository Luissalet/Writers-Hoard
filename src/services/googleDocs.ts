// ============================================
// Google Docs / Drive Service
// ============================================

import { cleanGoogleDocsHtml, countWords } from '@/utils/googleDocsHtmlCleaner';
import { generateId } from '@/utils/idGenerator';
import * as ops from '@/db/operations';
import type { Writing } from '@/types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DOCS_API = 'https://docs.googleapis.com/v1';

export interface GoogleDocFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
}

/**
 * List Google Docs from the user's Drive
 */
export async function listGoogleDocs(
  accessToken: string,
  query?: string
): Promise<GoogleDocFile[]> {
  let q = "mimeType='application/vnd.google-apps.document' and trashed=false";
  if (query) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,modifiedTime,webViewLink,thumbnailLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '50',
  });

  const response = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list Google Docs: ${error}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetch a Google Doc's content as HTML
 */
export async function fetchGoogleDocHtml(
  accessToken: string,
  fileId: string
): Promise<string> {
  const response = await fetch(
    `${DRIVE_API}/files/${fileId}/export?mimeType=text/html`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to export Google Doc: ${error}`);
  }

  const rawHtml = await response.text();
  return cleanGoogleDocsHtml(rawHtml);
}

/**
 * Get file metadata (to check modifiedTime for sync)
 */
export async function getDocMetadata(
  accessToken: string,
  fileId: string
): Promise<{ modifiedTime: string; name: string }> {
  const params = new URLSearchParams({
    fields: 'modifiedTime,name',
  });

  const response = await fetch(`${DRIVE_API}/files/${fileId}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch doc metadata');
  }

  return response.json();
}

/**
 * Import a Google Doc as a Writing record in Dexie
 */
export async function importGoogleDoc(
  _accessToken: string,
  doc: GoogleDocFile,
  projectId: string
): Promise<Writing> {
  // Only store a reference — content lives in Google Docs
  const writing: Writing = {
    id: generateId('wrt'),
    projectId,
    title: doc.name,
    status: 'draft',
    content: '',
    synopsis: undefined,
    wordCount: 0,
    chapter: undefined,
    tags: ['google-doc'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // Google Docs fields
    googleDocId: doc.id,
    googleDocUrl: doc.webViewLink,
    googleDocName: doc.name,
    lastSyncedAt: Date.now(),
    syncDirection: 'pull',
    isGoogleDoc: true,
  };

  await ops.createWriting(writing);
  return writing;
}

/**
 * Sync a Google Doc writing — pull latest content
 */
export async function syncGoogleDoc(
  accessToken: string,
  writing: Writing
): Promise<Partial<Writing>> {
  if (!writing.googleDocId) {
    throw new Error('This writing is not linked to a Google Doc');
  }

  const cleanHtml = await fetchGoogleDocHtml(accessToken, writing.googleDocId);
  const wc = countWords(cleanHtml);
  const metadata = await getDocMetadata(accessToken, writing.googleDocId);

  const changes: Partial<Writing> = {
    content: cleanHtml,
    wordCount: wc,
    googleDocName: metadata.name,
    title: metadata.name, // Keep title in sync with doc name
    lastSyncedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await ops.updateWriting(writing.id, changes);
  return changes;
}

/**
 * Check if a Google Doc has been modified since last sync
 */
export async function hasDocChanged(
  accessToken: string,
  writing: Writing
): Promise<boolean> {
  if (!writing.googleDocId || !writing.lastSyncedAt) return false;

  try {
    const metadata = await getDocMetadata(accessToken, writing.googleDocId);
    const docModified = new Date(metadata.modifiedTime).getTime();
    return docModified > writing.lastSyncedAt;
  } catch {
    return false;
  }
}

// ============================================
// On-demand content fetch for AI analysis
// Uses the Docs API — no 10 MB export limit
// ============================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractParagraphText(paragraph: any): string {
  return (paragraph.elements || [])
    .filter((el: any) => el.textRun)
    .map((el: any) => (el.textRun.content as string).replace(/\n$/, ''))
    .join('');
}

function docsJsonToHtml(doc: any): string {
  const elements: any[] = doc.body?.content || [];
  const lines: string[] = [];

  for (const element of elements) {
    if (element.paragraph) {
      const text = extractParagraphText(element.paragraph);
      if (text.trim()) lines.push(`<p>${text}</p>`);
    } else if (element.table) {
      for (const row of (element.table.tableRows || [])) {
        for (const cell of (row.tableCells || [])) {
          for (const el of (cell.content || [])) {
            if (el.paragraph) {
              const text = extractParagraphText(el.paragraph);
              if (text.trim()) lines.push(`<p>${text}</p>`);
            }
          }
        }
      }
    }
  }

  return lines.join('\n');
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Fetch a Google Doc's full content as HTML for AI analysis.
 * Uses the Docs API JSON endpoint — no file-size limit.
 * The content is NOT stored locally; it is used only transiently for AI calls.
 */
export async function fetchGoogleDocForAi(
  accessToken: string,
  fileId: string
): Promise<string> {
  const response = await fetch(`${DOCS_API}/documents/${fileId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`No se pudo obtener el documento para análisis: ${err}`);
  }

  const doc = await response.json();
  const html = docsJsonToHtml(doc);

  if (!html.trim()) {
    throw new Error('El documento parece estar vacío');
  }

  return html;
}

import type { Document } from '../types';

const SEARCH_FIELDS: (keyof Document)[] = [
  'title',
  'description',
  'trackingId',
  'ownerName',
  'category',
  'status',
];

/**
 * Returns true if the document matches the search query (case-insensitive)
 * against title, description, trackingId, ownerName, category, and status.
 */
export function documentMatchesSearch(doc: Document, query: string): boolean {
  if (!query.trim()) return true;
  const term = query.toLowerCase().trim();
  for (const key of SEARCH_FIELDS) {
    const value = doc[key];
    if (typeof value === 'string' && value.toLowerCase().includes(term)) {
      return true;
    }
  }
  return false;
}

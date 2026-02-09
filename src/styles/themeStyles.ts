import type { CSSProperties } from 'react';

/** Theme-aware style objects for use with inline style. Use when .dark is on document. */
export const cardStyle: CSSProperties = {
  backgroundColor: 'var(--card)',
  borderColor: 'var(--border)',
};
export const textStyle: CSSProperties = { color: 'var(--foreground)' };
export const mutedStyle: CSSProperties = { color: 'var(--muted-foreground)' };
export const mutedBgStyle: CSSProperties = { backgroundColor: 'var(--muted)' };
export const inputStyle: CSSProperties = {
  backgroundColor: 'var(--input-background)',
  color: 'var(--foreground)',
  borderColor: 'var(--border)',
};

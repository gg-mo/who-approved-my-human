import { describe, expect, it } from 'vitest';

import {
  TYPE_FIGURE_MANIFEST,
  getTypeFigureSpec,
  typeCodes,
} from '@/lib/figures/manifest';

describe('type figure manifest', () => {
  it('contains all 16 type combinations', () => {
    expect(typeCodes).toHaveLength(16);
    expect(Object.keys(TYPE_FIGURE_MANIFEST)).toHaveLength(16);

    for (const typeCode of typeCodes) {
      expect(TYPE_FIGURE_MANIFEST[typeCode]).toBeDefined();
    }
  });

  it('uses only the new personality letters C/X K/B V/T D/H', () => {
    for (const typeCode of typeCodes) {
      expect(typeCode).toMatch(/^[CX][KB][VT][DH]$/);
    }
  });

  it('assigns a non-empty nickname to every type', () => {
    for (const typeCode of typeCodes) {
      const spec = TYPE_FIGURE_MANIFEST[typeCode];
      expect(spec.nickname.length).toBeGreaterThan(0);
    }
  });

  it('returns a safe fallback figure for unknown types', () => {
    const fallback = getTypeFigureSpec('ZZZZ');

    expect(fallback.typeCode).toBe('CKVD');
    expect(fallback.nickname.length).toBeGreaterThan(0);
  });
});

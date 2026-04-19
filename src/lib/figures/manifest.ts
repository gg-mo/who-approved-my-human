export const typeCodes = [
  'CKVD',
  'CKVH',
  'CKTD',
  'CKTH',
  'CBVD',
  'CBVH',
  'CBTD',
  'CBTH',
  'XKVD',
  'XKVH',
  'XKTD',
  'XKTH',
  'XBVD',
  'XBVH',
  'XBTD',
  'XBTH',
] as const;

export type TypeCode = (typeof typeCodes)[number];

type FigureMood = 'cheerful' | 'focused' | 'curious' | 'intense';
type FigureAccessory = 'spark' | 'badge' | 'compass' | 'clipboard' | 'megaphone' | 'shield';

export type TypeFigureSpec = {
  typeCode: TypeCode;
  nickname: string;
  mood: FigureMood;
  accessory: FigureAccessory;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
};

export const TYPE_FIGURE_MANIFEST: Record<TypeCode, TypeFigureSpec> = {
  CKVD: {
    typeCode: 'CKVD',
    nickname: 'The Dream Director',
    mood: 'cheerful',
    accessory: 'spark',
    palette: { primary: '#2dd4bf', secondary: '#14b8a6', accent: '#fbbf24', background: '#0f172a' },
  },
  CKVH: {
    typeCode: 'CKVH',
    nickname: 'The Vision Sculptor',
    mood: 'focused',
    accessory: 'compass',
    palette: { primary: '#22d3ee', secondary: '#0891b2', accent: '#fb923c', background: '#0f1a2d' },
  },
  CKTD: {
    typeCode: 'CKTD',
    nickname: 'The Trusted Operator',
    mood: 'focused',
    accessory: 'clipboard',
    palette: { primary: '#38bdf8', secondary: '#0ea5e9', accent: '#34d399', background: '#0d1f2a' },
  },
  CKTH: {
    typeCode: 'CKTH',
    nickname: 'The Precision Partner',
    mood: 'curious',
    accessory: 'shield',
    palette: { primary: '#60a5fa', secondary: '#2563eb', accent: '#f59e0b', background: '#111827' },
  },
  CBVD: {
    typeCode: 'CBVD',
    nickname: 'The Bold Director',
    mood: 'intense',
    accessory: 'megaphone',
    palette: { primary: '#f97316', secondary: '#ea580c', accent: '#22d3ee', background: '#1f2937' },
  },
  CBVH: {
    typeCode: 'CBVH',
    nickname: 'The Exacting Visionary',
    mood: 'intense',
    accessory: 'shield',
    palette: { primary: '#fb7185', secondary: '#e11d48', accent: '#fdba74', background: '#1e1b4b' },
  },
  CBTD: {
    typeCode: 'CBTD',
    nickname: 'The Results Driver',
    mood: 'focused',
    accessory: 'clipboard',
    palette: { primary: '#f43f5e', secondary: '#be123c', accent: '#22c55e', background: '#1f1d2b' },
  },
  CBTH: {
    typeCode: 'CBTH',
    nickname: 'The Hardline Editor',
    mood: 'intense',
    accessory: 'badge',
    palette: { primary: '#fb923c', secondary: '#c2410c', accent: '#fde047', background: '#1f2937' },
  },
  XKVD: {
    typeCode: 'XKVD',
    nickname: 'The Intuitive Dreamer',
    mood: 'curious',
    accessory: 'spark',
    palette: { primary: '#a78bfa', secondary: '#7c3aed', accent: '#34d399', background: '#1e1b4b' },
  },
  XKVH: {
    typeCode: 'XKVH',
    nickname: 'The Collaborative Explorer',
    mood: 'curious',
    accessory: 'compass',
    palette: { primary: '#c084fc', secondary: '#9333ea', accent: '#22d3ee', background: '#2d1b4d' },
  },
  XKTD: {
    typeCode: 'XKTD',
    nickname: 'The Adaptive Starter',
    mood: 'cheerful',
    accessory: 'badge',
    palette: { primary: '#818cf8', secondary: '#4f46e5', accent: '#facc15', background: '#1f2540' },
  },
  XKTH: {
    typeCode: 'XKTH',
    nickname: 'The Guided Builder',
    mood: 'focused',
    accessory: 'shield',
    palette: { primary: '#6366f1', secondary: '#3730a3', accent: '#f97316', background: '#1f2239' },
  },
  XBVD: {
    typeCode: 'XBVD',
    nickname: 'The Wildcard Director',
    mood: 'intense',
    accessory: 'megaphone',
    palette: { primary: '#ef4444', secondary: '#b91c1c', accent: '#22d3ee', background: '#312e81' },
  },
  XBVH: {
    typeCode: 'XBVH',
    nickname: 'The Unfiltered Auteur',
    mood: 'intense',
    accessory: 'shield',
    palette: { primary: '#f87171', secondary: '#dc2626', accent: '#f59e0b', background: '#2d132c' },
  },
  XBTD: {
    typeCode: 'XBTD',
    nickname: 'The Pressure Operator',
    mood: 'focused',
    accessory: 'clipboard',
    palette: { primary: '#fb7185', secondary: '#be185d', accent: '#22c55e', background: '#311b33' },
  },
  XBTH: {
    typeCode: 'XBTH',
    nickname: 'The Combative Controller',
    mood: 'intense',
    accessory: 'megaphone',
    palette: { primary: '#f43f5e', secondary: '#9f1239', accent: '#fde047', background: '#2b1320' },
  },
};

const fallbackTypeCode: TypeCode = 'CKVD';

export function getTypeFigureSpec(typeCode: string): TypeFigureSpec {
  if (typeCode in TYPE_FIGURE_MANIFEST) {
    return TYPE_FIGURE_MANIFEST[typeCode as TypeCode];
  }

  return TYPE_FIGURE_MANIFEST[fallbackTypeCode];
}

export const LOBSTER_VARIANTS = {
  hero: {
    shellFrom: '#ff9f6b',
    shellTo: '#ff4f6d',
    claw: '#ff6b54',
    blush: '#ffd0b3',
  },
  card: {
    shellFrom: '#ffb36d',
    shellTo: '#ff6b6b',
    claw: '#ff8364',
    blush: '#ffe0cb',
  },
  bubble: {
    shellFrom: '#ff9960',
    shellTo: '#ff5c76',
    claw: '#ff7a59',
    blush: '#ffe4d1',
  },
} as const;

export type LobsterVariant = keyof typeof LOBSTER_VARIANTS;

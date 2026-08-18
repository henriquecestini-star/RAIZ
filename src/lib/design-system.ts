// src/lib/design-system.ts
import type { GamificationLevel, Tema } from '@/types'

// ── Color Palettes ─────────────────────────────────────────
export const PALETTE = {
  forest: {
    50:  '#E6F4ED',
    100: '#C2E6D4',
    300: '#6CC4A1',
    500: '#0F5C42',
    700: '#0A3D2B',
    900: '#061F16',
  },
  coral: {
    50:  '#FFF0EE',
    100: '#FFD4CF',
    300: '#FF9B8E',
    500: '#FF6B5E',
    700: '#E55245',
    900: '#C03030',
  },
  sand: {
    50:  '#FDFAF5',
    100: '#F7F4EF',
    200: '#EDE8DF',
    300: '#DDD6C9',
    400: '#C8BFB0',
  },
  ocean: {
    50:  '#EAF0FC',
    500: '#1558B0',
    700: '#0E3F7A',
  },
  amber: {
    50:  '#FFF4DF',
    500: '#9E5E00',
    700: '#6B3D00',
  },
} as const

// ── Semantic tokens per theme ───────────────────────────────
export type ThemeTokens = {
  bg: string; bgAlt: string
  surf: string; surfAlt: string
  border: string; borderMd: string
  text: string; textMd: string; textSm: string
  primary: string; primaryDk: string; primaryBg: string; primaryLight: string
  accent: string; accentBg: string; accentDk: string
  inc: string; incBg: string
  exp: string; expBg: string
  sav: string; savBg: string
  warn: string; warnBg: string
  overlay: string
}

export const TOKENS: Record<Tema, ThemeTokens> = {
  light: {
    bg: '#F7F4EF',       bgAlt: '#EDE8DF',
    surf: '#FFFFFF',     surfAlt: '#F2EDE6',
    border: 'rgba(0,0,0,0.07)', borderMd: 'rgba(0,0,0,0.13)',
    text: '#1A1611',     textMd: '#5A5450',  textSm: '#9A9690',
    primary: '#0F5C42',  primaryDk: '#0A3D2B', primaryBg: '#E6F4ED', primaryLight: '#C2E6D4',
    accent: '#FF6B5E',   accentBg: '#FFF0EE', accentDk: '#E55245',
    inc: '#0A7A55',      incBg: '#E3F6EE',
    exp: '#C13028',      expBg: '#FCEAEA',
    sav: '#1558B0',      savBg: '#EAF0FC',
    warn: '#9E5E00',     warnBg: '#FFF4DF',
    overlay: 'rgba(26,22,17,0.5)',
  },
  dark: {
    bg: '#0B0F0D',       bgAlt: '#111510',
    surf: '#151C18',     surfAlt: '#1C2420',
    border: 'rgba(255,255,255,0.06)', borderMd: 'rgba(255,255,255,0.11)',
    text: '#E8E2D8',     textMd: '#888480',  textSm: '#484540',
    primary: '#2CBD88',  primaryDk: '#22A878', primaryBg: '#0D2418', primaryLight: '#183525',
    accent: '#FF7A6E',   accentBg: '#2A1210', accentDk: '#FF8C82',
    inc: '#2DB87A',      incBg: '#0B2318',
    exp: '#E05555',      expBg: '#280A0A',
    sav: '#4490E0',      savBg: '#0A1A30',
    warn: '#D8920A',     warnBg: '#201400',
    overlay: 'rgba(0,0,0,0.7)',
  },
}

// ── Typography ─────────────────────────────────────────────
export const TYPOGRAPHY = {
  display: "'Outfit', 'DM Sans', system-ui, sans-serif",
  body:    "'DM Sans', 'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
  scale: {
    xs: 10, sm: 11, base: 13, md: 14, lg: 16, xl: 18,
    '2xl': 22, '3xl': 28, '4xl': 36,
  },
  weight: {
    normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800,
  },
} as const

// ── Spacing & Shape ────────────────────────────────────────
export const SPACING = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const
export const RADIUS  = { sm: 6, md: 10, lg: 14, xl: 18, '2xl': 24, full: 9999 } as const

// ── Shadows ────────────────────────────────────────────────
export const SHADOWS = {
  sm:   '0 1px 3px rgba(0,0,0,0.06)',
  md:   '0 4px 12px rgba(0,0,0,0.08)',
  lg:   '0 8px 30px rgba(0,0,0,0.12)',
  xl:   '0 16px 60px rgba(0,0,0,0.18)',
  glow: (color: string, alpha = 0.35) => `0 4px 20px ${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`,
} as const

// ── Animation presets (Framer Motion) ──────────────────────
export const MOTION = {
  spring:     { type: 'spring', stiffness: 400, damping: 28 },
  springFast: { type: 'spring', stiffness: 600, damping: 22 },
  smooth:     { duration: 0.3,  ease: [0.4, 0, 0.2, 1] as const },
  smoothFast: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const },
  fadeUp: {
    initial:  { opacity: 0, y: 14 },
    animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
    exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } },
  },
  fadeIn: {
    initial:  { opacity: 0 },
    animate:  { opacity: 1, transition: { duration: 0.25 } },
    exit:     { opacity: 0, transition: { duration: 0.15 } },
  },
  scaleIn: {
    initial:  { opacity: 0, scale: 0.92 },
    animate:  { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    exit:     { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  },
  slideUp: {
    initial:  { opacity: 0, y: '100%' },
    animate:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 32 } },
    exit:     { opacity: 0, y: '100%', transition: { duration: 0.2 } },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
} as const

// ── Gamification ───────────────────────────────────────────
export const LEVELS: GamificationLevel[] = [
  { name: 'Planta',   icon: '🌱', min: 0,  max: 24,  color: '#D4860A', bg: '#FFF5E0', desc: 'Primeiro passo da jornada' },
  { name: 'Raiz',     icon: '🌿', min: 25, max: 49,  color: '#1A9E9B', bg: '#E1F5EE', desc: 'Você está crescendo!' },
  { name: 'Árvore',   icon: '🌳', min: 50, max: 74,  color: '#0F5C42', bg: '#E6F4ED', desc: 'Meio do caminho!' },
  { name: 'Floresta', icon: '🌲', min: 75, max: 100, color: '#0A3D2B', bg: '#C2E6D4', desc: 'Quase lá! A casa é sua!' },
]

export const STREAK_LABELS = [
  { min: 0,  label: 'Sem streak',        icon: '🌑' },
  { min: 1,  label: 'Começando!',        icon: '🌱' },
  { min: 3,  label: 'Consistente!',      icon: '🔥' },
  { min: 6,  label: 'Em chamas!',        icon: '🔥🔥' },
  { min: 12, label: 'Imparável!',        icon: '⚡' },
] as const

// ── Category config ────────────────────────────────────────
export const CATS = {
  moradia:     { label: 'Moradia',      icon: '🏠', cor: '#0B7A5E' },
  alimentacao: { label: 'Alimentação',  icon: '🍽️', cor: '#D4860A' },
  transporte:  { label: 'Transporte',   icon: '🚗', cor: '#1E6DB5' },
  saude:       { label: 'Saúde',        icon: '💊', cor: '#C93030' },
  lazer:       { label: 'Lazer',        icon: '🎮', cor: '#7260D8' },
  educacao:    { label: 'Educação',     icon: '📚', cor: '#1A9E9B' },
  roupas:      { label: 'Roupas',       icon: '👗', cor: '#C04080' },
  assinaturas: { label: 'Assinaturas',  icon: '📱', cor: '#B04E18' },
  outros:      { label: 'Outros',       icon: '📦', cor: '#808078' },
} as const satisfies Record<string, { label: string; icon: string; cor: string }>

export const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'] as const

// ── Helpers ────────────────────────────────────────────────
export function getLevel(pct: number): GamificationLevel {
  return LEVELS.find(l => pct >= l.min && pct <= l.max) ?? LEVELS[0]!
}

export function getStreakLabel(streak: number) {
  const found = [...STREAK_LABELS].reverse().find(s => streak >= s.min)
  return found ?? STREAK_LABELS[0]!
}



// src/types/index.ts

export type TipoTransacao = 'receita' | 'despesa' | 'poupanca'

export type CategoriaDespesa =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'educacao'
  | 'roupas'
  | 'assinaturas'
  | 'outros'

export type Tema = 'light' | 'dark'

export type GamificationLevelName = 'Planta' | 'Raiz' | 'Árvore' | 'Floresta'

// ── Entities ─────────────────────────────────────────────────

export interface Transacao {
  readonly id: number | string
  tipo: TipoTransacao
  valor: number
  descricao: string
  categoria: CategoriaDespesa
  mes: number
  ano: number
  metaId?: number | null
  recId?: string
  /** Injected at runtime — never persisted */
  _virtual?: boolean
  createdAt: number
}

export interface Recorrente {
  readonly id: number
  tipo: TipoTransacao
  valor: number
  descricao: string
  categoria: CategoriaDespesa
  metaId?: number | null
  pausado: boolean
  createdAt: number
}

export interface Meta {
  readonly id: number
  nome: string
  valor: number
  descricao: string
  icone: string
  cor: string
  ativa: boolean
  principal: boolean
  archived: boolean
  deadline: string          // ISO month string e.g. "2026-06"
  alocacaoPct: number       // 0-100, used for auto-split savings
  ordem: number             // sort order (lower = first)
}

// ── Analytics ────────────────────────────────────────────────

export interface HistoricoMes {
  mes: string
  receitas: number
  despesas: number
  poupanca: number
}

export interface PorCategoria {
  name: string
  value: number
  cor: string
  icon: string
  pctRec: number
}

export interface GamificationLevel {
  name: GamificationLevelName
  icon: string
  min: number
  max: number
  color: string
  bg: string
  desc: string
}

export interface FinancialInsight {
  icon: string
  title: string
  msg: string
  type: 'good' | 'warn' | 'bad' | 'tip'
}

// ── App State ────────────────────────────────────────────────

export interface PersistedState {
  transacoes: Transacao[]
  recorrentes: Recorrente[]
  metas: Meta[]
  milestones: number[]
}

export interface UIState {
  filtroMes: number
  filtroAno: number
  tema: Tema
  aba: AbaId
  onboarded: boolean
}

export type AbaId = 'dashboard' | 'lancamentos' | 'historico' | 'metas' | 'analise'

// ── Store ────────────────────────────────────────────────────

export interface FinancasActions {
  setFiltroMes: (mes: number) => void
  setFiltroAno: (ano: number) => void
  setTema: (tema: Tema) => void
  setAba: (aba: AbaId) => void
  setOnboarded: () => void

  addTransacao: (t: Omit<Transacao, 'id' | 'createdAt'>) => void
  editTransacao: (id: Transacao['id'], updates: Partial<Transacao>) => void
  remTransacao: (id: Transacao['id']) => void

  addRecorrente: (r: Omit<Recorrente, 'id' | 'createdAt'>) => void
  editRecorrente: (id: number, updates: Partial<Recorrente>) => void
  pauseRecorrente: (id: number) => void
  remRecorrente: (id: number) => void

  addMeta: (m: Omit<Meta, 'id'>) => void
  editMeta: (id: number, updates: Partial<Meta>) => void
  reorderMeta: (id: number, direction: 'up' | 'down') => void
  archiveMeta: (id: number) => void
  remMeta: (id: number) => void

  markMilestone: (milestone: number) => void
}

export type FinancasStore = PersistedState & UIState & FinancasActions

// ── Form shapes (Zod-inferred, mirrors these) ─────────────────

export interface TransacaoFormData {
  tipo: TipoTransacao
  valor: string
  descricao: string
  categoria: CategoriaDespesa
  mes: number
  ano: number
  recorrente: boolean
  repetir: number
  metaId: string
}

export interface MetaFormData {
  nome: string
  valor: string
  descricao: string
  icone: string
  cor: string
  deadline: string
  alocacaoPct: number
}



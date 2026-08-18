// src/store/financasStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { FinancasStore, Transacao, Recorrente, Meta, PersistedState } from '@/types'

const MES_ATUAL = new Date().getMonth()
const ANO_ATUAL = new Date().getFullYear()

const DEFAULT_STATE: PersistedState = {
  transacoes: [],
  recorrentes: [],
  milestones: [],
  metas: [{
    id: 1,
    nome: 'Casa Própria',
    valor: 50000,
    descricao: 'Entrada + custos da mudança',
    icone: '🏠',
    cor: '#0F5C42',
    ativa: true,
    principal: true,
    archived: false,
    deadline: '',
    alocacaoPct: 100,
    ordem: 0,
  }],
}

export const useFinancasStore = create<FinancasStore>()(
  persist(
    immer((set) => ({
      // ── State ──────────────────────────────────────────
      ...DEFAULT_STATE,
      filtroMes: MES_ATUAL,
      filtroAno: ANO_ATUAL,
      tema: 'light' as const,
      aba: 'dashboard' as const,
      onboarded: false,

      // ── UI Actions ─────────────────────────────────────
      setFiltroMes: (mes) => set(s => { s.filtroMes = mes }),
      setFiltroAno: (ano) => set(s => { s.filtroAno = ano }),
      setTema: (tema) => set(s => { s.tema = tema }),
      setAba: (aba) => set(s => { s.aba = aba }),
      setOnboarded: () => set(s => { s.onboarded = true }),

      // ── Transação Actions ──────────────────────────────
      addTransacao: (t) => set(s => {
        const nova: Transacao = { ...t, id: Date.now(), createdAt: Date.now() }
        s.transacoes.unshift(nova)
      }),
      editTransacao: (id, updates) => set(s => {
        const idx = s.transacoes.findIndex(t => t.id === id)
        if (idx !== -1) Object.assign(s.transacoes[idx]!, updates)
      }),
      remTransacao: (id) => set(s => {
        s.transacoes = s.transacoes.filter(t => t.id !== id)
      }),

      // ── Recorrente Actions ─────────────────────────────
      addRecorrente: (r) => set(s => {
        const nova: Recorrente = { ...r, id: Date.now(), createdAt: Date.now() }
        s.recorrentes.push(nova)
      }),
      editRecorrente: (id, updates) => set(s => {
        const idx = s.recorrentes.findIndex(r => r.id === id)
        if (idx !== -1) Object.assign(s.recorrentes[idx]!, updates)
      }),
      pauseRecorrente: (id) => set(s => {
        const r = s.recorrentes.find(r => r.id === id)
        if (r) r.pausado = !r.pausado
      }),
      remRecorrente: (id) => set(s => {
        s.recorrentes = s.recorrentes.filter(r => r.id !== id)
      }),

      // ── Meta Actions ───────────────────────────────────
      addMeta: (m) => set(s => {
        const maxOrdem = Math.max(0, ...s.metas.map(x => x.ordem))
        s.metas.push({ ...m, id: Date.now(), ordem: maxOrdem + 1 })
      }),
      editMeta: (id, updates) => set(s => {
        const idx = s.metas.findIndex(m => m.id === id)
        if (idx !== -1) Object.assign(s.metas[idx]!, updates)
      }),
      reorderMeta: (id, direction) => set(s => {
        const sorted = [...s.metas].sort((a, b) => a.ordem - b.ordem)
        const idx = sorted.findIndex(m => m.id === id)
        if (idx === -1) return
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= sorted.length) return
        const a = sorted[idx]!
        const b = sorted[swapIdx]!
        const tmpOrdem = a.ordem
        a.ordem = b.ordem
        b.ordem = tmpOrdem
        // Apply back to store
        const aStore = s.metas.find(m => m.id === a.id)
        const bStore = s.metas.find(m => m.id === b.id)
        if (aStore) aStore.ordem = a.ordem
        if (bStore) bStore.ordem = b.ordem
      }),
      archiveMeta: (id) => set(s => {
        const m = s.metas.find(m => m.id === id)
        if (m) m.archived = true
      }),
      remMeta: (id) => set(s => {
        s.metas = s.metas.filter(m => m.id !== id)
      }),

      // ── Gamification ───────────────────────────────────
      markMilestone: (milestone) => set(s => {
        if (!s.milestones.includes(milestone)) s.milestones.push(milestone)
      }),
    })),
    {
      name: 'raiz-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transacoes:   state.transacoes,
        recorrentes:  state.recorrentes,
        metas:        state.metas,
        milestones:   state.milestones,
        tema:         state.tema,
        onboarded:    state.onboarded,
      }),
    }
  )
)



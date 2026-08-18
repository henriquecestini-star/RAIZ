// src/hooks/useFinancas.ts
import { useMemo, useCallback } from 'react'
import { useFinancasStore } from '@/store/financasStore'
import { MESES, CATS, getLevel } from '@/lib/design-system'
import type {
  HistoricoMes, PorCategoria, FinancialInsight,
  TipoTransacao, CategoriaDespesa
} from '@/types'

// ── Formatters ──────────────────────────────────────────────
export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const pct  = (v: number) => `${(v || 0).toFixed(1)}%`
export const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${Math.round(v)}`

// ── Score ────────────────────────────────────────────────────
export function calcScore(
  rec: number, desp: number, poupMes: number,
  metaVal: number, poupTotal: number
): number {
  if (!rec) return 0
  let s = 5
  const tp = poupMes / rec, td = desp / rec
  if (tp >= 0.2) s += 30; else if (tp >= 0.1) s += 18; else if (tp > 0) s += 8
  if (td <= 0.6) s += 25; else if (td <= 0.8) s += 15; else if (td <= 1.0) s += 5
  if (rec > 0) s += 20
  if (metaVal > 0 && poupTotal > 0) s += Math.min(20, (poupTotal / metaVal) * 20)
  return Math.min(100, Math.round(s))
}

// ── Momentum ─────────────────────────────────────────────────
export function calcMomentum(
  hist12: HistoricoMes[], poupMes: number,
  receitas: number, tendencia: number
): number {
  let m = 40
  if (receitas > 0) {
    const r = poupMes / receitas
    if (r >= 0.2) m += 30; else if (r >= 0.1) m += 18; else if (r > 0) m += 8
  }
  if (tendencia < -100) m += 20; else if (tendencia < 0) m += 12
  else if (tendencia > 500) m -= 15; else if (tendencia > 0) m -= 8
  const ativos = hist12.filter(h => h.receitas > 0 || h.despesas > 0).length
  if (ativos >= 6) m += 10; else if (ativos >= 3) m += 5
  return Math.min(100, Math.max(0, Math.round(m)))
}

// ── Streak ───────────────────────────────────────────────────
export function calcStreak(transacoes: Array<{ mes: number; ano: number }>): number {
  if (!transacoes.length) return 0
  const months = new Set(transacoes.map(t => `${t.ano}-${t.mes}`))
  let streak = 0, m = new Date().getMonth(), a = new Date().getFullYear()
  while (months.has(`${a}-${m}`)) {
    streak++; m--
    if (m < 0) { m = 11; a-- }
    if (streak > 24) break
  }
  return streak
}

// ── Auto-allocation ──────────────────────────────────────────
export function splitByAllocation(
  valor: number,
  metas: Array<{ id: number; alocacaoPct: number; ativa: boolean; archived: boolean }>
): Array<{ metaId: number; valor: number }> {
  const ativas = metas.filter(m => m.ativa && !m.archived && m.alocacaoPct > 0)
  const total  = ativas.reduce((s, m) => s + m.alocacaoPct, 0)
  if (total === 0) return []
  return ativas
    .map(m => ({ metaId: m.id, valor: Math.round((m.alocacaoPct / total) * valor * 100) / 100 }))
    .filter(x => x.valor > 0)
}

// ── Form shape ───────────────────────────────────────────────
export interface AddTxForm {
  tipo:        TipoTransacao
  valor:       string | number
  descricao:   string
  categoria:   CategoriaDespesa
  mes:         number | string
  ano:         number | string
  recorrente?: boolean
  repetir?:    number | string
  metaId?:     string | number | null
}

// ── Main hook ─────────────────────────────────────────────────
export function useFinancas() {
  const store = useFinancasStore()
  const { filtroMes, filtroAno } = store

  const raw = {
    transacoes:  store.transacoes,
    recorrentes: store.recorrentes,
    metas:       store.metas,
    milestones:  store.milestones,
  }

  // Active, sorted metas
  const metas = useMemo(
    () => [...store.metas.filter(m => !m.archived)].sort((a, b) => a.ordem - b.ordem),
    [store.metas]
  )
  const metaPrincipal = useMemo(
    () => metas.find(m => m.principal && m.ativa) ?? metas[0] ?? null,
    [metas]
  )

  // Virtual recurrents injected into current month
  const allTransacoes = useMemo(() => {
    const extra = store.recorrentes.filter(r => !r.pausado).flatMap(r => {
      const key = `rec_${r.id}_${filtroMes}_${filtroAno}`
      if (store.transacoes.find(t => t.recId === key)) return []
      return [{
        ...r, id: key, recId: key,
        mes: filtroMes, ano: filtroAno,
        _virtual: true as const, createdAt: Date.now(),
      }]
    })
    return [...store.transacoes, ...extra]
  }, [store.transacoes, store.recorrentes, filtroMes, filtroAno])

  const txMes      = useMemo(() => allTransacoes.filter(t => t.mes === filtroMes && t.ano === filtroAno), [allTransacoes, filtroMes, filtroAno])
  const receitas   = useMemo(() => txMes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0), [txMes])
  const despesas   = useMemo(() => txMes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0), [txMes])
  const poupMes    = useMemo(() => txMes.filter(t => t.tipo === 'poupanca').reduce((s, t) => s + t.valor, 0), [txMes])
  const saldo      = useMemo(() => receitas - despesas - poupMes, [receitas, despesas, poupMes])

  const totalPoupPri = useMemo(() => {
    const pid = metaPrincipal?.id
    return store.transacoes
      .filter(t => t.tipo === 'poupanca' && (!t.metaId || t.metaId === pid))
      .reduce((s, t) => s + t.valor, 0)
  }, [store.transacoes, metaPrincipal])

  const porCategoria: PorCategoria[] = useMemo(() =>
    Object.entries(
      txMes.filter(t => t.tipo === 'despesa').reduce<Record<string, number>>((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] ?? 0) + t.valor; return acc
      }, {})
    ).map(([cat, val]) => ({
      name:   CATS[cat as keyof typeof CATS]?.label  ?? cat,
      value:  val,
      cor:    CATS[cat as keyof typeof CATS]?.cor     ?? '#888',
      icon:   CATS[cat as keyof typeof CATS]?.icon    ?? '📦',
      pctRec: receitas > 0 ? (val / receitas) * 100 : 0,
    })).sort((a, b) => b.value - a.value),
  [txMes, receitas])

  const historico12: HistoricoMes[] = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      let m = filtroMes - i, a = filtroAno
      if (m < 0) { m += 12; a -= 1 }
      const ts = allTransacoes.filter(t => t.mes === m && t.ano === a)
      return {
        mes:      MESES[m] ?? '?',
        receitas: ts.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0),
        despesas: ts.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0),
        poupanca: ts.filter(t => t.tipo === 'poupanca').reduce((s, t) => s + t.valor, 0),
      }
    }).reverse(),
  [allTransacoes, filtroMes, filtroAno])

  const tendencia = useMemo(() => {
    const at = historico12.filter(m => m.despesas > 0 || m.receitas > 0)
    if (at.length < 2) return 0
    const [p, c] = at.slice(-2) as [HistoricoMes, HistoricoMes]
    return c.despesas - p.despesas
  }, [historico12])

  const metaValor   = metaPrincipal?.valor ?? 0
  const metaPct     = useMemo(() => metaValor > 0 ? Math.min((totalPoupPri / metaValor) * 100, 100) : 0, [totalPoupPri, metaValor])
  const level       = useMemo(() => getLevel(metaPct), [metaPct])
  const healthScore = useMemo(() => calcScore(receitas, despesas, poupMes, metaValor, totalPoupPri), [receitas, despesas, poupMes, metaValor, totalPoupPri])
  const momentum    = useMemo(() => calcMomentum(historico12, poupMes, receitas, tendencia), [historico12, poupMes, receitas, tendencia])
  const streak      = useMemo(() => calcStreak(store.transacoes), [store.transacoes])

  const milestoneReached = useMemo(() => {
    const done = store.milestones
    return [25, 50, 75, 100].filter(m => metaPct >= m && !done.includes(m))
  }, [metaPct, store.milestones])

  const insights: FinancialInsight[] = useMemo(() => {
    const ins: FinancialInsight[] = []
    const taxaPoup  = receitas > 0 ? (poupMes / receitas) * 100 : 0
    const mesesRest = poupMes > 0 && metaValor > totalPoupPri
      ? Math.ceil((metaValor - totalPoupPri) / poupMes) : null
    if (taxaPoup >= 20) ins.push({ icon: '🎯', title: 'Taxa ideal!',       msg: `Você poupa ${pct(taxaPoup)} da renda.`,          type: 'good' })
    else if (taxaPoup > 0) ins.push({ icon: '⚡', title: 'Aumente a poupança', msg: `${pct(taxaPoup)} poupado. Meta: 20%.`,       type: 'warn' })
    if (tendencia < -200) ins.push({ icon: '💪', title: 'Gastos caindo!',   msg: `↓ R$ ${brl(Math.abs(tendencia))} vs mês ant.`, type: 'good' })
    else if (tendencia > 300) ins.push({ icon: '🔴', title: 'Gastos em alta', msg: `↑ R$ ${brl(tendencia)} vs mês ant.`,         type: 'bad'  })
    if (mesesRest && mesesRest <= 12) ins.push({ icon: '🏠', title: 'Quase lá!', msg: `${mesesRest} meses para a meta!`,         type: 'good' })
    if (streak >= 3) ins.push({ icon: '🔥', title: `${streak} meses de streak!`, msg: 'Consistência é o segredo.',               type: 'good' })
    if (!ins.length)  ins.push({ icon: '📝', title: 'Adicione lançamentos', msg: 'Quanto mais dados, melhores os insights.',     type: 'tip'  })
    return ins.slice(0, 2)
  }, [receitas, poupMes, metaValor, totalPoupPri, tendencia, streak])

  // ── addTxWithAlloc: handles auto-split + batch repeat ────
  const addTxWithAlloc = useCallback((form: AddTxForm) => {
    const valor  = parseFloat(String(form.valor)) || 0
    const mes    = parseInt(String(form.mes))
    const ano    = parseInt(String(form.ano))
    const reps   = form.recorrente ? 1 : parseInt(String(form.repetir ?? 1)) || 1
    const metaId = form.metaId ? parseInt(String(form.metaId)) : null

    // Auto-split poupança among metas
    if (form.tipo === 'poupanca' && !form.metaId) {
      const splits = splitByAllocation(valor, metas)
      if (splits.length > 1) {
        splits.forEach(sp =>
          store.addTransacao({ tipo: 'poupanca', valor: sp.valor, descricao: form.descricao, categoria: form.categoria, mes, ano, metaId: sp.metaId })
        )
        if (form.recorrente)
          store.addRecorrente({ tipo: 'poupanca', valor, descricao: form.descricao, categoria: form.categoria, metaId: null, pausado: false })
        return
      }
    }

    for (let i = 0; i < reps; i++) {
      let m = mes + i, a = ano
      while (m > 11) { m -= 12; a++ }
      store.addTransacao({ tipo: form.tipo, valor, descricao: form.descricao, categoria: form.categoria, mes: m, ano: a, metaId })
    }
    if (form.recorrente)
      store.addRecorrente({ tipo: form.tipo, valor, descricao: form.descricao, categoria: form.categoria, metaId, pausado: false })
  }, [metas, store])

  return {
    // raw state
    raw,
    // computed
    txMes, allTransacoes,
    receitas, despesas, poupMes, saldo,
    totalPoupPri, porCategoria, historico12, tendencia,
    healthScore, momentum, streak,
    filtroMes, filtroAno,
    metas, metaPrincipal, metaPct, metaValor, level,
    milestoneReached, insights,
    // Actions (direct from store)
    setFiltroMes:      store.setFiltroMes,
    setFiltroAno:      store.setFiltroAno,
    setTema:           store.setTema,
    setAba:            store.setAba,
    setOnboarded:      store.setOnboarded,
    addTxWithAlloc,
    addTransacao:      store.addTransacao,
    editTransacao:     store.editTransacao,
    removerTransacao:  store.remTransacao,
    addRecorrente:     store.addRecorrente,
    editRecorrente:    store.editRecorrente,
    pauseRecorrente:   store.pauseRecorrente,
    removerRecorrente: store.remRecorrente,
    addMeta:           store.addMeta,
    salvarMeta:        store.editMeta,
    editMeta:          store.editMeta,
    reorderMeta:       store.reorderMeta,
    archiveMeta:       store.archiveMeta,
    removerMeta:       store.remMeta,
    markMilestone:     store.markMilestone,
  }
}

// Convenience type for consumers
export type FinHook = ReturnType<typeof useFinancas>



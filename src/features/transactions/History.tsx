// src/features/transactions/History.tsx
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Search } from 'lucide-react'
import { Card, Button, EmptyState, useTheme } from '@/components/ui'
import { MESES, CATS, MOTION } from '@/lib/design-system'
import { brl } from '@/hooks/useFinancas'
import { exportarCSV } from '@/services/export'
import { TxRow } from './Transactions'
import type { useFinancas } from '@/hooks/useFinancas'
import type { Transacao } from '@/types'

type FinHook = ReturnType<typeof useFinancas>

type FiltroTipo = 'todos' | 'receita' | 'despesa' | 'poupanca'

const FILTROS: { v: FiltroTipo; l: string }[] = [
  { v: 'todos',    l: 'Todos'    },
  { v: 'receita',  l: 'Receitas' },
  { v: 'despesa',  l: 'Despesas' },
  { v: 'poupanca', l: 'Poupança' },
]

export function History({ fin }: { fin: FinHook }) {
  const th = useTheme()
  const { txMes, receitas, despesas, poupMes, removerTransacao, editTransacao, filtroMes, filtroAno } = fin

  const [filtro,     setFiltro]     = useState<FiltroTipo>('todos')
  const [search,     setSearch]     = useState('')
  const [editingTx,  setEditingTx]  = useState<Transacao | null>(null)

  const filtered = useMemo(() => {
    let r = filtro === 'todos' ? txMes : txMes.filter(t => t.tipo === filtro)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(t =>
        t.descricao.toLowerCase().includes(q) ||
        (CATS[t.categoria as keyof typeof CATS]?.label ?? '').toLowerCase().includes(q)
      )
    }
    return r
  }, [txMes, filtro, search])

  return (
    <motion.div {...MOTION.fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 90 }}>

      {/* Edit modal */}
      {editingTx && (
        <div style={{ position: 'fixed', inset: 0, background: th.overlay, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingTx(null) }}>
          <div style={{ background: th.surf, borderRadius: 20, padding: 22, width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Editar Lançamento</span>
              <button onClick={() => setEditingTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textSm, fontSize: 17 }}>✕</button>
            </div>
            {/* Simple inline edit form */}
            {(['descricao', 'valor'] as const).map(k => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: th.textMd, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k === 'valor' ? 'Valor (R$)' : 'Descrição'}</label>
                <input className="field-input" value={k === 'valor' ? editingTx[k] : editingTx[k]}
                  onChange={e => setEditingTx(t => t ? { ...t, [k]: k === 'valor' ? e.target.value : e.target.value } : null)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: th.surfAlt, color: th.text, border: `1.5px solid ${th.border}`, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => { editTransacao(editingTx.id, { ...editingTx, valor: parseFloat(String(editingTx.valor)) || 0 }); setEditingTx(null) }} style={{ flex: 2 }}>Salvar</Button>
              <Button variant="ghost" onClick={() => setEditingTx(null)} style={{ flex: 1 }}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {([['Receitas', receitas, th.inc, th.incBg], ['Despesas', despesas, th.exp, th.expBg], ['Poupança', poupMes, th.sav, th.savBg]] as const).map(([l, v, c, bg]) => (
          <div key={l} style={{ background: bg, borderRadius: 11, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: c, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'Outfit, sans-serif' }}>R$ {brl(v)}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: th.textSm, pointerEvents: 'none' }} />
        <input
          placeholder="Buscar lançamentos…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: 10, fontSize: 13, background: th.surfAlt, color: th.text, border: `1.5px solid ${th.border}`, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* ── Filters + export ── */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTROS.map(({ v, l }) => (
          <motion.button key={v} onClick={() => setFiltro(v)} whileTap={{ scale: 0.96 }}
            style={{
              fontSize: 12, padding: '5px 13px', borderRadius: 99, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              background: filtro === v ? th.primary : th.surfAlt,
              color: filtro === v ? '#fff' : th.textMd,
              border: `1px solid ${filtro === v ? th.primary : th.border}`,
              fontWeight: filtro === v ? 600 : 400, transition: 'all 0.15s',
            }}>
            {l}
          </motion.button>
        ))}
        <button
          onClick={() => exportarCSV(txMes)}
          style={{
            marginLeft: 'auto', fontSize: 12, padding: '5px 11px', borderRadius: 99, cursor: 'pointer',
            background: th.savBg, color: th.sav, border: `1px solid ${th.sav}33`,
            display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif",
          }}>
          <Download size={11} /> CSV
        </button>
      </div>

      {/* ── List ── */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
          {MESES[filtroMes]}/{filtroAno} — {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
        </div>
        {filtered.length === 0
          ? <EmptyState icon="📋" title="Nenhum lançamento aqui" sub={search ? `Nenhum resultado para "${search}".` : 'Adicione receitas, despesas e poupança na aba Lançar.'} />
          : filtered.map(t => <TxRow key={t.id} t={t} onRemove={removerTransacao} onEdit={setEditingTx} />)
        }
      </Card>
    </motion.div>
  )
}



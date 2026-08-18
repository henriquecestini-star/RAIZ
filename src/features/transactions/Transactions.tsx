// src/features/transactions/Transactions.tsx
import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Repeat, Trash2, Pause, Play, Edit3 } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, useTheme } from '@/components/ui'
import { CATS, MESES, MOTION } from '@/lib/design-system'
import { brl } from '@/hooks/useFinancas'
import { splitByAllocation } from '@/hooks/useFinancas'
import type { useFinancas } from '@/hooks/useFinancas'
import type { Transacao, Recorrente } from '@/types'

type FinHook = ReturnType<typeof useFinancas>

const MES_ATUAL = new Date().getMonth()
const ANO_ATUAL = new Date().getFullYear()
const ANOS      = [ANO_ATUAL - 2, ANO_ATUAL - 1, ANO_ATUAL, ANO_ATUAL + 1]

// ── TxRow ───────────────────────────────────────────────────
export function TxRow({ t, onRemove, onEdit }: { t: Transacao; onRemove: (id: Transacao['id']) => void; onEdit?: (t: Transacao) => void }) {
  const th  = useTheme()
  const cor = t.tipo === 'receita' ? th.inc : t.tipo === 'poupanca' ? th.sav : th.exp
  const [hov, setHov] = useState(false)

  return (
    <motion.div layout
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 6px', borderBottom: `0.5px solid ${th.border}`,
        background: hov ? th.surfAlt : 'transparent', borderRadius: 8, transition: 'background 0.15s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, color: th.text, minWidth: 0 }}>
        <span style={{ fontSize: 17, flexShrink: 0 }}>{CATS[t.categoria as keyof typeof CATS]?.icon ?? (t.tipo === 'receita' ? '💚' : '💙')}</span>
        <span style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
            {t.descricao}{t._virtual ? ' 🔄' : ''}
          </div>
          <div style={{ fontSize: 10, color: th.textSm }}>{MESES[t.mes]}/{t.ano}</div>
        </span>
      </span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, color: cor, fontFamily: 'Outfit, sans-serif', fontSize: 13 }}>
          {t.tipo === 'despesa' ? '−' : '+'}R$ {brl(t.valor)}
        </span>
        <AnimatePresence>
          {hov && !t._virtual && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 3 }}>
              {onEdit && (
                <button onClick={() => onEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textSm, padding: 3, borderRadius: 5, fontSize: 12 }}>✏️</button>
              )}
              <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.exp, padding: 3, borderRadius: 5, fontSize: 12 }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Edit Tx Modal ───────────────────────────────────────────
function EditTxModal({ t, onSave, onClose }: { t: Transacao; onSave: (id: Transacao['id'], u: Partial<Transacao>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...t, valor: String(t.valor) })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open title="Editar Lançamento" onClose={onClose}>
      <Field label="Descrição"><Input value={form.descricao} onChange={e => upd('descricao', e.target.value)} /></Field>
      <Field label="Valor (R$)"><Input type="number" value={form.valor} onChange={e => upd('valor', e.target.value)} /></Field>
      {form.tipo === 'despesa' && (
        <Field label="Categoria">
          <Select value={form.categoria} onChange={e => upd('categoria', e.target.value)}>
            {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </Select>
        </Field>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Button onClick={() => { onSave(t.id, { ...form, valor: parseFloat(form.valor) || 0 }); onClose() }} style={{ flex: 2 }}>Salvar</Button>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
      </div>
    </Modal>
  )
}

// ── Edit Recurrent Modal ────────────────────────────────────
function EditRecModal({ r, onSave, onClose }: { r: Recorrente; onSave: (id: number, u: Partial<Recorrente>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...r, valor: String(r.valor) })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open title="Editar Recorrente" onClose={onClose}>
      <Field label="Descrição"><Input value={form.descricao} onChange={e => upd('descricao', e.target.value)} /></Field>
      <Field label="Valor (R$)"><Input type="number" value={form.valor} onChange={e => upd('valor', e.target.value)} /></Field>
      <Field label="Categoria">
        <Select value={form.categoria} onChange={e => upd('categoria', e.target.value)}>
          {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </Select>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Button onClick={() => { onSave(r.id, { ...form, valor: parseFloat(form.valor) || 0 }); onClose() }} style={{ flex: 2 }}>Salvar</Button>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
      </div>
    </Modal>
  )
}

// ── Main Transactions Page ──────────────────────────────────
export function Transactions({ fin }: { fin: FinHook }) {
  const th = useTheme()
  const { addTransacao, addTxWithAlloc, raw, removerRecorrente, pauseRecorrente, editRecorrente, removerTransacao, editTransacao, metas } = fin

  const [form, setForm] = useState({
    tipo: 'despesa' as const, valor: '', descricao: '', categoria: 'alimentacao' as const,
    mes: MES_ATUAL, ano: ANO_ATUAL, recorrente: false, repetir: 1, metaId: '',
  })
  const [ok,         setOk]         = useState('')
  const [editingTx,  setEditingTx]  = useState<Transacao | null>(null)
  const [editingRec, setEditingRec] = useState<Recorrente | null>(null)
  const upd = useCallback(<K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v })), [])

  // Allocation preview
  const allocPreview = useMemo(() => {
    if (form.tipo !== 'poupanca' || form.metaId || !form.valor) return []
    return splitByAllocation(parseFloat(form.valor) || 0, metas)
  }, [form.tipo, form.metaId, form.valor, metas])

  const submit = useCallback(() => {
    if (!form.valor || !form.descricao) return
    addTxWithAlloc(form)
    const reps = form.recorrente ? 1 : form.repetir
    setForm(f => ({ ...f, valor: '', descricao: '', repetir: 1, recorrente: false }))
    setOk(`✓ ${reps > 1 ? `${reps} lançamentos adicionados` : 'Lançamento adicionado'}!`)
    setTimeout(() => setOk(''), 3000)
  }, [form, addTxWithAlloc])

  const TIPOS = [
    { v: 'despesa',  l: '🔴 Despesa'  },
    { v: 'receita',  l: '💚 Receita'  },
    { v: 'poupanca', l: '💙 Poupança' },
  ] as const

  const typeColors: Record<string, { bg: string; color: string; border: string }> = {
    despesa:  { bg: th.expBg, color: th.exp, border: `${th.exp}44` },
    receita:  { bg: th.incBg, color: th.inc, border: `${th.inc}44` },
    poupanca: { bg: th.savBg, color: th.sav, border: `${th.sav}44` },
  }

  return (
    <motion.div {...MOTION.fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 90 }}>

      {/* Edit modals */}
      {editingTx  && <EditTxModal  t={editingTx}  onSave={(id, u) => { editTransacao(id, u); setEditingTx(null)  }} onClose={() => setEditingTx(null)}  />}
      {editingRec && <EditRecModal r={editingRec} onSave={(id, u) => { editRecorrente(id, u); setEditingRec(null) }} onClose={() => setEditingRec(null)} />}

      {/* ── Form ── */}
      <Card>
        <div style={{ fontSize: 16, fontWeight: 800, color: th.text, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>Novo Lançamento</div>

        <AnimatePresence>
          {ok && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: th.incBg, color: th.inc, border: `1px solid ${th.inc}33`, borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={13} /> {ok}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
          {TIPOS.map(opt => {
            const active = form.tipo === opt.v
            const colors = typeColors[opt.v]!
            return (
              <motion.button key={opt.v} onClick={() => upd('tipo', opt.v)} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 10, cursor: 'pointer',
                  fontWeight: active ? 700 : 400, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  background: active ? colors.bg : th.surfAlt,
                  color: active ? colors.color : th.textMd,
                  border: `1.5px solid ${active ? colors.border : th.border}`,
                  transition: 'all 0.15s',
                }}>
                {opt.l}
              </motion.button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <Field label="Valor (R$)">
            <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.valor} onChange={e => upd('valor', e.target.value)} />
          </Field>
          <Field label={form.tipo === 'despesa' ? 'Categoria' : 'Tipo'}>
            {form.tipo === 'despesa'
              ? <Select value={form.categoria} onChange={e => upd('categoria', e.target.value as typeof form.categoria)}>
                  {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </Select>
              : <Input value={form.tipo === 'receita' ? 'Receita' : 'Poupança'} readOnly style={{ color: th.textMd, cursor: 'default' }} />
            }
          </Field>
        </div>

        <Field label="Descrição">
          <Input placeholder="Ex: Aluguel, Supermercado, Salário…" value={form.descricao} onChange={e => upd('descricao', e.target.value)} />
        </Field>

        {/* Savings meta selector */}
        {form.tipo === 'poupanca' && metas.filter(m => m.ativa).length > 1 && (
          <Field label="Direcionar para">
            <Select value={form.metaId} onChange={e => upd('metaId', e.target.value)}>
              <option value="">Alocação automática por %</option>
              {metas.filter(m => m.ativa).map(m => <option key={m.id} value={m.id}>{m.icone} {m.nome} ({m.alocacaoPct}%)</option>)}
            </Select>
          </Field>
        )}

        {/* Allocation preview */}
        <AnimatePresence>
          {allocPreview.length > 1 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: th.savBg, borderRadius: 10, padding: '10px 12px', marginBottom: 10, border: `0.5px solid ${th.sav}33` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: th.sav, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 7 }}>Prévia da alocação automática</div>
              {allocPreview.map(sp => {
                const meta = metas.find(m => m.id === sp.metaId)
                return meta ? (
                  <div key={sp.metaId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: th.textMd }}>{meta.icone} {meta.nome} ({meta.alocacaoPct}%)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: th.sav, fontFamily: 'Outfit, sans-serif' }}>R$ {brl(sp.valor)}</span>
                  </div>
                ) : null
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <Field label="Mês">
            <Select value={form.mes} onChange={e => upd('mes', +e.target.value as typeof form.mes)}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Ano">
            <Select value={form.ano} onChange={e => upd('ano', +e.target.value)}>
              {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
          </Field>
          <Field label="Repetir">
            {form.recorrente
              ? <Input value="∞ mensal" readOnly style={{ color: th.textMd, cursor: 'default' }} />
              : <Input type="number" min="1" max="24" value={form.repetir} onChange={e => upd('repetir', +e.target.value)} />
            }
          </Field>
        </div>

        {/* Recurring toggle */}
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => upd('recorrente', !form.recorrente)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
            background: form.recorrente ? th.savBg : th.surfAlt, borderRadius: 10, cursor: 'pointer',
            border: `1.5px solid ${form.recorrente ? `${th.sav}44` : th.border}`, marginBottom: 14, transition: 'all 0.15s',
          }}>
          <div style={{
            width: 17, height: 17, borderRadius: 4,
            border: `2px solid ${form.recorrente ? th.sav : th.border}`,
            background: form.recorrente ? th.sav : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
          }}>
            {form.recorrente && <Check size={10} color="#fff" strokeWidth={3} />}
          </div>
          <Repeat size={14} color={form.recorrente ? th.sav : th.textSm} />
          <span style={{ fontSize: 13, color: form.recorrente ? th.sav : th.textMd, fontWeight: form.recorrente ? 600 : 400 }}>Recorrente mensal</span>
        </motion.div>

        <Button onClick={submit} style={{ width: '100%', fontSize: 14, padding: '12px 20px', borderRadius: 14 }}>
          <Check size={15} /> Adicionar Lançamento
        </Button>
      </Card>

      {/* ── Recurrents manager ── */}
      {raw.recorrentes.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 10, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Repeat size={14} /> Recorrentes
          </div>
          {raw.recorrentes.map(r => (
            <motion.div layout key={r.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 11px', borderRadius: 10, background: r.pausado ? th.surfAlt : th.savBg, marginBottom: 6, opacity: r.pausado ? 0.65 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{CATS[r.categoria as keyof typeof CATS]?.icon ?? '🔄'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{r.descricao}</div>
                  <div style={{ fontSize: 10, color: th.textSm }}>{r.pausado ? '⏸ Pausado' : '▶ Ativo · todo mês'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: r.pausado ? th.textMd : th.sav, fontFamily: 'Outfit, sans-serif' }}>R$ {brl(r.valor)}</span>
                <button onClick={() => setEditingRec(r)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textSm, padding: 3, fontSize: 12 }}>✏️</button>
                <button onClick={() => pauseRecorrente(r.id)} title={r.pausado ? 'Ativar' : 'Pausar'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.warn, padding: 3, fontSize: 13 }}>
                  {r.pausado ? <Play size={13} /> : <Pause size={13} />}
                </button>
                <button onClick={() => removerRecorrente(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.exp, padding: 3 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </Card>
      )}

      {/* ── Recent ── */}
      {raw.transacoes.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Últimos Lançamentos</div>
          {raw.transacoes.slice(0, 8).map(t => <TxRow key={t.id} t={t} onRemove={removerTransacao} onEdit={setEditingTx} />)}
        </Card>
      )}
    </motion.div>
  )
}



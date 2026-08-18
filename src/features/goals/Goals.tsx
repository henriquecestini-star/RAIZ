// src/features/goals/Goals.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Edit3, Trash2, Archive } from 'lucide-react'
import { Card, Button, Input, Select, Field, ProgressBar, Modal, EmptyState, useTheme } from '@/components/ui'
import { LEVELS, MOTION, getLevel } from '@/lib/design-system'
import { brl, pct } from '@/hooks/useFinancas'
import type { useFinancas } from '@/hooks/useFinancas'
import type { Meta } from '@/types'

type FinHook = ReturnType<typeof useFinancas>

const ICONES = ['🏠','🚗','✈️','💻','📚','🏥','💍','🎓','🏋️','🌴','🎯','💎','🛵','🍕','🎸','🏄','🎹','🏡']
const CORES  = ['#0F5C42','#1558B0','#C04080','#D4860A','#7260D8','#1A9E9B','#C93030','#444444']

// ── Goal form ───────────────────────────────────────────────
interface GoalFormState {
  nome: string; valor: string; descricao: string
  icone: string; cor: string; deadline: string; alocacaoPct: number
}

const DEFAULT_FORM: GoalFormState = { nome: '', valor: '', descricao: '', icone: '🎯', cor: '#0F5C42', deadline: '', alocacaoPct: 0 }

function GoalForm({ initial, title, onSave, onClose, totalAllocOthers }: {
  initial: GoalFormState; title: string
  onSave: (f: GoalFormState) => void; onClose: () => void
  totalAllocOthers: number
}) {
  const th  = useTheme()
  const [form, setForm] = useState(initial)
  const upd = <K extends keyof GoalFormState>(k: K, v: GoalFormState[K]) => setForm(f => ({ ...f, [k]: v }))
  const maxAlloc = 100 - totalAllocOthers

  return (
    <Modal open title={title} onClose={onClose}>
      <Field label="Nome">
        <Input placeholder="Ex: Viagem, Carro…" value={form.nome} onChange={e => upd('nome', e.target.value)} />
      </Field>
      <Field label="Valor (R$)">
        <Input type="number" placeholder="0,00" value={form.valor} onChange={e => upd('valor', e.target.value)} />
      </Field>
      <Field label="Prazo (opcional)">
        <Input type="month" value={form.deadline} onChange={e => upd('deadline', e.target.value)} />
      </Field>
      <Field label={`Alocação automática de poupança: ${form.alocacaoPct}%`}>
        <input type="range" min={0} max={maxAlloc} step={5} value={form.alocacaoPct}
          onChange={e => upd('alocacaoPct', +e.target.value)}
          style={{ width: '100%', accentColor: th.primary }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: th.textSm, marginTop: 2 }}>
          <span>0%</span><span>50%</span><span>{maxAlloc}%</span>
        </div>
        {form.alocacaoPct > 0 && (
          <div style={{ fontSize: 11, color: th.sav, marginTop: 4 }}>
            {form.alocacaoPct}% das poupanças sem meta específica irão para esta meta
          </div>
        )}
      </Field>
      <Field label="Ícone">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ICONES.map(ic => (
            <button key={ic} onClick={() => upd('icone', ic)}
              style={{ width: 32, height: 32, borderRadius: 7, cursor: 'pointer', fontSize: 15, border: `1.5px solid ${form.icone === ic ? th.primary : th.border}`, background: form.icone === ic ? th.primaryBg : th.surfAlt }}>
              {ic}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Cor">
        <div style={{ display: 'flex', gap: 7 }}>
          {CORES.map(c => (
            <button key={c} onClick={() => upd('cor', c)}
              style={{ width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', background: c, border: 'none', outline: form.cor === c ? `3px solid ${c}` : '3px solid transparent', outlineOffset: 2, transition: 'outline 0.15s' }} />
          ))}
        </div>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Button onClick={() => { if (form.nome && form.valor) onSave(form) }} style={{ flex: 2 }}>Salvar</Button>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
      </div>
    </Modal>
  )
}

// ── Goal Card ───────────────────────────────────────────────
function GoalCard({ meta, poupReal, idx, total, onEdit, onArchive, onDelete, onReorder }: {
  meta: Meta; poupReal: number; idx: number; total: number
  onEdit: () => void; onArchive: () => void; onDelete: () => void
  onReorder: (dir: 'up' | 'down') => void
}) {
  const th    = useTheme()
  const pp    = meta.valor > 0 ? Math.min((poupReal / meta.valor) * 100, 100) : 0
  const lv    = getLevel(pp)
  const daysLeft = meta.deadline
    ? Math.ceil((new Date(meta.deadline + '-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div layout {...MOTION.item}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Reorder controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, paddingTop: 2 }}>
            <button onClick={() => onReorder('up')} disabled={idx === 0 || meta.principal}
              style={{ width: 26, height: 26, borderRadius: 7, cursor: idx === 0 || meta.principal ? 'not-allowed' : 'pointer', border: `0.5px solid ${th.border}`, background: th.surfAlt, color: th.textMd, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === 0 || meta.principal ? 0.3 : 1, transition: 'all 0.15s', padding: 0 }}>
              <ChevronUp size={14} />
            </button>
            <button onClick={() => onReorder('down')} disabled={idx === total - 1}
              style={{ width: 26, height: 26, borderRadius: 7, cursor: idx === total - 1 ? 'not-allowed' : 'pointer', border: `0.5px solid ${th.border}`, background: th.surfAlt, color: th.textMd, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === total - 1 ? 0.3 : 1, transition: 'all 0.15s', padding: 0 }}>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Icon */}
          <div style={{ width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0, background: `${meta.cor}18` }}>
            {meta.icone}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{meta.nome}</div>
              {meta.principal && (
                <span style={{ fontSize: 10, fontWeight: 700, color: meta.cor, background: `${meta.cor}18`, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>Principal</span>
              )}
              {meta.alocacaoPct > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: th.sav, background: th.savBg, padding: '2px 7px', borderRadius: 99 }}>{meta.alocacaoPct}% auto</span>
              )}
            </div>
            {meta.descricao && <div style={{ fontSize: 11, color: th.textSm, marginBottom: 5 }}>{meta.descricao}</div>}
            {daysLeft !== null && (
              <div style={{ fontSize: 10, color: daysLeft < 30 ? th.exp : th.textMd, marginBottom: 5 }}>
                {daysLeft > 0 ? `⏱ ${daysLeft} dias restantes` : '⏰ Prazo atingido'}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: th.textMd }}>R$ {brl(poupReal)} de R$ {brl(meta.valor)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12 }}>{lv.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: meta.cor, fontFamily: 'Outfit, sans-serif' }}>{pct(pp)}</span>
              </div>
            </div>
            <ProgressBar value={pp} max={100} color={meta.cor} height={6} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
          <button onClick={onEdit}
            style={{ flex: 1, padding: '7px', borderRadius: 9, cursor: 'pointer', fontSize: 12, background: th.surfAlt, color: th.textMd, border: `0.5px solid ${th.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
            <Edit3 size={12} /> Editar
          </button>
          {!meta.principal && (
            <>
              <button onClick={onArchive}
                style={{ padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 12, background: th.warnBg, color: th.warn, border: `0.5px solid ${th.warn}22`, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Archive size={12} />
              </button>
              <button onClick={onDelete}
                style={{ padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 12, background: th.expBg, color: th.exp, border: `0.5px solid ${th.exp}22`, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ── Main Goals Page ─────────────────────────────────────────
export function Goals({ fin }: { fin: FinHook }) {
  const th = useTheme()
  const { metas, addMeta, salvarMeta, archiveMeta, removerMeta, reorderMeta, raw } = fin

  const [showForm,     setShowForm]     = useState(false)
  const [editId,       setEditId]       = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const archived = (raw.metas ?? []).filter(m => m.archived)
  const sortedMetas = [...metas].sort((a, b) => a.ordem - b.ordem)

  // Total alloc already committed (for max slider calc)
  const totalAlloc = metas.reduce((s, m) => s + m.alocacaoPct, 0)
  const allocOk    = totalAlloc === 100 || metas.length <= 1

  const openAdd  = () => { setEditId(null);  setShowForm(true) }
  const openEdit = (meta: Meta) => { setEditId(meta.id); setShowForm(true) }

  const handleSave = (form: GoalFormState) => {
    const updates = { ...form, valor: parseFloat(form.valor) || 0, alocacaoPct: form.alocacaoPct }
    if (editId) { salvarMeta(editId, updates); setEditId(null) }
    else addMeta({ ...updates, ativa: true, principal: false, ordem: 999 })
    setShowForm(false)
  }

  const initialForm = (meta?: Meta): GoalFormState => meta
    ? { nome: meta.nome, valor: String(meta.valor), descricao: meta.descricao, icone: meta.icone, cor: meta.cor, deadline: meta.deadline, alocacaoPct: meta.alocacaoPct }
    : DEFAULT_FORM

  const totalAllocOthers = (id: number | null) =>
    metas.filter(m => m.id !== id).reduce((s, m) => s + m.alocacaoPct, 0)

  return (
    <motion.div {...MOTION.fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 90 }}>

      {/* Goal form modal */}
      {showForm && (
        <GoalForm
          initial={initialForm(editId ? metas.find(m => m.id === editId) : undefined)}
          title={editId ? 'Editar Meta' : 'Nova Meta'}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditId(null) }}
          totalAllocOthers={totalAllocOthers(editId)}
        />
      )}

      {/* Allocation overview */}
      {metas.length > 1 && (
        <Card style={{ padding: '13px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Alocação de Poupança</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: allocOk ? th.inc : th.warn }}>{totalAlloc}% {allocOk ? '✓' : '⚠️ revisar'}</div>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', gap: 1 }}>
            {metas.filter(m => m.alocacaoPct > 0).map(m => (
              <motion.div key={m.id} initial={{ width: '0%' }} animate={{ width: `${m.alocacaoPct}%` }}
                transition={{ duration: 0.8 }}
                style={{ background: m.cor, borderRadius: 2 }} title={`${m.nome}: ${m.alocacaoPct}%`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
            {metas.filter(m => m.alocacaoPct > 0).map(m => (
              <span key={m.id} style={{ fontSize: 10, color: th.textMd, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: m.cor, display: 'inline-block' }} />
                {m.nome}: {m.alocacaoPct}%
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Goal cards */}
      {sortedMetas.length === 0
        ? <EmptyState icon="🎯" title="Nenhuma meta ativa" sub="Crie metas para acompanhar seu progresso financeiro." action="Criar primeira meta" onAction={openAdd} />
        : (
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} variants={MOTION.stagger} animate="animate">
            {sortedMetas.map((meta, idx) => {
              const poupReal = meta.principal
                ? raw.transacoes.filter(t => t.tipo === 'poupanca' && (!t.metaId || t.metaId === meta.id)).reduce((s, t) => s + t.valor, 0)
                : raw.transacoes.filter(t => t.tipo === 'poupanca' && t.metaId === meta.id).reduce((s, t) => s + t.valor, 0)
              return (
                <GoalCard key={meta.id} meta={meta} poupReal={poupReal} idx={idx} total={sortedMetas.length}
                  onEdit={() => openEdit(meta)}
                  onArchive={() => { if (confirm('Arquivar esta meta?')) archiveMeta(meta.id) }}
                  onDelete={() => { if (confirm('Excluir esta meta?')) removerMeta(meta.id) }}
                  onReorder={dir => reorderMeta(meta.id, dir)}
                />
              )
            })}
          </motion.div>
        )
      }

      {/* Add button */}
      <motion.button whileHover={{ borderColor: th.primary }} whileTap={{ scale: 0.98 }}
        onClick={openAdd}
        style={{ padding: 13, borderRadius: 14, cursor: 'pointer', border: `1.5px dashed ${th.borderMd}`, background: 'transparent', color: th.textMd, fontSize: 13, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'border-color 0.15s' }}>
        + Nova Meta
      </motion.button>

      {/* Archived */}
      {archived.length > 0 && (
        <div>
          <button onClick={() => setShowArchived(v => !v)}
            style={{ fontSize: 12, color: th.textSm, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            {showArchived ? '▲ Ocultar arquivadas' : `▼ ${archived.length} arquivada(s)`}
          </button>
          <AnimatePresence>
            {showArchived && archived.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: th.surfAlt, borderRadius: 9, marginTop: 6, opacity: 0.65 }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><span>{m.icone}</span>{m.nome}</span>
                <Button variant="danger" size="sm" onClick={() => { if (confirm('Excluir?')) removerMeta(m.id) }}>🗑️</Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}



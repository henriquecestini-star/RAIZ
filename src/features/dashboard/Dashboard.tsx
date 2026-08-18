// src/features/dashboard/Dashboard.tsx
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Card, ProgressBar, ProgressRing, DashboardSkeleton, EmptyState } from '@/components/ui'
import { useTheme } from '@/components/ui'
import { MOTION, LEVELS } from '@/lib/design-system'
import { brl, pct, fmtK } from '@/hooks/useFinancas'
import type { useFinancas } from '@/hooks/useFinancas'

type FinHook = ReturnType<typeof useFinancas>

// ── House Progress ─────────────────────────────────────────
function HouseProgress({ progress, level }: { progress: number; level: typeof LEVELS[0] }) {
  const p  = Math.min(progress / 100, 1)
  const fh = p * 104

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <motion.div animate={{ y: p > 0 ? [0, -4, 0] : 0 }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <svg width={86} height={108} viewBox="0 0 86 108" fill="none">
          <defs>
            <clipPath id="house-clip">
              <path d="M43 7 L79 37 L75 37 L75 95 L11 95 L11 37 L7 37 Z" />
            </clipPath>
            <linearGradient id="house-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.75)" />
            </linearGradient>
          </defs>
          {/* House outline */}
          <path d="M43 7 L79 37 L75 37 L75 95 L11 95 L11 37 L7 37 Z" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
          {/* Fill */}
          {p > 0 && (
            <motion.rect
              x={0} y={95 - fh} width={86} height={fh}
              fill="url(#house-fill)" clipPath="url(#house-clip)"
              initial={{ y: 95, height: 0 }}
              animate={{ y: 95 - fh, height: fh }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
          {/* Door */}
          <rect x={33} y={68} width={20} height={27} rx={3} fill={p > 0.4 ? 'rgba(255,255,255,0.25)' : 'none'} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
          {/* Windows */}
          <rect x={16} y={52} width={13} height={11} rx={2} fill={p > 0.25 ? 'rgba(255,255,255,0.25)' : 'none'} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
          <rect x={57} y={52} width={13} height={11} rx={2} fill={p > 0.25 ? 'rgba(255,255,255,0.25)' : 'none'} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
          {/* Chimney */}
          <rect x={57} y={15} width={9} height={16} rx={2} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.38)" strokeWidth={1.5} />
          {/* Smoke */}
          {p > 0.8 && [{ cx: 61, cy: 10, r: 3, delay: 0 }, { cx: 64, cy: 6, r: 2, delay: 0.5 }].map((s, i) => (
            <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="rgba(255,255,255,0.5)"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: s.delay }} />
          ))}
        </svg>
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{pct(p * 100)}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{level.name} {level.icon}</div>
      </div>
    </div>
  )
}

// ── Momentum ────────────────────────────────────────────────
function MomentumBar({ score }: { score: number }) {
  const th = useTheme()
  const label = score >= 75 ? 'Acelerando 🚀' : score >= 50 ? 'Bom ritmo 📈' : score >= 25 ? 'Atenção ⚠️' : 'Pausado 💤'
  const segs  = [
    { cor: th.inc, w: Math.min(score, 40) },
    { cor: th.sav, w: Math.min(Math.max(score - 40, 0), 30) },
    { cor: th.accent, w: Math.min(Math.max(score - 70, 0), 30) },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: th.textSm, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Momentum</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: th.primary }}>{score}%</span>
      </div>
      <div style={{ display: 'flex', gap: 2, height: 5 }}>
        {segs.map((s, i) => (
          <motion.div key={i} initial={{ width: '0%' }} animate={{ width: `${s.w}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ background: s.cor, height: '100%', borderRadius: 99 }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: th.textMd, marginTop: 3 }}>{label}</div>
    </div>
  )
}

// ── KPI Card ────────────────────────────────────────────────
function KpiCard({ label, value, color, bg, icon, trend }: { label: string; value: number; color: string; bg?: string; icon?: string; trend?: number }) {
  const th = useTheme()
  return (
    <motion.div whileHover={{ y: -2 }} style={{ background: bg ?? th.surfAlt, borderRadius: 14, padding: '13px 14px', border: `0.5px solid ${th.border}`, flex: 1, minWidth: 118, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: th.textSm, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>R$ {brl(value)}</div>
      {trend !== undefined && trend !== 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
          {trend > 0 ? <TrendingUp size={10} color={th.exp} /> : <TrendingDown size={10} color={th.inc} />}
          <span style={{ fontSize: 10, color: trend > 0 ? th.exp : th.inc }}>
            {trend > 0 ? '+' : ''}{brl(Math.abs(trend))}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Dashboard ──────────────────────────────────────────
interface DashboardProps {
  fin: FinHook
  onAnalise: () => void
}

export function Dashboard({ fin, onAnalise }: DashboardProps) {
  const th = useTheme()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t) }, [])

  const { rec, desp, poupm, saldo, totalPri, porCat, hist12, tend, score, mom, streak, metas, metaPri, metaPct, metaV, level, raw, insights } = fin
  const mesesRest  = poupm > 0 && metaV > totalPri ? Math.ceil((metaV - totalPri) / poupm) : null
  const taxaPoup   = rec > 0 ? (poupm / rec) * 100 : 0
  const CTT        = { contentStyle: { background: th.surf, border: `1px solid ${th.border}`, borderRadius: 10, fontSize: 11, padding: '6px 10px', color: th.text } }

  if (loading) return <DashboardSkeleton />

  return (
    <motion.div {...MOTION.fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 90 }}>

      {/* ── Hero Card ── */}
      <div style={{
        background: `linear-gradient(135deg, ${th.primaryDk}, ${th.primary})`,
        borderRadius: 20, padding: '20px 22px', overflow: 'hidden', position: 'relative',
        boxShadow: `0 6px 32px ${th.primaryDk}55`,
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Meta Principal</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>{metaPri?.nome ?? 'Casa Própria'}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{level.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{level.name}</span>
            </div>
            {streak >= 1 && (
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12 }}>🔥</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{streak} meses</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <HouseProgress progress={metaPct} level={level} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>R$ {brl(totalPri)} de R$ {brl(metaV)}</p>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 7 }}>
              <motion.div initial={{ width: '0%' }} animate={{ width: `${metaPct}%` }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 99, boxShadow: '0 0 8px rgba(255,255,255,0.4)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Próximo nível: {level.max}%</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{pct(metaPct)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {mesesRest && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.13)', padding: '3px 9px', borderRadius: 99 }}>≈ {mesesRest} meses</span>}
              {taxaPoup > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.13)', padding: '3px 9px', borderRadius: 99 }}>{pct(taxaPoup)} ao mês</span>}
              {tend < 0 && <span style={{ fontSize: 11, color: 'rgba(180,255,220,0.9)', background: 'rgba(30,200,100,0.15)', padding: '3px 9px', borderRadius: 99 }}>↓ gastos</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        <KpiCard label="Receitas" value={rec}   color={th.inc} bg={th.incBg} icon="💚" />
        <KpiCard label="Despesas" value={desp}  color={th.exp} bg={th.expBg} icon="🔴" trend={tend} />
        <KpiCard label="Poupança" value={poupm} color={th.sav} bg={th.savBg} icon="💙" />
        <KpiCard label="Saldo"    value={saldo} color={saldo >= 0 ? th.inc : th.exp} />
      </div>

      {/* ── Score + Momentum ── */}
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <ProgressRing score={score} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: th.textSm, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Saúde Financeira</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: th.text, fontFamily: 'Outfit, sans-serif' }}>Score {score}/100</div>
            </div>
            <div style={{ background: th.surfAlt, borderRadius: 10, padding: '9px 11px' }}>
              <MomentumBar score={mom} />
            </div>
            {[['Taxa poupança', taxaPoup, 20, th.sav], ['Controle', desp > 0 && rec > 0 ? Math.max(0, 100 - (desp / rec) * 100) : 50, 60, th.inc]].map(([l, v, max, c]) => (
              <div key={l as string}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: th.textSm }}>{l as string}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: c as string }}>{pct(v as number)}</span>
                </div>
                <ProgressBar value={v as number} max={max as number} color={c as string} height={4} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => {
            const bgMap = { good: th.incBg, warn: th.warnBg, bad: th.expBg, tip: th.savBg }
            const cMap  = { good: th.inc,   warn: th.warn,   bad: th.exp,   tip: th.sav  }
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ background: bgMap[ins.type], borderRadius: 12, padding: '9px 13px', display: 'flex', gap: 10, alignItems: 'flex-start', border: `0.5px solid ${cMap[ins.type]}22` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cMap[ins.type], marginBottom: 1 }}>{ins.title}</div>
                  <div style={{ fontSize: 11, color: th.textMd, lineHeight: 1.5 }}>{ins.msg}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Area Chart ── */}
      {hist12.some(m => m.receitas > 0 || m.despesas > 0) && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Evolução — 12 meses</div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hist12} margin={{ top: 5, right: 5, bottom: 0, left: -22 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={th.inc} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={th.inc} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={th.exp} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={th.exp} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip {...CTT} formatter={v => [`R$ ${brl(v as number)}`, '']} />
                <Area type="monotone" dataKey="receitas" stroke={th.inc} strokeWidth={2} fill="url(#gInc)" dot={false} />
                <Area type="monotone" dataKey="despesas" stroke={th.exp} strokeWidth={2} fill="url(#gExp)" dot={false} />
                <Area type="monotone" dataKey="poupanca" stroke={th.sav} strokeWidth={1.5} fill="none" strokeDasharray="5 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            {[['Receitas', th.inc], ['Despesas', th.exp], ['Poupança', th.sav]].map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: th.textMd }}>
                <span style={{ width: 16, height: 2, background: c, borderRadius: 2, display: 'inline-block' }} />
                {l}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* ── Categories Pie ── */}
      {porCat.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Gastos por Categoria</div>
          <div style={{ display: 'grid', gridTemplateColumns: '148px 1fr', gap: 14, alignItems: 'center' }}>
            <div style={{ height: 158 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porCat} dataKey="value" cx="50%" cy="50%" outerRadius={68} innerRadius={34} paddingAngle={2}>
                    {porCat.map((c, i) => <Cell key={i} fill={c.cor} />)}
                  </Pie>
                  <Tooltip contentStyle={CTT.contentStyle} formatter={v => [`R$ ${brl(v as number)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {porCat.slice(0, 5).map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: c.cor, flexShrink: 0, display: 'inline-block' }} />
                      {c.icon} {c.name}
                    </span>
                    <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>R$ {brl(c.value)}</span>
                  </div>
                  <ProgressBar value={c.pctRec} max={100} color={c.cor} height={3} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Empty state ── */}
      {hist12.every(m => m.receitas === 0 && m.despesas === 0) && (
        <EmptyState icon="📊" title="Nenhum dado ainda" sub="Adicione receitas e despesas para ver sua evolução financeira aqui." action="Adicionar primeiro lançamento" />
      )}

      {/* ── Other goals ── */}
      {metas.filter(m => !m.principal && m.ativa).length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Outras Metas</div>
          {metas.filter(m => !m.principal && m.ativa).map(meta => {
            const poupR = raw.transacoes.filter(t => t.tipo === 'poupanca' && t.metaId === meta.id).reduce((s, t) => s + t.valor, 0)
            const pp    = meta.valor > 0 ? Math.min((poupR / meta.valor) * 100, 100) : 0
            return (
              <div key={meta.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: th.surfAlt, borderRadius: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 17 }}>{meta.icone}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ fontWeight: 500 }}>{meta.nome}</span>
                    <span style={{ fontWeight: 800, color: meta.cor, fontFamily: 'Outfit, sans-serif' }}>{pct(pp)}</span>
                  </div>
                  <ProgressBar value={pp} max={100} color={meta.cor} height={4} />
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* ── AI CTA ── */}
      <motion.button
        whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(10,61,43,0.45)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onAnalise}
        style={{
          width: '100%', padding: 14, fontWeight: 700, fontSize: 14, borderRadius: 14, cursor: 'pointer',
          background: `linear-gradient(135deg, ${th.primaryDk}, ${th.primary})`,
          color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 4px 20px ${th.primaryDk}55`,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Sparkles size={16} />
        Analisar com IA — diagnóstico + plano de ação
      </motion.button>
    </motion.div>
  )
}



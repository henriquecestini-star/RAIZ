// src/features/ai/AIAnalysis.tsx
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, Button, useTheme } from '@/components/ui'
import { MESES, MOTION } from '@/lib/design-system'
import { brl, pct } from '@/hooks/useFinancas'
import { buildPrompt, analisarFinancas } from '@/services/ai'
import type { useFinancas } from '@/hooks/useFinancas'

type FinHook = ReturnType<typeof useFinancas>

function MarkdownRenderer({ text }: { text: string }) {
  const th = useTheme()
  return (
    <div>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return (
          <div key={i} style={{ marginTop: i > 0 ? 18 : 0, paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? `0.5px solid ${th.border}` : 'none' }}>
            <p style={{ margin: '0 0 7px', fontWeight: 800, fontSize: 14, color: th.text, fontFamily: 'Outfit, sans-serif' }}>{line.slice(3)}</p>
          </div>
        )
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <p key={i} style={{ margin: '4px 0', paddingLeft: 14, fontSize: 13, color: th.text, lineHeight: 1.65 }}>
            <span style={{ color: th.primary, marginRight: 4 }}>›</span>{line.slice(2)}
          </p>
        )
        if (line.startsWith('**') && line.endsWith('**')) return (
          <p key={i} style={{ margin: '4px 0', fontSize: 13, fontWeight: 600, color: th.text, lineHeight: 1.65 }}>{line.slice(2, -2)}</p>
        )
        if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
        return <p key={i} style={{ margin: '3px 0', fontSize: 13, color: th.text, lineHeight: 1.7 }}>{line}</p>
      })}
    </div>
  )
}

export function AIAnalysis({ fin }: { fin: FinHook }) {
  const th = useTheme()
  const [analise, setAnalise] = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const analisar = useCallback(async () => {
    setLoading(true); setAnalise(''); setErr('')
    try {
      const prompt = buildPrompt({
        filtroMes:       fin.filtroMes,
        filtroAno:       fin.filtroAno,
        receitas:        fin.receitas,
        despesas:        fin.despesas,
        poupMes:         fin.poupMes,
        saldo:           fin.saldo,
        totalPoupPri:    fin.totalPoupPri,
        porCat:          fin.porCat,
        hist12:          fin.hist12,
        tendencia:       fin.tendencia,
        healthScore:     fin.healthScore,
        momentum:        fin.momentum,
        streak:          fin.streak,
        metas:           fin.metas,
        metaPrincipal:   fin.metaPrincipal,
        metaPct:         fin.metaPct,
        level:           fin.level,
        transacoesCount: fin.raw.transacoes.length,
      })
      setAnalise(await analisarFinancas(prompt))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }, [fin])

  if (loading) return (
    <motion.div {...MOTION.fadeUp} style={{ paddingBottom: 90 }}>
      <Card style={{ textAlign: 'center', padding: '52px 24px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{ width: 40, height: 40, border: `3px solid ${th.border}`, borderTopColor: th.primary, borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: th.textMd, fontSize: 14, fontWeight: 500 }}>Analisando suas finanças…</p>
        <p style={{ color: th.textSm, fontSize: 12, marginTop: 4 }}>Gerando diagnóstico e plano de 90 dias</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {[0,1,2].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i*0.2 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: th.primary }} />
          ))}
        </div>
      </Card>
    </motion.div>
  )

  if (err) return (
    <motion.div {...MOTION.fadeUp} style={{ paddingBottom: 90 }}>
      <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
        <AlertTriangle size={32} color={th.exp} style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ color: th.exp, fontSize: 14, marginBottom: 16 }}>{err}</p>
        <Button onClick={analisar} style={{ marginInline: 'auto' }}>Tentar novamente</Button>
      </Card>
    </motion.div>
  )

  if (analise) return (
    <motion.div {...MOTION.fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 90 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: th.inc, display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Análise — {MESES[fin.filtroMes]}/{fin.filtroAno}</span>
        </div>
        <button onClick={analisar} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 99, cursor: 'pointer', background: th.savBg, color: th.sav, border: `1px solid ${th.sav}33`, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
          <RefreshCw size={11} /> Atualizar
        </button>
      </div>
      <Card><MarkdownRenderer text={analise} /></Card>
    </motion.div>
  )

  return (
    <motion.div {...MOTION.fadeUp} style={{ paddingBottom: 90 }}>
      <Card style={{ textAlign: 'center', padding: '36px 24px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={MOTION.springFast}
          style={{ width: 64, height: 64, borderRadius: 20, background: th.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 }}>✨</motion.div>
        <h3 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Consultoria com IA</h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: th.primaryBg, borderRadius: 99, padding: '4px 12px', marginBottom: 12, fontSize: 12, color: th.primary, fontWeight: 600 }}>
          {fin.level.icon} {fin.level.name} · Score {fin.healthScore}/100 · Streak 🔥 {fin.streak}
        </div>
        <p style={{ fontSize: 13, color: th.textMd, margin: '0 0 22px', maxWidth: 320, marginInline: 'auto', lineHeight: 1.65 }}>
          Diagnóstico completo + projeção 3–12 meses + plano semanal personalizado.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 22, textAlign: 'left' }}>
          {[['🔬','Diagnóstico + Perfil'],['📈','Projeção 3–12 meses'],['⚡','Top 3 alertas'],['🏠','Plano semanal']].map(([ic,l]) => (
            <div key={l} style={{ background: th.surfAlt, borderRadius: 11, padding: '11px 13px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
              <p style={{ margin: 0, fontSize: 11, color: th.textMd, lineHeight: 1.4 }}>{l}</p>
            </div>
          ))}
        </div>
        <Button onClick={analisar} style={{ width: '100%', maxWidth: 300, marginInline: 'auto', fontSize: 14, padding: '13px 20px', borderRadius: 14 }}>
          <Sparkles size={15} /> Iniciar Análise
        </Button>
        <p style={{ fontSize: 11, color: th.textSm, marginTop: 10 }}>
          {fin.raw.transacoes.length === 0 ? 'Adicione lançamentos para análise mais precisa' : `${fin.raw.transacoes.length} lançamentos prontos`}
        </p>
      </Card>
    </motion.div>
  )
}



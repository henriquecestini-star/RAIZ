// src/features/onboarding/OnboardingFlow.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, useTheme } from '@/components/ui'
import { MOTION } from '@/lib/design-system'

export interface OnboardingData {
  goalName:     string
  goalValue:    string
  goalDeadline: string
  income:       string
}

interface Props { onComplete: (data: OnboardingData) => void }

export function OnboardingFlow({ onComplete }: Props) {
  const th  = useTheme()
  const [step, setStep]  = useState(0)
  const [dir,  setDir]   = useState(1)
  const [data, setData]  = useState<OnboardingData>({ goalName: 'Casa Própria', goalValue: '', goalDeadline: '', income: '' })
  const upd = (k: keyof OnboardingData, v: string) => setData(d => ({ ...d, [k]: v }))
  const next = () => { setDir(1);  setStep(s => s + 1) }
  const back = () => { setDir(-1); setStep(s => s - 1) }

  const mesesEst = data.income && data.goalValue
    ? Math.ceil(parseFloat(data.goalValue) / (parseFloat(data.income) * 0.2)) : null

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4,0,0.2,1] } },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40, transition: { duration: 0.2 } }),
  }

  const steps = [
    <div key={0} style={{ textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={MOTION.springFast} style={{ fontSize: 64, marginBottom: 16 }}>🌱</motion.div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: th.text, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Bem-vindo ao Raiz</h2>
      <p style={{ fontSize: 14, color: th.textMd, lineHeight: 1.65, maxWidth: 300, marginInline: 'auto', marginBottom: 24 }}>
        Seu copiloto financeiro para conquistar a casa própria. Setup em 2 minutos.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 28, textAlign: 'left' }}>
        {[['🎯','Metas inteligentes'],['🔥','Streaks e gamificação'],['🤖','IA consultora'],['📊','Score de saúde']].map(([ic,l]) => (
          <div key={l} style={{ background: th.surfAlt, borderRadius: 10, padding: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{ic}</span>
            <span style={{ fontSize: 11, color: th.textMd, fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>
      <Button onClick={next} style={{ width: '100%', fontSize: 14, padding: '13px 20px', borderRadius: 14 }}>Começar →</Button>
    </div>,

    <div key={1}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: th.text, fontFamily: 'Outfit, sans-serif' }}>Qual é o seu sonho?</h3>
        <p style={{ fontSize: 12, color: th.textMd, marginTop: 4 }}>Defina a meta principal da sua jornada</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <Input label="Nome da meta" placeholder="Casa no Bairro dos Sonhos" value={data.goalName} onChange={e => upd('goalName', e.target.value)} />
        <Input label="Valor necessário (R$)" type="number" placeholder="50000" value={data.goalValue} onChange={e => upd('goalValue', e.target.value)} />
        <Input label="Prazo desejado (opcional)" type="month" value={data.goalDeadline} onChange={e => upd('goalDeadline', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={back} style={{ flex: 1 }}>← Voltar</Button>
        <Button onClick={next} disabled={!data.goalName || !data.goalValue} style={{ flex: 2 }}>
          {data.goalName && data.goalValue ? 'Próximo →' : 'Preencha os campos'}
        </Button>
      </div>
    </div>,

    <div key={2}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💚</div>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: th.text, fontFamily: 'Outfit, sans-serif' }}>Renda mensal</h3>
        <p style={{ fontSize: 12, color: th.textMd, marginTop: 4 }}>Para calcular sua taxa de poupança</p>
      </div>
      <Input type="number" placeholder="5000" value={data.income} onChange={e => upd('income', e.target.value)}
        style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', height: 56, marginBottom: 14 }} />
      {mesesEst && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: th.primaryBg, borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: th.primary }}>Poupando 20%/mês:</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: th.primary, fontFamily: 'Outfit, sans-serif' }}>≈ {mesesEst} meses</span>
        </motion.div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={back} style={{ flex: 1 }}>← Voltar</Button>
        <Button onClick={next} style={{ flex: 2 }}>Próximo →</Button>
      </div>
    </div>,

    <div key={3}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: th.text, fontFamily: 'Outfit, sans-serif' }}>Tudo pronto!</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
        {[['1️⃣','Registre receitas e despesas todo mês'],['2️⃣','Poupança mensal constrói a casa própria'],['3️⃣','IA gera diagnóstico e plano de 90 dias'],['4️⃣','Mantenha o streak para acelerar']].map(([n,t]) => (
          <div key={String(t)} style={{ display: 'flex', gap: 10, alignItems: 'center', background: th.surfAlt, borderRadius: 10, padding: 11 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{n}</span>
            <span style={{ fontSize: 12, color: th.textMd }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={back} style={{ flex: 1 }}>← Voltar</Button>
        <Button onClick={() => onComplete(data)} style={{ flex: 2, fontSize: 14, padding: '13px 20px', borderRadius: 14 }}>🌱 Começar!</Button>
      </div>
    </div>,
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: th.bg, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {Array.from({ length: steps.length }, (_, i) => (
          <motion.div key={i} animate={{ width: i === step ? 22 : 8, background: i <= step ? th.primary : th.border }}
            style={{ height: 8, borderRadius: 99 }} transition={{ duration: 0.3 }} />
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 380, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit">
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}



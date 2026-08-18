// src/App.tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFinancasStore } from '@/store/financasStore'
import { useFinancas } from '@/hooks/useFinancas'
import { TOKENS, MESES, MOTION } from '@/lib/design-system'
import { OnboardingFlow }  from '@/features/onboarding/OnboardingFlow'
import { Dashboard }       from '@/features/dashboard/Dashboard'
import { Transactions }    from '@/features/transactions/Transactions'
import { History }         from '@/features/transactions/History'
import { Goals }           from '@/features/goals/Goals'
import { AIAnalysis }      from '@/features/ai/AIAnalysis'
import { BottomNav }       from '@/components/layout/BottomNav'
import { Header }          from '@/components/layout/Header'
import { Confetti, MilestoneToast } from '@/components/ui'

const queryClient = new QueryClient()

function ThemeRoot() {
  const store = useFinancasStore()
  const fin   = useFinancas()
  const th    = TOKENS[store.tema]

  const [confettiActive,   setConfettiActive]   = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.tema)
  }, [store.tema])

  useEffect(() => {
    if (fin.milestoneReached.length > 0) {
      const m = fin.milestoneReached[0]!
      store.markMilestone(m)
      setCurrentMilestone(m)
      setConfettiActive(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fin.milestoneReached.join(',')])

  const ANOS_LIST = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i)

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    dashboard:   <Dashboard     fin={fin} onAnalise={() => store.setAba('analise')} />,
    lancamentos: <Transactions  fin={fin} />,
    historico:   <History       fin={fin} />,
    metas:       <Goals         fin={fin} />,
    analise:     <AIAnalysis    fin={fin} />,
  }

  return (
    <div style={{ background: th.bg, minHeight: '100vh', color: th.text, fontFamily: "'DM Sans', system-ui, sans-serif", transition: 'background 0.3s, color 0.3s' }}>

      <AnimatePresence>
        {!store.onboarded && (
          <OnboardingFlow
            onComplete={data => {
              if (data.goalName && data.goalValue) {
                const p = store.metas.find(m => m.principal)
                if (p) store.editMeta(p.id, { nome: data.goalName, valor: parseFloat(data.goalValue) || 50000, deadline: data.goalDeadline ?? '' })
              }
              store.setOnboarded()
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confettiActive && <Confetti active onDone={() => setConfettiActive(false)} />}
        {currentMilestone && (
          <MilestoneToast milestone={currentMilestone} onClose={() => setCurrentMilestone(null)} />
        )}
      </AnimatePresence>

      <Header
        th={th} tema={store.tema} setTema={store.setTema}
        filtroMes={store.filtroMes} filtroAno={store.filtroAno}
        setFiltroMes={store.setFiltroMes} setFiltroAno={store.setFiltroAno}
        level={fin.level} streak={fin.streak}
        ANOS_LIST={ANOS_LIST}
      />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '14px 14px 0' }}>
        <AnimatePresence mode="wait">
          <motion.div key={store.aba} {...MOTION.fadeUp}>
            {TAB_CONTENT[store.aba] ?? null}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav aba={store.aba} setAba={store.setAba} th={th} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeRoot />
    </QueryClientProvider>
  )
}



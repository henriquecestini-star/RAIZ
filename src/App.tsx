import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFinancasStore } from '@/store/financasStore'
import { useFinancas } from '@/hooks/useFinancas'
import { TOKENS, MESES, MOTION } from '@/lib/design-system'
import { Dashboard }         from '@/features/dashboard/Dashboard'
import { Transactions }      from '@/features/transactions/Transactions'
import { History }           from '@/features/transactions/History'
import { Goals }             from '@/features/goals/Goals'
import { AIAnalysis }        from '@/features/ai/AIAnalysis'
import { BottomNav }         from '@/components/layout/BottomNav'
import { Header }            from '@/components/layout/Header'
import { OnboardingFlow }    from '@/features/onboarding/OnboardingFlow'
import { Confetti, MilestoneToast } from '@/components/ui'

const queryClient = new QueryClient()

function ThemeRoot() {
  const store = useFinancasStore()
  const fin   = useFinancas()
  const th    = TOKENS[store.tema]

  const [confettiActive,   setConfettiActive]   = useState(false)
  const [milestone,       setMilestone]         = useState<number | null>(null)

  if (!store.onboarded) {
    return <OnboardingFlow onComplete={store.completeOnboarding} />
  }

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    dashboard:   <Dashboard fin={fin} />,
    lancamentos: <Transactions fin={fin} />,
    historico:   <History fin={fin} />,
    metas:       <Goals fin={fin} />,
    analise:     <AIAnalysis fin={fin} />,
  }

  return (
    <div style={{ minHeight: '100vh', background: th.bg, color: th.text }}>
      <Header
        th={th}
        tema={store.tema}
        setTema={store.setTema}
        filtroMes={store.filtroMes}
        filtroAno={store.filtroAno}
        setFiltroMes={store.setFiltroMes}
        setFiltroAno={store.setFiltroAno}
        level={fin.level}
        streak={fin.streak}
        ANOS_LIST={[]}
      />
      <main style={{ paddingBottom: 90 }}>
        {TAB_CONTENT[store.aba] ?? null}
      </main>
      <BottomNav aba={store.aba} setAba={store.setAba} th={th} />
      <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />
      {milestone !== null && (
        <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
      )}
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

// src/components/layout/BottomNav.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, List, Target, Sparkles } from 'lucide-react'
import type { ThemeTokens } from '@/lib/design-system'
import type { AbaId } from '@/types'

interface NavItem { id: AbaId; icon: React.ReactNode; label: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   icon: <Home size={20} />,      label: 'Início'   },
  { id: 'lancamentos', icon: <Plus size={20} />,      label: 'Lançar'   },
  { id: 'historico',   icon: <List size={20} />,      label: 'Histórico'},
  { id: 'metas',       icon: <Target size={20} />,    label: 'Metas'    },
  { id: 'analise',     icon: <Sparkles size={20} />,  label: 'IA'       },
]

interface BottomNavProps {
  aba: AbaId
  setAba: (aba: AbaId) => void
  th: ThemeTokens
}

export function BottomNav({ aba, setAba, th }: BottomNavProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: th.surf, borderTop: `0.5px solid ${th.border}`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex' }}>
        {NAV_ITEMS.map(item => {
          const active = aba === item.id
          return (
            <button
              key={item.id}
              onClick={() => setAba(item.id)}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
                background: 'transparent', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, color: active ? th.primary : th.textSm,
                position: 'relative', transition: 'color 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Active indicator */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 22, height: 2.5, borderRadius: 99, background: th.primary,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon with background */}
              <motion.div
                animate={{ background: active ? th.primaryBg : 'transparent' }}
                transition={{ duration: 0.2 }}
                style={{ padding: '3px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {item.icon}
              </motion.div>

              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}



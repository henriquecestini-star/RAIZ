// src/components/layout/Header.tsx
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { MESES } from '@/lib/design-system'
import type { ThemeTokens } from '@/lib/design-system'
import type { GamificationLevel, Tema } from '@/types'

interface HeaderProps {
  th:             ThemeTokens
  tema:           Tema
  setTema:        (t: Tema) => void
  filtroMes:      number
  filtroAno:      number
  setFiltroMes:   (m: number) => void
  setFiltroAno:   (a: number) => void
  level:          GamificationLevel
  streak:         number
  ANOS_LIST:      number[]
}

const sel = (th: ThemeTokens): React.CSSProperties => ({
  padding: '4px 26px 4px 8px', fontSize: 11, width: 'auto', borderRadius: 7,
  background: th.surfAlt, color: th.text, border: `0.5px solid ${th.border}`,
  appearance: 'none' as const, outline: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 7px center',
})

export function Header({ th, tema, setTema, filtroMes, filtroAno, setFiltroMes, setFiltroAno, level, streak, ANOS_LIST }: HeaderProps) {
  return (
    <div style={{ background: th.surf, borderBottom: `0.5px solid ${th.border}`, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '11px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${th.primaryDk}, ${th.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌱</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: th.text, fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>Raiz</div>
              <div style={{ fontSize: 10, color: th.textSm }}>copiloto financeiro</div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} style={{ marginLeft: 2, background: th.primaryBg, borderRadius: 99, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span>{level.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: th.primary }}>{level.name}</span>
            </motion.div>
            {streak >= 1 && (
              <div style={{ background: th.warnBg, borderRadius: 99, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>🔥</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: th.warn }}>{streak}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <select value={filtroMes} onChange={e => setFiltroMes(+e.target.value)} style={sel(th)}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={filtroAno} onChange={e => setFiltroAno(+e.target.value)} style={sel(th)}>
              {ANOS_LIST.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setTema(tema === 'light' ? 'dark' : 'light')}
              style={{ width: 30, height: 30, borderRadius: 7, border: `0.5px solid ${th.border}`, background: th.surfAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: th.textMd }}>
              {tema === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}



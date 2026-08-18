// src/components/ui/index.tsx
// All primitive UI components using Framer Motion + Radix

import { forwardRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { TOKENS, MOTION } from '@/lib/design-system'
import { useFinancasStore } from '@/store/financasStore'

// ── Theme hook ──────────────────────────────────────────────
export function useTheme() {
  const tema = useFinancasStore(s => s.tema)
  return TOKENS[tema]
}

// ── Button ──────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'warning'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, style, ...props }, ref) => {
    const th = useTheme()

    const variants: Record<ButtonVariant, React.CSSProperties> = {
      primary: { background: th.primary,    color: '#fff',       border: 'none' },
      outline: { background: 'transparent', color: th.primary,   border: `1.5px solid ${th.primary}` },
      ghost:   { background: 'transparent', color: th.textMd,    border: `1px solid ${th.border}` },
      danger:  { background: th.expBg,      color: th.exp,       border: `1px solid ${th.exp}33` },
      warning: { background: th.warnBg,     color: th.warn,      border: `1px solid ${th.warn}33` },
    }

    const sizes: Record<string, React.CSSProperties> = {
      sm: { padding: '6px 12px',  fontSize: 12, borderRadius: 8  },
      md: { padding: '10px 18px', fontSize: 13, borderRadius: 12 },
      lg: { padding: '13px 24px', fontSize: 14, borderRadius: 14 },
    }

    return (
      <motion.button
        ref={ref}
        whileHover={!props.disabled ? { y: -1, filter: 'brightness(1.06)' } : undefined}
        whileTap={!props.disabled   ? { y: 0,  scale: 0.98 }               : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.5 : 1,
          transition: 'background 0.15s',
          ...variants[variant], ...sizes[size ?? 'md'], ...style,
        }}
        {...(props as any)}
      >
        {loading
          ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/>
          : icon
        }
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

// ── Card ────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  hover?: boolean
  className?: string
}

export function Card({ children, style, hover, className }: CardProps) {
  const th = useTheme()
  return (
    <motion.div
      className={className}
      whileHover={hover ? { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' } : undefined}
      style={{
        background: th.surf,
        border: `0.5px solid ${th.border}`,
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Input ───────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    const th = useTheme()
    const [focused, setFocused] = useState(false)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && (
          <label style={{ fontSize: 10, fontWeight: 700, color: th.textMd, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e  => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13,
            background: th.surfAlt, color: th.text, outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            border: `1.5px solid ${error ? th.exp : focused ? th.primary : th.border}`,
            boxShadow: focused ? `0 0 0 3px ${th.primaryBg}` : undefined,
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
          {...props}
        />
        {error && <span style={{ fontSize: 11, color: th.exp }}>{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ── Select ──────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, children, style, ...props }, ref) => {
    const th = useTheme()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && (
          <label style={{ fontSize: 10, fontWeight: 700, color: th.textMd, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          style={{
            width: '100%', padding: '10px 32px 10px 12px', borderRadius: 10, fontSize: 13,
            background: th.surfAlt, color: th.text, outline: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            border: `1.5px solid ${th.border}`,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            transition: 'border-color 0.15s',
            ...style,
          }}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)
Select.displayName = 'Select'

// ── Field wrapper ───────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const th = useTheme()
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: th.textMd, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── ProgressBar ─────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  max?: number
  color: string
  height?: number
  animated?: boolean
}

export function ProgressBar({ value, max = 100, color, height = 6, animated = true }: ProgressBarProps) {
  const th = useTheme()
  const p = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ background: th.border, borderRadius: 99, height, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${p}%` }}
        transition={animated ? { duration: 1.2, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
        style={{ background: color, height: '100%', borderRadius: 99 }}
      />
    </div>
  )
}

// ── ProgressRing (Score) ────────────────────────────────────
interface ProgressRingProps {
  score: number
  size?: number
}

export function ProgressRing({ score, size = 80 }: ProgressRingProps) {
  const th = useTheme()
  const color  = score >= 70 ? th.inc : score >= 40 ? th.warn : th.exp
  const label  = score >= 70 ? 'Saudável' : score >= 40 ? 'Atenção' : 'Crítico'
  const r      = size / 2 - 6
  const circ   = 2 * Math.PI * r
  const fill   = (score / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={th.border} strokeWidth={5} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={5} strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${fill} ${circ}` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.27, fontWeight: 800, color, lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>{score}</span>
          <span style={{ fontSize: 9, color: th.textSm }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
    </div>
  )
}

// ── Skeleton ────────────────────────────────────────────────
export function Skeleton({ width, height, radius = 8 }: { width?: number | string; height: number; radius?: number }) {
  const th = useTheme()
  return (
    <div style={{
      width: width ?? '100%', height, borderRadius: radius,
      background: `linear-gradient(90deg, ${th.surfAlt} 25%, ${th.surf} 50%, ${th.surfAlt} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={180} radius={16} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[0,1,2,3].map(i => <Skeleton key={i} height={80} radius={14} />)}
      </div>
      <Skeleton height={120} radius={16} />
      <Skeleton height={200} radius={16} />
    </div>
  )
}

// ── Modal (Radix Dialog) ────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
}

export function Modal({ open, onClose, title, children, maxWidth = 440 }: ModalProps) {
  const th = useTheme()
  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: th.overlay, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                {...MOTION.scaleIn}
                style={{
                  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  background: th.surf, borderRadius: 20, padding: 24,
                  width: '100%', maxWidth, zIndex: 81,
                  maxHeight: '90vh', overflowY: 'auto',
                  border: `0.5px solid ${th.borderMd}`,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <DialogPrimitive.Title style={{ fontSize: 17, fontWeight: 700, color: th.text, fontFamily: 'Outfit, sans-serif' }}>
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textSm, padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.background = th.surfAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <X size={18} />
                    </button>
                  </DialogPrimitive.Close>
                </div>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

// ── Confetti ────────────────────────────────────────────────
interface ConfettiProps { active: boolean; onDone?: () => void }

export function Confetti({ active, onDone }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; dur: number; color: string; size: number }>>([])

  useEffect(() => {
    if (!active) return
    const colors = ['#FF6B5E', '#0F5C42', '#FFD700', '#4490E0', '#C04080', '#1A9E9B', '#FF9F1C']
    setParticles(Array.from({ length: 60 }, (_, i) => ({
      id: i, x: 5 + Math.random() * 90,
      delay: Math.random() * 0.8, dur: 1.4 + Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      size: 6 + Math.random() * 8,
    })))
    const t = setTimeout(() => { setParticles([]); onDone?.() }, 3200)
    return () => clearTimeout(t)
  }, [active, onDone])

  if (!particles.length) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -10, left: `${p.x}%`,
          width: p.size, height: p.size, borderRadius: 2, background: p.color,
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          animationName: 'confettiFall', animationTimingFunction: 'linear', animationFillMode: 'forwards',
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(350px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── MilestoneToast ─────────────────────────────────────────
interface MilestoneToastProps { milestone: number; onClose: () => void }

export function MilestoneToast({ milestone, onClose }: MilestoneToastProps) {
  const th = useTheme()
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t) }, [onClose])

  const msgs: Record<number, string> = {
    25: 'Primeiro quarto da jornada! 🎉',
    50: 'Metade do caminho! 🚀',
    75: 'Três quartos completos! ⭐',
    100: 'META ATINGIDA! A casa é sua! 🏠🎊',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{   opacity: 0, y: 40,  scale: 0.9 }}
      style={{
        position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
        zIndex: 150, background: th.surf, borderRadius: 20, padding: '14px 22px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: `1px solid ${th.primary}33`,
        display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 32 }}>{milestone === 100 ? '🏠' : '🎯'}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: th.primary, fontFamily: 'Outfit, sans-serif' }}>
          {milestone}% alcançado!
        </div>
        <div style={{ fontSize: 11, color: th.textMd, marginTop: 2 }}>{msgs[milestone]}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textSm, fontSize: 16, marginLeft: 6 }}>✕</button>
    </motion.div>
  )
}

// ── EmptyState ──────────────────────────────────────────────
interface EmptyStateProps {
  icon: string
  title: string
  sub: string
  action?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, sub, action, onAction }: EmptyStateProps) {
  const th = useTheme()
  return (
    <motion.div {...MOTION.fadeUp} style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12, display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: th.text, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: th.textMd, lineHeight: 1.65, maxWidth: 300, marginInline: 'auto', marginBottom: action ? 20 : 0 }}>{sub}</div>
      {action && onAction && (
        <Button onClick={onAction} style={{ marginInline: 'auto' }}>{action}</Button>
      )}
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </motion.div>
  )
}



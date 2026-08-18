// src/components/common/CurrencyInput.tsx
import { forwardRef, useState, useCallback } from 'react'
import { Input } from '@/components/ui'

interface CurrencyInputProps {
  value:       number
  onChange:    (value: number) => void
  label?:      string
  placeholder?: string
  disabled?:   boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, label, placeholder = '0,00', disabled }, ref) => {
    const fmt = (n: number) => n > 0 ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
    const [display, setDisplay] = useState(() => fmt(value))

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\./g, '').replace(',', '.')
      setDisplay(e.target.value)
      const num = parseFloat(raw) || 0
      onChange(num)
    }, [onChange])

    const handleBlur = useCallback(() => {
      setDisplay(fmt(value))
    }, [value])

    return (
      <Input
        ref={ref}
        label={label}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      />
    )
  }
)
CurrencyInput.displayName = 'CurrencyInput'



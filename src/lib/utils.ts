// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind + conditional classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Promise-based sleep */
export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** Group array by key function */
export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    if (!acc[k]) acc[k] = []
    acc[k]!.push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/** Simple debounce */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T, ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/** Format month/year label */
export function fmtMonthYear(mes: number, ano: number): string {
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${MESES[mes] ?? '?'}/${ano}`
}



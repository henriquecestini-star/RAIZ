// src/services/export.ts
import { MESES, CATS } from '@/lib/design-system'
import type { Transacao } from '@/types'

export function exportarCSV(transacoes: Transacao[]): void {
  const header = 'ID,Data,Tipo,Descrição,Categoria,Valor (R$)\n'
  const rows = transacoes
    .map(t =>
      `${t.id},${MESES[t.mes]}/${t.ano},${t.tipo},"${t.descricao}",${CATS[t.categoria as keyof typeof CATS]?.label ?? t.categoria},${t.valor.toFixed(2)}`
    )
    .join('\n')

  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `raiz_${new Date().toISOString().slice(0, 7)}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}



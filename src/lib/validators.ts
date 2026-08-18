// src/lib/validators.ts
import { z } from 'zod'

const MES_ATUAL = new Date().getMonth()
const ANO_ATUAL = new Date().getFullYear()

export const transacaoSchema = z.object({
  tipo:       z.enum(['receita', 'despesa', 'poupanca']),
  valor:      z.string().min(1, 'Informe o valor').refine(v => parseFloat(v) > 0, 'Valor deve ser positivo'),
  descricao:  z.string().min(1, 'Informe a descrição').max(100, 'Muito longo'),
  categoria:  z.enum(['moradia','alimentacao','transporte','saude','lazer','educacao','roupas','assinaturas','outros']),
  mes:        z.number().int().min(0).max(11).default(MES_ATUAL),
  ano:        z.number().int().min(2020).max(2035).default(ANO_ATUAL),
  recorrente: z.boolean().default(false),
  repetir:    z.number().int().min(1).max(24).default(1),
  metaId:     z.string().optional(),
})

export const metaSchema = z.object({
  nome:        z.string().min(1, 'Informe o nome').max(60, 'Muito longo'),
  valor:       z.string().min(1, 'Informe o valor').refine(v => parseFloat(v) > 0, 'Valor deve ser positivo'),
  descricao:   z.string().max(200, 'Muito longo').default(''),
  icone:       z.string().min(1).max(4).default('🎯'),
  cor:         z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0F5C42'),
  deadline:    z.string().optional().default(''),
  alocacaoPct: z.number().min(0).max(100).default(0),
})

export type TransacaoFormData = z.infer<typeof transacaoSchema>
export type MetaFormData = z.infer<typeof metaSchema>



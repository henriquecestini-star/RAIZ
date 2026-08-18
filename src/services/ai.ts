// src/services/ai.ts
import { brl, pct } from '@/hooks/useFinancas'
import { MESES } from '@/lib/design-system'
import type { HistoricoMes, PorCategoria, Meta, GamificationLevel } from '@/types'

interface PromptContext {
  filtroMes:        number
  filtroAno:        number
  receitas:         number
  despesas:         number
  poupMes:          number
  saldo:            number
  totalPoupPri:     number
  porCat:           PorCategoria[]
  hist12:           HistoricoMes[]
  tendencia:        number
  healthScore:      number
  momentum:         number
  streak:           number
  metas:            Meta[]
  metaPrincipal:    Meta | null
  metaPct:          number
  level:            GamificationLevel
  transacoesCount:  number
}

export function buildPrompt(ctx: PromptContext): string {
  const taxaPoup   = ctx.receitas > 0 ? (ctx.poupMes / ctx.receitas * 100) : 0
  const taxaDesp   = ctx.receitas > 0 ? (ctx.despesas / ctx.receitas * 100) : 0
  const metaV      = ctx.metaPrincipal?.valor ?? 0
  const mesesRest  = ctx.poupMes > 0 && metaV > ctx.totalPoupPri
    ? Math.ceil((metaV - ctx.totalPoupPri) / ctx.poupMes) : 'indefinido'
  const tendStr    = ctx.tendencia > 0 ? `SUBINDO R$${brl(ctx.tendencia)}`
    : ctx.tendencia < 0 ? `CAINDO R$${brl(Math.abs(ctx.tendencia))}` : 'ESTÁVEL'
  const cats       = ctx.porCat.map(c => `  - ${c.name}: R$${brl(c.value)} (${pct(c.pctRec)} da renda)`).join('\n')
  const hist       = ctx.hist12.filter(m => m.receitas > 0 || m.despesas > 0)
    .map(m => `  ${m.mes}: rec=R$${brl(m.receitas)} | desp=R$${brl(m.despesas)} | poup=R$${brl(m.poupanca)}`).join('\n')
  const mediaDesp  = (() => {
    const ativos = ctx.hist12.filter(m => m.despesas > 0)
    return ativos.length > 0 ? ativos.reduce((s, m) => s + m.despesas, 0) / ativos.length : 0
  })()
  const outrasM    = ctx.metas.filter(m => !m.principal && m.ativa && !m.archived)
    .map(m => `  - ${m.icone} ${m.nome}: R$${brl(m.valor)} (prazo: ${m.deadline || 'indefinido'}, alocação: ${m.alocacaoPct}%)`)
    .join('\n')

  return `Você é consultor financeiro pessoal brasileiro especializado em planejamento para compra da casa própria. Tom: empático, direto, orientado a números reais. Responda em português com seções Markdown claras.

═══ PERFIL DO USUÁRIO ═══
• Nível de gamificação: ${ctx.level.name} ${ctx.level.icon} (${pct(ctx.metaPct)} da meta)
• Score de saúde: ${ctx.healthScore}/100 | Momentum: ${ctx.momentum}/100
• Streak: ${ctx.streak} mes(es) consecutivos ativos
• Total de lançamentos registrados: ${ctx.transacoesCount}

═══ DADOS DO MÊS (${MESES[ctx.filtroMes]}/${ctx.filtroAno}) ═══
• Receitas:  R$ ${brl(ctx.receitas)} | Taxa de poupança: ${pct(taxaPoup)} | Meta: 20%
• Despesas:  R$ ${brl(ctx.despesas)} | ${pct(taxaDesp)} da renda
• Poupança:  R$ ${brl(ctx.poupMes)}
• Saldo:     R$ ${brl(ctx.saldo)}

═══ GASTOS POR CATEGORIA ═══
${cats || '  (sem dados de categoria ainda)'}

═══ HISTÓRICO 12 MESES ═══
${hist || '  (sem histórico ainda)'}
• Tendência de gastos: ${tendStr}
• Média histórica de despesas: R$ ${brl(mediaDesp)}

═══ METAS ═══
• Meta principal: ${ctx.metaPrincipal?.nome ?? 'Casa Própria'} — R$ ${brl(ctx.totalPoupPri)} de R$ ${brl(metaV)} (${pct(ctx.metaPct)}) — Previsão: ${mesesRest} meses
${outrasM ? `• Outras metas:\n${outrasM}` : ''}

═══ ANÁLISE SOLICITADA ═══
Gere uma análise completa e empática nas seguintes seções:

## 🔬 Diagnóstico
Avalie objetivamente a situação. Classifique o perfil financeiro: acumulador, equilibrado, consumidor ou crítico. Compare a taxa de poupança com o ideal brasileiro (20%). Comente o nível "${ctx.level.name}" e o Momentum Score.

## ⚡ Alertas Críticos
Os 3 maiores problemas com impacto real em reais. Seja específico: nome da categoria, valor, percentual. Zero generalização.

## 📈 Projeção Realista
Com o padrão atual: situação daqui a 3, 6 e 12 meses. Data estimada para atingir a meta. Cenário pessimista (+10% gastos) vs. otimista (-15% gastos). Mostre datas e valores concretos.

## 🏠 Plano de Ação 90 dias
3 fases mensais com: (1) cortes específicos por categoria com valores (R$), (2) meta semanal de poupança, (3) uma ação concreta e prática por semana.

## 🏆 Score, Nível & Hacks
Explique o score ${ctx.healthScore}/100 e Momentum ${ctx.momentum}/100 item a item. Para sair de "${ctx.level.name}" para o próximo nível, o que é necessário em R$ e meses? Dê 2 hacks financeiros ultra-específicos para este perfil e esta faixa de renda.`
}

export async function analisarFinancas(prompt: string): Promise<string> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!resp.ok) throw new Error(`API error: ${resp.status}`)

  const json = await resp.json() as { content?: Array<{ text?: string }>; error?: { message?: string } }
  if (json.error) throw new Error(json.error.message ?? 'API error')

  const text = json.content?.[0]?.text
  if (!text) throw new Error('Resposta vazia da API')

  return text
}



# 🌱 Raiz — Copiloto Financeiro v2.0

> O copiloto financeiro para conquistar a casa própria.

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript strict |
| Build | Vite 6 |
| Estado | Zustand 5 + Immer + Persist |
| Queries | TanStack Query 5 |
| Animações | Framer Motion 11 |
| Forms | React Hook Form 7 + Zod 3 |
| UI Primitives | Radix UI (Dialog, Select, Slider, Toast…) |
| Icons | Lucide React |
| Charts | Recharts 2 |
| Styles | Tailwind CSS 3 |
| Confetti | canvas-confetti |

## Estrutura

```
src/
├── app/
├── components/
│   ├── ui/           # Button, Card, Input, Modal, Confetti, Skeleton…
│   ├── layout/       # Header, BottomNav, PageWrapper
│   └── common/       # EmptyState, ErrorBoundary, CurrencyInput
├── features/
│   ├── onboarding/   # OnboardingFlow (5 steps)
│   ├── dashboard/    # Dashboard, HeroCard, HouseProgress, MomentumScore, InsightsPanel
│   ├── transactions/ # Transactions, History, TransactionRow, RecurringManager
│   ├── goals/        # Goals, GoalCard, GoalForm, AutoAllocation
│   └── ai/           # AIAnalysis, PromptBuilder
├── hooks/
│   └── useFinancas.ts  # All computed selectors + business logic
├── store/
│   └── financasStore.ts  # Zustand store (Immer + Persist)
├── types/
│   └── index.ts        # All TypeScript types
├── lib/
│   ├── design-system.ts  # Tokens, levels, MOTION presets
│   ├── validators.ts     # Zod schemas
│   └── utils.ts
└── services/
    ├── ai.ts        # Anthropic API client
    └── export.ts    # CSV export
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Type-check
npm run typecheck

# 4. Build for production
npm run build
```

## Funcionalidades

### ✅ Implementado
- **Onboarding** fluido em 4 passos (goal → income → tips → done)
- **Dashboard** cinematográfico com HouseProgress animado
- **Gamificação** — Planta 🌱 → Raiz 🌿 → Árvore 🌳 → Floresta 🌲
- **Streaks** — meses consecutivos com lançamentos
- **Confetti** ao atingir 25/50/75/100% da meta
- **Momentum Score** (0–100)
- **Insights automáticos** no dashboard
- **Score de saúde** financeira
- **Múltiplas metas** com alocação %, prazo, ícone, cor
- **Reordenar metas** (drag ou up/down)
- **Arquivar metas**
- **Auto-alocação** de poupança entre metas por %
- **Recorrentes** — criar, editar, pausar, excluir
- **Lançamentos** — CRUD completo, repetição em lote
- **Histórico** com busca, filtro por tipo, exportar CSV
- **Análise IA** com prompt rico e contextualizado
- **Dark mode** perfeito
- **Filtro de anos** expandido (7 anos)
- **Loading skeletons** elegantes
- **Empty states** motivacionais

### 🚀 Próximas versões
- [ ] Integração Supabase (auth + sync)
- [ ] Open Finance (conexão bancária)
- [ ] Push notifications (lembrete mensal)
- [ ] Relatório PDF mensal
- [ ] Modo família (múltiplos usuários)

## Variáveis de Ambiente (futuro Supabase)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Licença

MIT

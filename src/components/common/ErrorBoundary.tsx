// src/components/common/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props  { children: ReactNode; fallback?: ReactNode }
interface State  { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Raiz ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: 32, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Algo deu errado</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ padding: '10px 24px', borderRadius: 10, background: '#0F5C42', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}



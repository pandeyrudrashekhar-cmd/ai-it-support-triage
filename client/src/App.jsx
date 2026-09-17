import { useState } from 'react'
import './App.css'
import ErrorState from './components/ErrorState'
import Header from './components/Header'
import LoadingState from './components/LoadingState'
import SampleTickets from './components/SampleTickets'
import TicketInput from './components/TicketInput'
import TriageResult from './components/TriageResult'
import { analyzeTicket } from './services/triageApi'

// ─── Sample tickets (UNCHANGED) ──────────────────────────────────────
const sampleTickets = [
  {
    id: 'Network issue',
    text: "My laptop is connected to Wi-Fi but I can't access any websites. Teams isn't working either. I have a client call in 20 minutes.",
  },
  {
    id: 'Password issue',
    text: 'I changed my password this morning. I can log into my laptop but Outlook keeps asking me for my password.',
  },
  {
    id: 'Slow device',
    text: 'My laptop has become extremely slow since this morning. I only have Chrome, Outlook and Teams open.',
  },
  {
    id: 'Ambiguous issue',
    text: 'Nothing is connecting since I changed my password.',
  },
  {
    id: 'Internet outage',
    text: 'The internet is down.',
  },
]

// ─── normalizeTriageResult (UNCHANGED) ───────────────────────────────
const normalizeTriageResult = (response) => ({
  category: response.category ?? 'Other',
  priority: response.priority ?? 'Medium',
  confidence: Math.round((response.confidence ?? 0) * 100),
  summary: response.summary ?? 'No summary was returned.',
  missingInfo: Array.isArray(response.missingInformation)
    ? response.missingInformation
    : ['No additional information required.'],
  nextStep: response.nextStep ?? 'Review the ticket and gather more context.',
  why: response.reason ?? 'No reasoning was provided.',
  followUpQuestion:
    response.followUpQuestion ?? 'Can you share any additional details about the issue?',
})

// ─── App ─────────────────────────────────────────────────────────────
function App() {
  // State management (UNCHANGED)
  const [ticket, setTicket] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    const trimmedTicket = ticket.trim()

    if (!trimmedTicket || isLoading) {
      setError(!trimmedTicket ? 'Please enter a support request before analyzing.' : '')
      if (!trimmedTicket) setResult(null)
      return
    }

    if (trimmedTicket.length > 2000) {
      setError('Support request must be 2000 characters or fewer.')
      setResult(null)
      return
    }

    setError(null)
    setIsLoading(true)
    setResult(null)

    try {
      const response = await analyzeTicket(trimmedTicket)
      setResult(normalizeTriageResult(response))
    } catch (err) {
      setResult(null)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to analyze the support request right now. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectExample = (value) => {
    setTicket(value)
    setError(null)
    setResult(null)
  }

  const handleRetry = () => {
    setError(null)
    if (ticket.trim()) handleAnalyze()
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="animate-fade-in-up mb-6 sm:mb-10"
          style={{ animationDelay: '0ms' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="h-px w-5 sm:w-6 shrink-0"
              style={{ background: 'rgba(56,139,253,0.6)' }}
              aria-hidden="true"
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px] sm:tracking-[0.25em]"
              style={{ color: '#388bfd' }}
            >
              AI Incident Triage
            </span>
          </div>

          {/* Headline — scale down on narrow screens */}
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
            style={{ color: '#e6edf3', lineHeight: '1.25' }}
          >
            Turn support tickets into{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #388bfd 0%, #39d0d8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              actionable next steps.
            </span>
          </h1>

          {/* Description */}
          <p
            className="mt-2.5 text-sm leading-6 sm:mt-3 sm:text-base sm:leading-7"
            style={{ color: '#8b949e' }}
          >
            Paste an IT support ticket and the AI will categorise it, assess
            priority, identify missing context, and give you the exact next
            troubleshooting step — in seconds.
          </p>
        </section>

        {/* ── Workspace ─────────────────────────────────────────────── */}
        <section className="space-y-4 sm:space-y-5">
          <TicketInput
            value={ticket}
            onChange={setTicket}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />

          <SampleTickets samples={sampleTickets} onSelect={handleSelectExample} />
        </section>

        {/* ── Result / Loading / Error area ─────────────────────────── */}
        <section className="mt-5 space-y-4 sm:mt-6">
          {error ? (
            <ErrorState
              message={error}
              onRetry={handleRetry}
              onDismiss={() => setError(null)}
            />
          ) : null}

          {isLoading ? <LoadingState /> : <TriageResult result={result} />}
        </section>
      </main>
    </div>
  )
}

export default App

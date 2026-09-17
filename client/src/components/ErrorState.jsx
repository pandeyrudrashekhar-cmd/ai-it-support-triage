import { AlertTriangle, RotateCcw, X } from 'lucide-react'

function ErrorState({ message, onRetry, onDismiss }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-fade-in-up rounded-xl border p-4"
      style={{
        background: 'rgba(248,81,73,0.06)',
        borderColor: 'rgba(248,81,73,0.2)',
        boxShadow: '0 4px 16px rgba(248,81,73,0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
          }}
        >
          <AlertTriangle className="h-4 w-4 text-[#f85149]" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#f85149]">
            Analysis failed
          </p>
          <p className="mt-1 text-sm leading-6 text-[#8b949e]">{message}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:brightness-110 focus-visible:outline-none"
                style={{
                  background: 'rgba(248,81,73,0.15)',
                  border: '1px solid rgba(248,81,73,0.3)',
                  color: '#f85149',
                }}
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Retry
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#8b949e',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorState

import { useEffect, useRef, useState } from 'react'
import { BrainCircuit, X, Zap } from 'lucide-react'

function TicketInput({ value, onChange, onAnalyze, isLoading }) {
  const maxLength = 2000
  const charCount = value.length
  const isDisabled = !value.trim() || isLoading
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // Ctrl+Enter / Cmd+Enter shortcut (UNCHANGED)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isDisabled) onAnalyze()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDisabled, onAnalyze])

  const remaining = maxLength - charCount
  const charCountColor =
    remaining < 100
      ? 'text-amber-400'
      : remaining < 200
        ? 'text-amber-500/70'
        : 'text-[#484f58]'

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
      {/* Section label */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#484f58]">
          Incident Description
        </span>
        <div className="h-px flex-1 bg-white/[0.05]" />
      </div>

      {/* Command input panel */}
      <div
        className="relative w-full rounded-xl border transition-all duration-300"
        style={{
          background: 'rgba(13, 18, 36, 0.8)',
          borderColor: isFocused
            ? 'rgba(56,139,253,0.45)'
            : 'rgba(255,255,255,0.07)',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(56,139,253,0.12), 0 4px 24px rgba(0,0,0,0.4)'
            : '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-2">
            <BrainCircuit
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: isFocused ? '#388bfd' : '#484f58' }}
              aria-hidden="true"
            />
            <label
              htmlFor="support-request"
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: isFocused ? '#8b949e' : '#484f58' }}
            >
              Support Ticket
            </label>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`text-[11px] font-mono transition-colors duration-200 ${charCountColor}`}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isLoading}
                className="flex h-6 w-6 items-center justify-center rounded text-[#484f58] transition-all duration-150 hover:bg-white/[0.06] hover:text-[#8b949e] focus-visible:outline-none disabled:opacity-40"
                aria-label="Clear ticket text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea — fewer rows on mobile */}
        <textarea
          ref={textareaRef}
          id="support-request"
          name="support-request"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe the IT issue — include impacted systems, error messages, users affected, and recent changes."
          rows={5}
          disabled={isLoading}
          aria-label="Support request"
          className="w-full resize-none bg-transparent px-3 py-3 text-sm leading-6 text-[#c9d1d9] placeholder:text-[#30363d] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3.5 sm:leading-7"
        />

        {/* Bottom action bar */}
        <div className="flex flex-col gap-2.5 border-t border-white/[0.05] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
          {/* Hint text — shorter on mobile */}
          <p className="text-[11px] leading-5 text-[#484f58]">
            <span className="sm:hidden">Include device, OS, error codes and business impact.</span>
            <span className="hidden sm:inline">
              Include device type, OS, error codes, and business impact when available
            </span>
            <span className="ml-2 hidden font-mono text-[#30363d] sm:inline">
              ↵ Ctrl+Enter to analyze
            </span>
          </p>

          {/* CTA button — full width on mobile */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isDisabled}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#388bfd]/50 disabled:cursor-not-allowed sm:w-auto sm:py-2.5"
            style={{
              background: isDisabled
                ? 'rgba(255,255,255,0.04)'
                : 'linear-gradient(135deg, #1a4490 0%, #2563eb 50%, #1d4ed8 100%)',
              color: isDisabled ? '#484f58' : '#fff',
              boxShadow: isDisabled
                ? 'none'
                : '0 2px 12px rgba(56,139,253,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: isDisabled
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(56,139,253,0.4)',
              minHeight: '44px', // minimum touch target
            }}
          >
            {/* Shimmer on hover */}
            {!isDisabled && (
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
            )}
            <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Analyze Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketInput

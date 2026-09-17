import { useEffect, useState } from 'react'
import { CheckCircle2, FileSearch, AlertTriangle, Layers, ListChecks, ChevronRight } from 'lucide-react'

const ANALYSIS_STEPS = [
  { id: 1, icon: FileSearch,    label: 'Analyzing ticket content',       delay: 0    },
  { id: 2, icon: Layers,        label: 'Identifying issue category',      delay: 900  },
  { id: 3, icon: AlertTriangle, label: 'Assessing business impact',       delay: 1900 },
  { id: 4, icon: ListChecks,    label: 'Detecting missing information',   delay: 2900 },
  { id: 5, icon: ChevronRight,  label: 'Preparing recommended action',   delay: 3800 },
]

function LoadingState() {
  const [visibleSteps, setVisibleSteps] = useState([0]) // step indexes visible
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timers = []

    ANALYSIS_STEPS.forEach((step, i) => {
      if (i === 0) return // already shown
      timers.push(
        setTimeout(() => {
          setVisibleSteps((prev) => [...prev, i])
          setActiveStep(i)
        }, step.delay),
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="AI is analyzing your ticket"
      className="animate-fade-in overflow-hidden rounded-xl border"
      style={{
        background: 'rgba(13,18,36,0.8)',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Scanning progress bar */}
      <div className="relative h-0.5 w-full overflow-hidden bg-white/[0.04]">
        <div
          className="absolute inset-y-0 w-1/3 animate-scan"
          style={{
            background: 'linear-gradient(90deg, transparent, #388bfd, transparent)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="px-4 py-5 sm:px-5 sm:py-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#388bfd]"
                style={{
                  animation: `pulse-dot 1.4s ease-in-out ${i * 180}ms infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#388bfd]">
            AI Analysis in Progress
          </span>
        </div>

        {/* Step sequence */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, i) => {
            const isVisible = visibleSteps.includes(i)
            const isActive = activeStep === i
            const isDone = activeStep > i
            const Icon = step.icon

            if (!isVisible) return null

            return (
              <div
                key={step.id}
                className="animate-step-in flex items-center gap-3"
              >
                {/* Icon / Check */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-500"
                  style={{
                    background: isDone
                      ? 'rgba(46,160,67,0.12)'
                      : isActive
                        ? 'rgba(56,139,253,0.12)'
                        : 'rgba(255,255,255,0.04)',
                    border: isDone
                      ? '1px solid rgba(46,160,67,0.25)'
                      : isActive
                        ? '1px solid rgba(56,139,253,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{
                        color: isActive ? '#388bfd' : '#484f58',
                        animation: isActive ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="min-w-0 flex-1 text-sm transition-colors duration-300"
                  style={{
                    color: isDone
                      ? '#8b949e'
                      : isActive
                        ? '#c9d1d9'
                        : '#484f58',
                  }}
                >
                  {step.label}
                  {isActive && (
                    <span
                      className="ml-1 text-[#388bfd]"
                      style={{ animation: 'blink-cursor 1s step-end infinite' }}
                      aria-hidden="true"
                    >
                      _
                    </span>
                  )}
                </span>

                {/* Done indicator */}
                {isDone && (
                  <span className="ml-auto text-[10px] font-mono text-emerald-500/60">
                    done
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom hint */}
        <p className="mt-5 text-[11px] text-[#30363d]">
          Powered by OpenRouter · Results usually ready in a few seconds
        </p>
      </div>
    </div>
  )
}

export default LoadingState

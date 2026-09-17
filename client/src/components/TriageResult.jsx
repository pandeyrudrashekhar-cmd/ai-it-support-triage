import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  ListChecks,
  Zap,
  BrainCircuit,
  MessageSquareDot,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import EmptyState from './EmptyState'

/* ─── Priority config ──────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  Critical: {
    label:  'Critical',
    color:  '#f85149',
    bg:     'rgba(248,81,73,0.1)',
    border: 'rgba(248,81,73,0.25)',
  },
  High: {
    label:  'High',
    color:  '#f0883e',
    bg:     'rgba(240,136,62,0.1)',
    border: 'rgba(240,136,62,0.25)',
  },
  Medium: {
    label:  'Medium',
    color:  '#d29922',
    bg:     'rgba(210,153,34,0.1)',
    border: 'rgba(210,153,34,0.25)',
  },
  Low: {
    label:  'Low',
    color:  '#3fb950',
    bg:     'rgba(63,185,80,0.1)',
    border: 'rgba(63,185,80,0.25)',
  },
}

/* ─── SVG Confidence Ring ──────────────────────────────────────────── */
function ConfidenceRing({ value, size = 80 }) {
  const radius = (size / 2) - 5
  const circumference = 2 * Math.PI * radius
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true))
    })
    return () => cancelAnimationFrame(t)
  }, [])

  const offset = circumference - (animated ? (value / 100) * circumference : circumference)

  const ringColor =
    value >= 80 ? '#3fb950' : value >= 60 ? '#388bfd' : value >= 40 ? '#d29922' : '#f85149'

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>

        {/* Center number */}
        <span
          className="relative text-lg font-bold leading-none sm:text-2xl"
          style={{ color: ringColor }}
        >
          {value}%
        </span>
      </div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#484f58] sm:text-[10px] sm:tracking-[0.18em]">
        Confidence
      </p>
    </div>
  )
}

/* ─── Badge ────────────────────────────────────────────────────────── */
function Badge({ label, color, bg, border }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  )
}

/* ─── Section wrapper with stagger ────────────────────────────────── */
function Section({ children, delay = 0, className = '' }) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  )
}

/* ─── Panel ────────────────────────────────────────────────────────── */
function Panel({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${className}`}
      style={{
        background: 'rgba(13,18,36,0.7)',
        borderColor: 'rgba(255,255,255,0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Section label ────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58] mb-2">
      {children}
    </p>
  )
}

/* ─── TriageResult ─────────────────────────────────────────────────── */
function TriageResult({ result }) {
  if (!result) return <EmptyState />

  const priority = PRIORITY_CONFIG[result.priority] ?? PRIORITY_CONFIG.Medium

  return (
    <article className="space-y-3 sm:space-y-4">

      {/* ── Header card ───────────────────────────────────────────── */}
      <Section delay={0}>
        <Panel>
          {/*
            Mobile layout:
              Row 1: [ShieldIcon + "Triage Result" label] ─────── [Confidence ring]
              Row 2: [Category badge] ────────────────────────── [Priority badge]

            Desktop (sm+) layout: single row, icon+label+category left, priority+divider+ring right
          */}

          {/* ── MOBILE layout (hidden on sm+) ── */}
          <div className="sm:hidden">
            {/* Row 1: header label + confidence ring */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(56,139,253,0.1)',
                    border: '1px solid rgba(56,139,253,0.2)',
                  }}
                >
                  <ShieldCheck className="h-4 w-4 text-[#388bfd]" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58]">
                  Triage Result
                </p>
              </div>

              {/* Compact ring on mobile — 72px */}
              <ConfidenceRing value={result.confidence} size={72} />
            </div>

            {/* Row 2: Category + Priority side by side */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Category */}
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold text-[#c9d1d9]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {result.category}
              </span>

              {/* Divider */}
              <span
                className="inline-block h-3 w-px"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-hidden="true"
              />

              {/* Priority */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#484f58]">
                  Priority
                </span>
                <Badge
                  label={priority.label}
                  color={priority.color}
                  bg={priority.bg}
                  border={priority.border}
                />
              </div>
            </div>
          </div>

          {/* ── DESKTOP layout (sm+, hidden on mobile) ── */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Left: icon + label + category */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'rgba(56,139,253,0.1)',
                  border: '1px solid rgba(56,139,253,0.2)',
                }}
              >
                <ShieldCheck className="h-5 w-5 text-[#388bfd]" aria-hidden="true" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58]">
                  Triage Result
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold text-[#c9d1d9]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {result.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: priority + divider + confidence */}
            <div className="flex items-center gap-6">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58]">
                  Priority
                </p>
                <Badge
                  label={priority.label}
                  color={priority.color}
                  bg={priority.bg}
                  border={priority.border}
                />
              </div>

              <div
                className="h-10 w-px"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />

              <ConfidenceRing value={result.confidence} size={96} />
            </div>
          </div>
        </Panel>
      </Section>

      {/* ── Summary ───────────────────────────────────────────────── */}
      <Section delay={80}>
        <Panel>
          <SectionLabel>Summary</SectionLabel>
          <p className="text-sm leading-6 text-[#8b949e] sm:leading-7">{result.summary}</p>
        </Panel>
      </Section>

      {/* ── Next Step (FOCAL POINT) ────────────────────────────────── */}
      <Section delay={160}>
        <div
          className="relative overflow-hidden rounded-xl border p-4 sm:p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(26,68,144,0.25) 0%, rgba(13,18,36,0.9) 100%)',
            borderColor: 'rgba(56,139,253,0.3)',
            boxShadow: '0 4px 24px rgba(56,139,253,0.12), inset 0 1px 0 rgba(56,139,253,0.1)',
          }}
        >
          {/* Decorative left accent bar */}
          <div
            className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl"
            style={{ background: 'linear-gradient(180deg, #388bfd 0%, #1a4490 100%)' }}
            aria-hidden="true"
          />

          <div className="flex items-start gap-3 pl-3 sm:gap-4">
            {/* Step badge */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-[#388bfd] sm:h-9 sm:w-9"
              style={{
                background: 'rgba(56,139,253,0.12)',
                border: '1px solid rgba(56,139,253,0.25)',
              }}
            >
              01
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-[#388bfd]" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#388bfd]">
                  Next Troubleshooting Step
                </p>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-[#e6edf3] sm:text-[15px] sm:leading-7">
                {result.nextStep}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Missing Information + Reasoning ───────────────────────── */}
      {/* Single column on all mobile, 2-col only on lg+ */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Missing info */}
        <Section delay={240}>
          <Panel>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-3.5 w-3.5 shrink-0 text-[#484f58]" aria-hidden="true" />
              <SectionLabel>Missing Information</SectionLabel>
            </div>
            <ul className="space-y-2 sm:space-y-2.5">
              {result.missingInfo.map((item) => (
                <li key={item} className="flex items-start gap-2 sm:gap-2.5">
                  <span
                    className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <HelpCircle className="h-2.5 w-2.5 text-[#484f58]" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-6 text-[#8b949e]">{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Section>

        {/* Reasoning */}
        <Section delay={320}>
          <Panel>
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="h-3.5 w-3.5 shrink-0 text-[#484f58]" aria-hidden="true" />
              <SectionLabel>AI Reasoning</SectionLabel>
            </div>
            <p className="text-sm leading-6 text-[#8b949e] sm:leading-7">{result.why}</p>
          </Panel>
        </Section>
      </div>

      {/* ── Follow-up Question ────────────────────────────────────── */}
      <Section delay={400}>
        {result.followUpQuestion ? (
          <div
            className="rounded-xl border p-3 sm:p-4"
            style={{
              background: 'rgba(163,113,247,0.06)',
              borderColor: 'rgba(163,113,247,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: 'rgba(163,113,247,0.1)',
                  border: '1px solid rgba(163,113,247,0.2)',
                }}
              >
                <MessageSquareDot className="h-3.5 w-3.5 text-[#a371f7]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a371f7] mb-1">
                  Recommended Follow-up
                </p>
                <p className="text-sm leading-6 text-[#8b949e]">
                  {result.followUpQuestion}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl border p-3 sm:p-4"
            style={{
              background: 'rgba(63,185,80,0.05)',
              borderColor: 'rgba(63,185,80,0.15)',
            }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-[#8b949e]">
              No follow-up question required — sufficient information provided.
            </p>
          </div>
        )}
      </Section>
    </article>
  )
}

export default TriageResult

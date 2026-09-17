import { Terminal } from 'lucide-react'

function EmptyState() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border py-14 text-center"
      style={{
        background: 'rgba(13,18,36,0.5)',
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
      }}
    >
      {/* Dot grid background */}
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: 'rgba(56,139,253,0.08)',
            border: '1px solid rgba(56,139,253,0.15)',
          }}
        >
          <Terminal className="h-6 w-6 text-[#388bfd]/60" aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-[#8b949e]">
          Ready for analysis
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#484f58]">
          Enter a support ticket above or try one of the scenario examples.
          Your triage report will appear here.
        </p>

        {/* Subtle CTA hint */}
        <div
          className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <span className="text-[11px] text-[#30363d]">↑</span>
          <span className="text-[11px] text-[#30363d]">
            Select a scenario example to get started
          </span>
        </div>
      </div>
    </div>
  )
}

export default EmptyState

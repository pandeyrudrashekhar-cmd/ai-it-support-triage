import { Activity, Cpu } from 'lucide-react'

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">

        {/* Logo + Wordmark */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a3a6b] to-[#0d2148] shadow-lg ring-1 ring-white/10 sm:h-9 sm:w-9">
            <Cpu className="h-4 w-4 text-[#388bfd] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white leading-none">
              IT Triage AI
            </p>
            <p className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#8b949e] sm:block">
              Incident Intelligence
            </p>
          </div>
        </div>

        {/* Right: Status + System info */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {/* System info — hidden on mobile */}
          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-[#484f58]" aria-hidden="true" />
              <span className="text-[11px] font-mono text-[#484f58]">v1.0</span>
            </div>
            <div className="h-3 w-px bg-white/[0.06]" />
            <span className="text-[11px] font-mono text-[#484f58]">OpenRouter · GPT-4o</span>
          </div>

          <div className="h-3 w-px bg-white/[0.06] hidden sm:block" />

          {/* AI Online badge — compact on mobile */}
          <div className="relative inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            {/* Pulsing ring */}
            <span
              className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"
              style={{
                animation: 'pulse-ring 1.6s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
                left: '8px',
              }}
              aria-hidden="true"
            />
            {/* Solid dot */}
            <span
              className="relative inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400"
              style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
              AI Online
            </span>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header

import { Globe, KeyRound, Gauge, HelpCircle, WifiOff } from 'lucide-react'

const SCENARIO_META = {
  'Network issue': {
    icon: Globe,
    description: 'Wi-Fi connected, no access',
    accent: '#388bfd',
    accentBg: 'rgba(56,139,253,0.08)',
    accentBorder: 'rgba(56,139,253,0.2)',
  },
  'Password issue': {
    icon: KeyRound,
    description: 'Auth & credential issues',
    accent: '#a371f7',
    accentBg: 'rgba(163,113,247,0.08)',
    accentBorder: 'rgba(163,113,247,0.2)',
  },
  'Slow device': {
    icon: Gauge,
    description: 'Performance degradation',
    accent: '#39d0d8',
    accentBg: 'rgba(57,208,216,0.08)',
    accentBorder: 'rgba(57,208,216,0.2)',
  },
  'Ambiguous issue': {
    icon: HelpCircle,
    description: 'Unclear symptoms',
    accent: '#f0883e',
    accentBg: 'rgba(240,136,62,0.08)',
    accentBorder: 'rgba(240,136,62,0.2)',
  },
  'Internet outage': {
    icon: WifiOff,
    description: 'Connectivity down',
    accent: '#f85149',
    accentBg: 'rgba(248,81,73,0.08)',
    accentBorder: 'rgba(248,81,73,0.2)',
  },
}

function SampleTickets({ samples, onSelect }) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
      {/* Section label */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#484f58]">
          Scenario Examples
        </span>
        <div className="h-px flex-1 bg-white/[0.05]" />
        <span className="shrink-0 text-[10px] text-[#30363d]">Tap to load</span>
      </div>

      {/*
        Mobile layout: a single vertical list of chips stacked cleanly.
        sm+ layout: horizontal flex-wrap (original behaviour).
        This avoids two cramped columns at 320px while keeping the
        desktop experience identical.
      */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {samples.map((sample, i) => {
          const meta = SCENARIO_META[sample.id]
          const Icon = meta?.icon ?? HelpCircle
          const accent = meta?.accent ?? '#8b949e'
          const accentBg = meta?.accentBg ?? 'rgba(139,148,158,0.08)'
          const accentBorder = meta?.accentBorder ?? 'rgba(139,148,158,0.2)'

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample.text)}
              aria-label={`Load sample ticket: ${sample.id}`}
              className="group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 sm:w-auto sm:gap-2.5 sm:py-2"
              style={{
                background: 'rgba(13,18,36,0.6)',
                borderColor: 'rgba(255,255,255,0.07)',
                animationDelay: `${160 + i * 40}ms`,
                minHeight: '44px', // comfortable touch target
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentBorder
                e.currentTarget.style.background = accentBg
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background = 'rgba(13,18,36,0.6)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Icon */}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <Icon
                  className="h-3.5 w-3.5 transition-colors duration-200"
                  style={{ color: '#484f58' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = accent
                  }}
                  aria-hidden="true"
                />
              </span>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors duration-200 leading-none">
                  {sample.id}
                </p>
                {meta?.description && (
                  <p className="mt-0.5 text-[10px] text-[#30363d] group-hover:text-[#484f58] transition-colors duration-200 leading-none">
                    {meta.description}
                  </p>
                )}
              </div>

              {/* On mobile only: subtle chevron hint */}
              <span
                className="ml-auto shrink-0 text-[#30363d] transition-colors duration-200 group-hover:text-[#484f58] sm:hidden"
                aria-hidden="true"
              >
                ›
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SampleTickets

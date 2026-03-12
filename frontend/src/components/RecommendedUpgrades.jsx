import React from 'react';
import { ArrowUpCircle, Cpu, Monitor, MemoryStick, ExternalLink } from 'lucide-react';

const PRIORITY_CONFIG = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   label: 'High Priority' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'Medium Priority' },
  Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   label: 'Low Priority' },
};

const COMPONENT_ICONS = {
  CPU: Cpu,
  GPU: Monitor,
  RAM: MemoryStick,
};

const TIER_COLORS = {
  'Budget':    '#94a3b8',
  'Mid-Range': '#60a5fa',
  'High-End':  '#a78bfa',
  'Flagship':  '#f59e0b',
};

function UpgradeCard({ upgrade }) {
  const cfg = PRIORITY_CONFIG[upgrade.priority] || PRIORITY_CONFIG.Medium;
  const Icon = COMPONENT_ICONS[upgrade.component] || Cpu;

  return (
    <div
      className="rounded-xl p-4 sm:p-5 card-lift"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      data-testid={`upgrade-card-${upgrade.component.toLowerCase()}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-russo text-sm uppercase tracking-wide text-white">{upgrade.component} Upgrade</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: `${cfg.color}15` }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">{upgrade.reason}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 ml-12">
        {upgrade.suggestions.map(s => (
          <span key={s} className="text-xs font-mono bg-gaming-secondary border border-gaming-border px-2.5 py-1 rounded-md text-white/80">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function HardwareCard({ item, type }) {
  const tierColor = TIER_COLORS[item.tier] || '#94a3b8';

  return (
    <a
      href={item.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-gaming card-lift p-4 flex flex-col gap-2 cursor-pointer no-underline group"
      data-testid={`recommended-${type}-card`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: tierColor }}>
          {item.tier}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-neon-cyan transition-colors shrink-0" />
      </div>
      <p className="text-white text-sm font-medium leading-snug">{item.name}</p>
      <div className="flex items-center gap-3 mt-auto pt-1">
        <div className="flex-1 h-1 bg-gaming-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min((item.score / 112) * 100, 100)}%`, background: `linear-gradient(90deg, ${tierColor}50, ${tierColor})` }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground">{item.score}/112</span>
      </div>
      {item.vram && (
        <div className="text-xs text-muted-foreground font-mono">{item.vram}GB VRAM · {item.brand}</div>
      )}
    </a>
  );
}

export default function RecommendedUpgrades({ upgrades, bestGPUs, bestCPUs }) {
  const hasUpgrades = upgrades && upgrades.length > 0;
  const hasGPUs = bestGPUs && bestGPUs.length > 0;
  const hasCPUs = bestCPUs && bestCPUs.length > 0;

  return (
    <div className="space-y-8" data-testid="recommended-upgrades">
      {/* Upgrade Suggestions */}
      {hasUpgrades && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-orange-400" />
            <h2 className="font-russo text-lg uppercase tracking-wide">Upgrade Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgrades.map((u, i) => <UpgradeCard key={i} upgrade={u} />)}
          </div>
        </div>
      )}

      {/* Best GPU for This Build */}
      {hasGPUs && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-green-400" />
            <h2 className="font-russo text-lg uppercase tracking-wide">Best GPU for This Build</h2>
            <span className="text-xs text-muted-foreground font-mono">Matched to your CPU tier</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bestGPUs.map((gpu, i) => <HardwareCard key={i} item={gpu} type="gpu" />)}
          </div>
        </div>
      )}

      {/* Best CPU Upgrade */}
      {hasCPUs && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-purple-400" />
            <h2 className="font-russo text-lg uppercase tracking-wide">Best CPU Upgrade</h2>
            <span className="text-xs text-muted-foreground font-mono">Matched to your GPU tier</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bestCPUs.map((cpu, i) => <HardwareCard key={i} item={cpu} type="cpu" />)}
          </div>
        </div>
      )}

      {!hasUpgrades && !hasGPUs && !hasCPUs && (
        <div className="card-gaming p-8 text-center">
          <ArrowUpCircle className="w-10 h-10 text-neon-cyan mx-auto mb-3" />
          <p className="text-muted-foreground">No upgrades needed — your build is optimally configured!</p>
        </div>
      )}
    </div>
  );
}

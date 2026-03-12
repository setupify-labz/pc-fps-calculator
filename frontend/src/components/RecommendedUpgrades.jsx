import React from 'react';
import { ArrowUpCircle, Cpu, Monitor, MemoryStick, ExternalLink, TrendingUp, Zap } from 'lucide-react';

const PRIORITY_CONFIG = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)',   label: 'High Priority' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)',  label: 'Medium Priority' },
};

const COMPONENT_ICONS = { CPU: Cpu, GPU: Monitor, RAM: MemoryStick };

const TIER_COLORS = {
  'Budget': '#94a3b8', 'Mid-Range': '#60a5fa', 'High-End': '#a78bfa', 'Flagship': '#f59e0b',
};

function UpgradeCard({ upgrade }) {
  const cfg = PRIORITY_CONFIG[upgrade.priority] || PRIORITY_CONFIG.Medium;
  const Icon = COMPONENT_ICONS[upgrade.component] || Cpu;
  return (
    <div className="rounded-xl p-4 sm:p-5 card-lift" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      data-testid={`upgrade-card-${upgrade.component.toLowerCase()}`}>
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
          <span key={s} className="text-xs font-mono bg-gaming-secondary border border-gaming-border px-2.5 py-1 rounded-md text-white/80">{s}</span>
        ))}
      </div>
    </div>
  );
}

function HardwareCard({ item, type, badge }) {
  const tierColor = TIER_COLORS[item.tier] || '#94a3b8';
  const maxScore = type === 'gpu' ? 120 : 100;
  return (
    <a href={item.affiliate_url} target="_blank" rel="noopener noreferrer"
      className="card-gaming card-lift p-4 flex flex-col gap-2 cursor-pointer no-underline group"
      data-testid={`recommended-${type}-card`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          {badge && (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded border w-fit"
              style={{ color: badge.color, borderColor: `${badge.color}30`, background: `${badge.color}10` }}>
              {badge.label}
            </span>
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: tierColor }}>{item.tier}</span>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-neon-cyan transition-colors shrink-0 mt-0.5" />
      </div>
      <p className="text-white text-sm font-medium leading-snug">{item.name}</p>
      <div className="flex items-center gap-3 mt-auto pt-1">
        <div className="flex-1 h-1 bg-gaming-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{
            width: `${Math.min((item.score / maxScore) * 100, 100)}%`,
            background: `linear-gradient(90deg, ${tierColor}40, ${tierColor})`,
          }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground">{item.score}/{maxScore}</span>
      </div>
      {item.vram !== undefined && (
        <div className="text-xs text-muted-foreground font-mono">{item.vram}GB VRAM · {item.brand}</div>
      )}
      {item.brand && item.vram === undefined && (
        <div className="text-xs text-muted-foreground font-mono">{item.brand}</div>
      )}
    </a>
  );
}

function GPUSection({ gpus }) {
  const { comparable = [], upgrade = [], major_upgrade = [] } = gpus || {};
  if (!comparable.length && !upgrade.length && !major_upgrade.length) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-5 w-1 rounded-full bg-green-400" />
        <h2 className="font-russo text-lg uppercase tracking-wide">Best GPU for This Build</h2>
      </div>

      {comparable.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Comparable Alternatives
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {comparable.map((gpu, i) => (
              <HardwareCard key={i} item={gpu} type="gpu" badge={{ label: 'Comparable', color: '#60a5fa' }} />
            ))}
          </div>
        </div>
      )}

      {upgrade.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Performance Upgrade
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {upgrade.map((gpu, i) => (
              <HardwareCard key={i} item={gpu} type="gpu" badge={{ label: 'Upgrade', color: '#22c55e' }} />
            ))}
          </div>
        </div>
      )}

      {major_upgrade.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Major Upgrade Tier
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {major_upgrade.map((gpu, i) => (
              <HardwareCard key={i} item={gpu} type="gpu" badge={{ label: 'Major Upgrade', color: '#f59e0b' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CPUSection({ cpus }) {
  const { comparable = [], upgrade = [] } = cpus || {};
  if (!comparable.length && !upgrade.length) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-5 w-1 rounded-full bg-purple-400" />
        <h2 className="font-russo text-lg uppercase tracking-wide">Best CPU for This Build</h2>
        <span className="text-xs text-muted-foreground font-mono">Matched to GPU tier</span>
      </div>

      {comparable.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Comparable CPUs
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {comparable.map((cpu, i) => (
              <HardwareCard key={i} item={cpu} type="cpu" badge={{ label: 'Comparable', color: '#60a5fa' }} />
            ))}
          </div>
        </div>
      )}

      {upgrade.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
            CPU Upgrade Options
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {upgrade.map((cpu, i) => (
              <HardwareCard key={i} item={cpu} type="cpu" badge={{ label: 'Upgrade', color: '#a78bfa' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendedUpgrades({ upgrades, bestGPUs, bestCPUs }) {
  const hasUpgrades = upgrades && upgrades.length > 0;
  const hasGPUs = bestGPUs && (bestGPUs.comparable?.length || bestGPUs.upgrade?.length || bestGPUs.major_upgrade?.length);
  const hasCPUs = bestCPUs && (bestCPUs.comparable?.length || bestCPUs.upgrade?.length);

  return (
    <div className="space-y-8" data-testid="recommended-upgrades">
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

      {hasGPUs && <GPUSection gpus={bestGPUs} />}
      {hasCPUs && <CPUSection cpus={bestCPUs} />}

      {!hasUpgrades && !hasGPUs && !hasCPUs && (
        <div className="card-gaming p-8 text-center">
          <ArrowUpCircle className="w-10 h-10 text-neon-cyan mx-auto mb-3" />
          <p className="font-russo text-base mb-1">Peak Configuration</p>
          <p className="text-muted-foreground text-sm">Your build is at or near the top of its tier — no upgrades needed!</p>
        </div>
      )}
    </div>
  );
}

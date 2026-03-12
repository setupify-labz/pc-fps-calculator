import React, { useState, useEffect } from 'react';
import { TrendingUp, Monitor, Cpu, HardDrive } from 'lucide-react';

const QUALITY_META = {
  Low:    { label: 'Low',    desc: 'Lowest settings',     color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  Medium: { label: 'Medium', desc: 'Balanced settings',   color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  High:   { label: 'High',   desc: 'High quality',        color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  Ultra:  { label: 'Ultra',  desc: 'Maximum settings',    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
};

function getFPSColor(fps) {
  if (fps >= 144) return '#22c55e';
  if (fps >= 100) return '#00e5ff';
  if (fps >= 60)  return '#eab308';
  if (fps >= 30)  return '#f97316';
  return '#ef4444';
}

function getFPSGrade(fps) {
  if (fps >= 144) return { label: 'Excellent', color: '#22c55e' };
  if (fps >= 100) return { label: 'Great',     color: '#00e5ff' };
  if (fps >= 60)  return { label: 'Good',      color: '#eab308' };
  if (fps >= 30)  return { label: 'Fair',      color: '#f97316' };
  return { label: 'Poor', color: '#ef4444' };
}

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = Math.ceil(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.min(Math.round(target * eased), target));
      if (frame >= total) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function FPSCard({ quality, fps, delay }) {
  const meta = QUALITY_META[quality];
  const grade = getFPSGrade(fps);
  const fpsColor = getFPSColor(fps);
  const displayFps = useCountUp(fps, 900);
  const barWidth = Math.min((fps / 360) * 100, 100);

  return (
    <div
      className="card-gaming card-lift p-5 sm:p-6 fade-in-up flex flex-col gap-4"
      style={{ animationDelay: `${delay}ms`, borderLeft: `3px solid ${meta.color}` }}
      data-testid={`fps-card-${quality.toLowerCase()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: meta.color }}>
            {meta.label} Quality
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{meta.desc}</div>
        </div>
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border"
          style={{ color: grade.color, borderColor: `${grade.color}30`, background: `${grade.color}10` }}
        >
          {grade.label}
        </span>
      </div>

      {/* FPS Number */}
      <div className="flex items-baseline gap-1">
        <span
          className="fps-number text-5xl font-bold leading-none"
          style={{ color: fpsColor, textShadow: `0 0 20px ${fpsColor}50` }}
          data-testid={`fps-value-${quality.toLowerCase()}`}
        >
          {displayFps}
        </span>
        <span className="text-muted-foreground text-sm font-mono">FPS</span>
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-gaming-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${fpsColor}80, ${fpsColor})` }}
        />
      </div>
    </div>
  );
}

export default function FPSResults({ results }) {
  const { fps, build_summary, build_score, build_tier, cpu_score, gpu_score } = results;

  const tierColor = {
    'Budget': '#94a3b8',
    'Mid-Range': '#60a5fa',
    'High-End': '#a78bfa',
    'Enthusiast': '#f59e0b',
    'Flagship': '#00e5ff',
  }[build_tier] || '#94a3b8';

  return (
    <div data-testid="fps-results" className="space-y-6">
      {/* Build Summary Banner */}
      <div className="card-gaming p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-neon-cyan fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center neon-glow shrink-0">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Build Analysis Complete</p>
            <p className="font-russo text-lg tracking-wide">{build_summary.game} · {build_summary.resolution}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-mono uppercase">CPU Score</div>
            <div className="font-mono font-bold text-lg text-white">{cpu_score}</div>
          </div>
          <div className="w-px bg-gaming-border hidden sm:block" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-mono uppercase">GPU Score</div>
            <div className="font-mono font-bold text-lg text-white">{gpu_score}</div>
          </div>
          <div className="w-px bg-gaming-border hidden sm:block" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-mono uppercase">Build Tier</div>
            <div className="font-mono font-bold text-lg" style={{ color: tierColor }}>{build_tier}</div>
          </div>
        </div>
      </div>

      {/* FPS Cards */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
        <h2 className="font-russo text-lg uppercase tracking-wide">FPS Estimates</h2>
        <span className="text-xs text-muted-foreground font-mono">({build_summary.resolution} · {build_summary.game})</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(fps).map(([quality, value], i) => (
          <FPSCard key={quality} quality={quality} fps={value} delay={i * 80} />
        ))}
      </div>

      {/* Build Specs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Cpu,        label: 'CPU',  value: build_summary.cpu,           tier: build_summary.cpu_tier },
          { icon: Monitor,    label: 'GPU',  value: build_summary.gpu,           tier: build_summary.gpu_tier },
          { icon: HardDrive,  label: 'RAM',  value: build_summary.ram,           tier: null },
          { icon: Monitor,    label: 'VRAM', value: `${build_summary.gpu_vram}GB VRAM`, tier: null },
        ].map(({ icon: Icon, label, value, tier }) => (
          <div key={label} className="card-gaming p-3 flex items-start gap-3">
            <Icon className="w-4 h-4 text-neon-cyan mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-mono uppercase">{label}</div>
              <div className="text-xs font-medium text-white truncate">{value}</div>
              {tier && <div className="text-xs text-muted-foreground">{tier}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { TrendingUp, Monitor, Cpu, HardDrive, Zap } from 'lucide-react';

const QUALITY_META = {
  Performance: { label: 'Performance', desc: 'Ultra-low render · Competitive mode', color: '#00e5ff', bg: 'rgba(0,229,255,0.06)', border: '#00e5ff' },
  Low:         { label: 'Low',         desc: 'Lowest settings',                    color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: '#94a3b8' },
  Medium:      { label: 'Medium',      desc: 'Balanced quality',                   color: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  border: '#60a5fa' },
  High:        { label: 'High',        desc: 'High quality',                       color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: '#a78bfa' },
  Ultra:       { label: 'Ultra',       desc: 'Maximum settings',                   color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: '#f59e0b' },
};

const QUALITY_ORDER = ['Performance', 'Low', 'Medium', 'High', 'Ultra'];

function getFPSColor(fps) {
  if (fps >= 240) return '#00e5ff';
  if (fps >= 144) return '#22c55e';
  if (fps >= 100) return '#60a5fa';
  if (fps >= 60)  return '#eab308';
  if (fps >= 30)  return '#f97316';
  return '#ef4444';
}

function getFPSGrade(fps) {
  if (fps >= 240) return { label: 'Elite',     color: '#00e5ff' };
  if (fps >= 144) return { label: 'Excellent', color: '#22c55e' };
  if (fps >= 100) return { label: 'Great',     color: '#60a5fa' };
  if (fps >= 60)  return { label: 'Good',      color: '#eab308' };
  if (fps >= 30)  return { label: 'Fair',      color: '#f97316' };
  return { label: 'Poor', color: '#ef4444' };
}

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    let frame = 0;
    const total = Math.ceil(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setCount(Math.min(Math.round(target * eased), target));
      if (frame >= total) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function FPSCard({ quality, fps, delay, isPerformance }) {
  const meta = QUALITY_META[quality] || QUALITY_META.Medium;
  const grade = getFPSGrade(fps);
  const fpsColor = isPerformance ? '#00e5ff' : getFPSColor(fps);
  const displayFps = useCountUp(fps, 900);
  const barWidth = Math.min((fps / 500) * 100, 100); // normalize to 500 max for bar

  if (isPerformance) {
    return (
      <div
        className="col-span-2 lg:col-span-5 rounded-xl p-5 sm:p-6 fade-in-up flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ animationDelay: `${delay}ms`, background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.25)' }}
        data-testid="fps-card-performance"
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center neon-glow">
            <Zap className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-neon-cyan">Performance Mode</div>
            <div className="text-xs text-muted-foreground">Ultra-low render res · Fortnite exclusive</div>
          </div>
        </div>
        <div className="flex items-baseline gap-1 sm:ml-auto">
          <span className="fps-number text-5xl font-bold" style={{ color: fpsColor, textShadow: `0 0 25px ${fpsColor}60` }}
            data-testid="fps-value-performance">{displayFps}</span>
          <span className="text-muted-foreground text-sm font-mono">FPS</span>
        </div>
        <div className="sm:w-48 w-full">
          <div className="h-1.5 bg-gaming-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${fpsColor}50, ${fpsColor})` }} />
          </div>
          <div className="text-xs text-neon-cyan font-mono mt-1">Competitive-grade FPS</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-lift rounded-xl p-5 sm:p-6 fade-in-up flex flex-col gap-4"
      style={{ animationDelay: `${delay}ms`, background: meta.bg, border: `1px solid ${meta.border}25`, borderLeft: `3px solid ${meta.border}` }}
      data-testid={`fps-card-${quality.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{meta.desc}</div>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border"
          style={{ color: grade.color, borderColor: `${grade.color}30`, background: `${grade.color}10` }}>
          {grade.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="fps-number text-5xl font-bold leading-none"
          style={{ color: fpsColor, textShadow: `0 0 20px ${fpsColor}50` }}
          data-testid={`fps-value-${quality.toLowerCase()}`}>{displayFps}</span>
        <span className="text-muted-foreground text-sm font-mono">FPS</span>
      </div>
      <div className="h-1.5 bg-gaming-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${fpsColor}70, ${fpsColor})` }} />
      </div>
    </div>
  );
}

export default function FPSResults({ results }) {
  const { fps, build_summary, build_score, build_tier, cpu_score, gpu_score } = results;
  const hasPerformance = 'Performance' in fps;
  const standardOrder = QUALITY_ORDER.filter(q => q !== 'Performance' && q in fps);

  const tierColor = {
    'Budget': '#94a3b8', 'Mid-Range': '#60a5fa', 'High-End': '#a78bfa',
    'Enthusiast': '#f59e0b', 'Flagship': '#00e5ff',
  }[build_tier] || '#94a3b8';

  return (
    <div data-testid="fps-results" className="space-y-6">
      {/* Build Banner */}
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
        <div className="flex flex-wrap gap-4 sm:gap-5">
          {[
            { label: 'CPU Score', value: cpu_score, color: 'white' },
            { label: 'GPU Score', value: gpu_score, color: 'white' },
            { label: 'Build Tier', value: build_tier, color: tierColor },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-muted-foreground font-mono uppercase">{label}</div>
              <div className="font-mono font-bold text-lg" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
        <h2 className="font-russo text-lg uppercase tracking-wide">FPS Estimates</h2>
        <span className="text-xs text-muted-foreground font-mono">
          ({build_summary.resolution} · {build_summary.game})
        </span>
        {hasPerformance && (
          <span className="text-xs font-mono bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full">
            + Performance Mode
          </span>
        )}
      </div>

      {/* FPS Grid */}
      <div className={`grid gap-4 ${hasPerformance ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {hasPerformance && (
          <FPSCard key="Performance" quality="Performance" fps={fps['Performance']} delay={0} isPerformance />
        )}
        {standardOrder.map((quality, i) => (
          <FPSCard key={quality} quality={quality} fps={fps[quality]} delay={(i + (hasPerformance ? 1 : 0)) * 80} />
        ))}
      </div>

      {/* Specs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Cpu,       label: 'CPU',  value: build_summary.cpu,              tier: build_summary.cpu_tier },
          { icon: Monitor,   label: 'GPU',  value: build_summary.gpu,              tier: build_summary.gpu_tier },
          { icon: HardDrive, label: 'RAM',  value: build_summary.ram,              tier: null },
          { icon: Monitor,   label: 'VRAM', value: `${build_summary.gpu_vram}GB`,  tier: null },
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

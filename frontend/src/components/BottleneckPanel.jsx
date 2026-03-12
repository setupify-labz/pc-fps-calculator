import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Cpu, Monitor } from 'lucide-react';

function getBottleneckColor(pct) {
  if (pct >= 35) return '#ef4444';
  if (pct >= 20) return '#f97316';
  if (pct >= 10) return '#eab308';
  return '#22c55e';
}

function getBottleneckLabel(pct) {
  if (pct >= 35) return 'Severe';
  if (pct >= 20) return 'Warning';
  if (pct >= 10) return 'Moderate';
  if (pct > 0)   return 'Minimal';
  return 'None';
}

function BottleneckMeter({ label, componentName, score, pct, icon: Icon }) {
  const [barWidth, setBarWidth] = useState(0);
  const color = getBottleneckColor(pct);
  const statusLabel = getBottleneckLabel(pct);
  const isWarning = pct >= 20;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 400);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="flex-1 rounded-xl p-4 sm:p-5" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color }}>
              {label} {isWarning ? 'Bottleneck' : 'Load'}
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate max-w-[140px] sm:max-w-none">
              {componentName.split(' ').slice(-2).join(' ')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-2xl leading-none" style={{ color }}
            data-testid={`bottleneck-pct-${label.toLowerCase()}`}>{pct}%</div>
          <div className="text-xs font-mono" style={{ color, opacity: 0.8 }}>{statusLabel}</div>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-gaming-secondary rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}50, ${color})` }}
          data-testid={`bottleneck-bar-${label.toLowerCase()}`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>0%</span>
        <span>Score: {score}</span>
        <span>100%</span>
      </div>

      {isWarning && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-mono rounded-lg px-2 py-1.5"
          style={{ background: `${color}10`, color }}>
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{label === 'CPU' ? 'CPU limiting GPU output' : 'GPU limiting visual quality'}</span>
        </div>
      )}
    </div>
  );
}

const TYPE_CONFIG = {
  CPU:      { bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.25)', icon: AlertTriangle },
  GPU:      { bg: 'rgba(234,179,8,0.06)',  border: 'rgba(234,179,8,0.25)',  icon: Info },
  Balanced: { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.25)', icon: CheckCircle },
};

export default function BottleneckPanel({ bottleneck, buildSummary }) {
  if (!bottleneck) return null;

  const config = TYPE_CONFIG[bottleneck.type] || TYPE_CONFIG.Balanced;
  const Icon = config.icon;
  const typeColor = bottleneck.type === 'CPU' ? '#f97316' : bottleneck.type === 'GPU' ? '#eab308' : '#22c55e';
  const cpuPct = bottleneck.cpu_bottleneck_pct ?? 0;
  const gpuPct = bottleneck.gpu_bottleneck_pct ?? 0;

  return (
    <div className="rounded-xl p-5 sm:p-6 fade-in-up space-y-5"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
      data-testid="bottleneck-panel">
      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ background: typeColor }} />
          <h2 className="font-russo text-lg uppercase tracking-wide">Bottleneck Analysis</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${typeColor}15`, border: `1px solid ${typeColor}30` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: typeColor }} />
          </div>
          <span className="font-mono font-bold" style={{ color: typeColor }}
            data-testid="bottleneck-type-label">
            {bottleneck.type === 'Balanced' ? 'Well Balanced' : `${bottleneck.type} Bottleneck · ${bottleneck.severity}%`}
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <p className="text-white font-medium text-sm sm:text-base" data-testid="bottleneck-message">
          {bottleneck.message}
        </p>
        <p className="text-muted-foreground text-sm mt-1">{bottleneck.detail}</p>
      </div>

      {/* Dual Meter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <BottleneckMeter
          label="CPU"
          componentName={buildSummary?.cpu || 'CPU'}
          score={bottleneck.type !== 'GPU' ? (buildSummary ? 'vs GPU' : '') : ''}
          pct={cpuPct}
          icon={Cpu}
        />
        <BottleneckMeter
          label="GPU"
          componentName={buildSummary?.gpu || 'GPU'}
          score={bottleneck.type !== 'CPU' ? (buildSummary ? 'vs CPU' : '') : ''}
          pct={gpuPct}
          icon={Monitor}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground border-t border-gaming-border/40 pt-3">
        {[
          { color: '#22c55e', label: '<10% Optimal' },
          { color: '#eab308', label: '10–20% Moderate' },
          { color: '#f97316', label: '20–35% Warning' },
          { color: '#ef4444', label: '>35% Severe' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

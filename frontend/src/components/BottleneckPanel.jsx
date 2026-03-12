import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const TYPE_CONFIG = {
  CPU:      { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.3)',  icon: AlertTriangle, label: 'CPU Bottleneck' },
  GPU:      { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.3)',   icon: Info,          label: 'GPU Bottleneck' },
  Balanced: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',   icon: CheckCircle,   label: 'Well Balanced' },
};

export default function BottleneckPanel({ bottleneck }) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(bottleneck?.severity || 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [bottleneck]);

  if (!bottleneck) return null;

  const config = TYPE_CONFIG[bottleneck.type] || TYPE_CONFIG.Balanced;
  const Icon = config.icon;

  return (
    <div
      className="rounded-xl p-5 sm:p-6 fade-in-up"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
      data-testid="bottleneck-panel"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-5 w-1 rounded-full" style={{ background: config.color }} />
        <h2 className="font-russo text-lg uppercase tracking-wide">Bottleneck Analysis</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5 mt-4">
        {/* Icon + Type */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:min-w-[100px] sm:text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}40` }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: config.color }}>
              {config.label}
            </div>
            {bottleneck.type !== 'Balanced' && (
              <div className="font-mono font-bold text-2xl sm:text-3xl" style={{ color: config.color }}>
                {bottleneck.severity}%
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3">
          <p className="text-white font-medium text-sm sm:text-base" data-testid="bottleneck-message">
            {bottleneck.message}
          </p>
          <p className="text-muted-foreground text-sm">{bottleneck.detail}</p>

          {/* Severity Bar */}
          {bottleneck.type !== 'Balanced' && (
            <div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1.5">
                <span>Bottleneck Severity</span>
                <span style={{ color: config.color }}>{bottleneck.severity}%</span>
              </div>
              <div className="h-2 bg-gaming-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${config.color}60, ${config.color})`,
                  }}
                  data-testid="bottleneck-bar"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
                <span>Balanced</span>
                <span>Severe</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

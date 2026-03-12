import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QUALITY_COLORS, formatCPU, formatGPU, truncateLabel } from '../lib/constants';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-gaming-secondary border border-gaming-border rounded-xl p-4 font-mono shadow-2xl min-w-[220px]">
      <p className="text-white font-bold text-sm mb-2">{d.game}</p>
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mb-3">
        <span>{d.cpuFull} + {d.gpuFull}</span>
        <span>{d.resolution} · {d.ram}</span>
      </div>
      <div className="border-t border-gaming-border/40 pt-2 space-y-1">
        {['Performance', 'Low', 'Medium', 'High', 'Ultra']
          .filter(q => q in (d.fps || {}))
          .map(q => (
          <div key={q} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: QUALITY_COLORS[q] }} />
              <span className="text-xs" style={{ color: QUALITY_COLORS[q] }}>{q}</span>
            </div>
            <span className="text-white font-bold text-xs tabular-nums">{d.fps[q]} FPS</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryChart() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState('Medium');

  useEffect(() => {
    axios.get(`${API}/history?limit=10`)
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (history.length === 0) return null;

  // Build unique labels: use game name + short GPU when duplicates exist
  const gameCounts = {};
  history.forEach(h => { gameCounts[h.game] = (gameCounts[h.game] || 0) + 1; });

  const chartData = history.map((h, i) => {
    const isDuplicate = gameCounts[h.game] > 1;
    const label = isDuplicate
      ? truncateLabel(`${h.game} (${formatGPU(h.gpu).split(' ').slice(0, 2).join(' ')})`, 22)
      : truncateLabel(h.game, 18);

    return {
      idx: i,
      game: h.game,
      cpu: h.cpu,
      gpu: h.gpu,
      ram: h.ram,
      resolution: h.resolution,
      fps: h.fps,
      cpuFull: formatCPU(h.cpu),
      gpuFull: formatGPU(h.gpu),
      value: h.fps?.[quality] || h.fps?.Medium || 0,
      label,
    };
  }).reverse();

  const activeColor = QUALITY_COLORS[quality];
  const availableQualities = ['Low', 'Medium', 'High', 'Ultra'];

  return (
    <div data-testid="history-chart" className="fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
          <h2 className="font-russo text-lg uppercase tracking-wide">Recent Calculations</h2>
          <span className="text-xs text-muted-foreground font-mono">{history.length} results</span>
        </div>
        <div className="flex gap-1.5">
          {availableQualities.map(q => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              data-testid={`history-quality-${q.toLowerCase()}`}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                quality === q
                  ? 'font-bold'
                  : 'text-muted-foreground hover:text-white border border-gaming-border hover:border-neon-cyan/30'
              }`}
              style={quality === q ? { background: QUALITY_COLORS[q], color: '#0b0d12' } : {}}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="card-gaming p-5 sm:p-8">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7a90', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={{ stroke: '#2d3342' }}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fill: '#6b7a90', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              width={45}
              label={{ value: 'FPS', angle: -90, position: 'insideLeft', fill: '#6b7a90', fontSize: 11, dx: -5 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={600}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={activeColor} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Monitor, Cpu } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUALITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#60a5fa',
  High: '#a78bfa',
  Ultra: '#f59e0b',
  Performance: '#00e5ff',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-gaming-secondary border border-gaming-border rounded-lg p-3 text-xs font-mono shadow-xl">
      <p className="text-white font-bold mb-1">{d.game}</p>
      <p className="text-muted-foreground">{d.cpu_short} + {d.gpu_short}</p>
      <p className="text-muted-foreground">{d.resolution} · {d.ram}</p>
      <div className="mt-1.5 pt-1.5 border-t border-gaming-border/40 space-y-0.5">
        {Object.entries(d.fps || {}).map(([q, v]) => (
          <div key={q} className="flex justify-between gap-4">
            <span style={{ color: QUALITY_COLORS[q] || '#fff' }}>{q}</span>
            <span className="text-white font-bold">{v} FPS</span>
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

  const chartData = history.map((h, i) => ({
    idx: i,
    game: h.game,
    cpu: h.cpu,
    gpu: h.gpu,
    ram: h.ram,
    resolution: h.resolution,
    fps: h.fps,
    cpu_short: h.cpu?.split(' ').slice(-2).join(' '),
    gpu_short: h.gpu?.split(' ').slice(-2).join(' '),
    value: h.fps?.[quality] || h.fps?.Medium || 0,
    label: `${h.game?.substring(0, 12)}`,
  })).reverse();

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
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                quality === q
                  ? 'font-bold text-gaming-bg'
                  : 'text-muted-foreground hover:text-white border border-gaming-border hover:border-neon-cyan/30'
              }`}
              style={quality === q ? { background: QUALITY_COLORS[q], color: '#0b0d12' } : {}}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="card-gaming p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7a90', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#2d3342' }}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: '#6b7a90', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'FPS', angle: -90, position: 'insideLeft', fill: '#6b7a90', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,229,255,0.05)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => {
                const fps = entry.value;
                const color = fps >= 144 ? '#00e5ff' : fps >= 60 ? '#22c55e' : fps >= 30 ? '#eab308' : '#ef4444';
                return <Cell key={index} fill={color} fillOpacity={0.8} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs font-mono text-muted-foreground border-t border-gaming-border/30 pt-3">
          {[
            { color: '#00e5ff', label: '144+ Elite' },
            { color: '#22c55e', label: '60+ Smooth' },
            { color: '#eab308', label: '30+ Playable' },
            { color: '#ef4444', label: '<30 Low' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

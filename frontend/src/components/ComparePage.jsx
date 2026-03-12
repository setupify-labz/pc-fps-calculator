import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Gauge, ArrowLeft, Zap, Cpu, Monitor, MemoryStick, ArrowLeftRight } from 'lucide-react';
import SearchableHardwareSelect from './SearchableHardwareSelect';
import GameSelector from './GameSelector';
import { QUALITY_COLORS, getFPSColor } from '../lib/constants';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function BuildForm({ id, hardware, form, setForm, onCalculate, loading, results }) {
  const update = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="flex-1 min-w-0">
      <div className="card-gaming p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-xs font-mono font-bold text-neon-cyan">
            {id}
          </div>
          <span className="font-russo text-sm uppercase tracking-wide">Build {id}</span>
        </div>

        <SearchableHardwareSelect
          icon={Cpu} label="CPU" value={form.cpu} onChange={update('cpu')}
          groups={hardware ? hardware.cpus : {}} testId={`compare-cpu-${id}`}
        />
        <SearchableHardwareSelect
          icon={Monitor} label="GPU" value={form.gpu} onChange={update('gpu')}
          groups={hardware ? hardware.gpus : {}} testId={`compare-gpu-${id}`}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MemoryStick className="w-3.5 h-3.5 text-neon-cyan" />RAM
            </label>
            <Select value={form.ram} onValueChange={update('ram')}>
              <SelectTrigger data-testid={`compare-ram-${id}`} className="h-10 bg-gaming-secondary border-gaming-border text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-secondary border-gaming-border text-white z-50">
                {['8GB', '16GB', '32GB', '64GB'].map(r => (
                  <SelectItem key={r} value={r} className="text-sm focus:bg-gaming-border focus:text-white">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-neon-cyan" />Resolution
            </label>
            <Select value={form.resolution} onValueChange={update('resolution')}>
              <SelectTrigger data-testid={`compare-res-${id}`} className="h-10 bg-gaming-secondary border-gaming-border text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-secondary border-gaming-border text-white z-50">
                {['1080p', '1440p', '4K'].map(r => (
                  <SelectItem key={r} value={r} className="text-sm focus:bg-gaming-border focus:text-white">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <GameSelector hardware={hardware} value={form.game} onChange={update('game')} />

        <button
          onClick={onCalculate}
          disabled={!form.cpu || !form.gpu || loading}
          data-testid={`compare-calc-${id}`}
          className="btn-neon h-10 w-full flex items-center justify-center gap-2 text-xs"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-gaming-bg/30 border-t-gaming-bg rounded-full animate-spin" />
          ) : (
            <><Zap className="w-3.5 h-3.5" />Calculate</>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card-gaming p-5 mt-4 space-y-4" data-testid={`compare-results-${id}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Build Score</span>
            <span className="font-mono font-bold text-lg text-neon-cyan">{results.build_score}</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground text-center px-2 py-1 rounded-md bg-neon-cyan/5 border border-neon-cyan/20">
            {results.build_tier} · {results.bottleneck?.type === 'Balanced' ? 'Balanced' : `${results.bottleneck?.type} Bottleneck ${results.bottleneck?.severity}%`}
          </div>

          <div className="space-y-2">
            {['Performance', 'Low', 'Medium', 'High', 'Ultra'].filter(q => q in results.fps).map(q => (
              <div key={q} className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase" style={{ color: QUALITY_COLORS[q] }}>{q}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gaming-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((results.fps[q] / 400) * 100, 100)}%`,
                      background: getFPSColor(results.fps[q]),
                    }} />
                  </div>
                  <span className="font-mono font-bold text-sm w-14 text-right" style={{ color: getFPSColor(results.fps[q]) }}>
                    {results.fps[q]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [hardware, setHardware] = useState(null);
  const [formA, setFormA] = useState({ cpu: '', gpu: '', ram: '16GB', resolution: '1080p', game: 'Fortnite' });
  const [formB, setFormB] = useState({ cpu: '', gpu: '', ram: '16GB', resolution: '1080p', game: 'Fortnite' });
  const [resultsA, setResultsA] = useState(null);
  const [resultsB, setResultsB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const fetchHardware = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/hardware`);
      setHardware(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchHardware(); }, [fetchHardware]);

  const calc = async (form, setResults, setLoading) => {
    if (!form.cpu || !form.gpu) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/calculate`, form);
      setResults(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const bothDone = resultsA && resultsB;
  const qualities = bothDone
    ? ['Performance', 'Low', 'Medium', 'High', 'Ultra'].filter(q => q in resultsA.fps || q in resultsB.fps)
    : [];

  return (
    <div className="min-h-screen bg-gaming-bg text-white relative">
      <div className="hero-glow" aria-hidden="true" />

      <header className="relative z-10 border-b border-gaming-border/50 bg-gaming-bg/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5 text-neon-cyan" />
            </div>
            <span className="font-russo text-sm tracking-widest text-neon-cyan uppercase">Compare Builds</span>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-neon-cyan transition-colors">
            <ArrowLeft className="w-3 h-3" /> Calculator
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="font-russo text-2xl sm:text-3xl uppercase tracking-wider mb-2">
            Compare <span className="neon-text">Two Builds</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Configure two different builds and see how they stack up side by side.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6" data-testid="compare-builds">
          <BuildForm id="A" hardware={hardware} form={formA} setForm={setFormA}
            onCalculate={() => calc(formA, setResultsA, setLoadingA)} loading={loadingA} results={resultsA} />

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-neon-cyan" />
            </div>
          </div>

          <BuildForm id="B" hardware={hardware} form={formB} setForm={setFormB}
            onCalculate={() => calc(formB, setResultsB, setLoadingB)} loading={loadingB} results={resultsB} />
        </div>

        {/* Side-by-side comparison table */}
        {bothDone && (
          <div className="card-gaming mt-8 overflow-hidden" data-testid="compare-table">
            <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
                <h2 className="font-russo text-lg uppercase tracking-wide">Head to Head</h2>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gaming-border/40">
                    <th className="text-left text-xs font-mono uppercase tracking-widest text-muted-foreground py-2 px-3">Quality</th>
                    <th className="text-right text-xs font-mono uppercase tracking-widest text-neon-cyan py-2 px-3">Build A</th>
                    <th className="text-right text-xs font-mono uppercase tracking-widest text-neon-cyan py-2 px-3">Build B</th>
                    <th className="text-right text-xs font-mono uppercase tracking-widest text-muted-foreground py-2 px-3">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {qualities.map(q => {
                    const a = resultsA.fps[q] || 0;
                    const b = resultsB.fps[q] || 0;
                    const diff = a - b;
                    const pct = b > 0 ? Math.round(((a - b) / b) * 100) : 0;
                    return (
                      <tr key={q} className="border-b border-gaming-border/20">
                        <td className="py-2.5 px-3 font-mono text-xs uppercase" style={{ color: QUALITY_COLORS[q] }}>{q}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: getFPSColor(a) }}>{a} FPS</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: getFPSColor(b) }}>{b} FPS</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: diff > 0 ? '#22c55e' : diff < 0 ? '#ef4444' : '#6b7a90' }}>
                          {diff > 0 ? '+' : ''}{diff} ({diff > 0 ? '+' : ''}{pct}%)
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-gaming-border/40">
                    <td className="py-2.5 px-3 text-xs font-mono uppercase text-muted-foreground">Build Score</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{resultsA.build_score}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{resultsB.build_score}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold" style={{
                      color: resultsA.build_score > resultsB.build_score ? '#22c55e' : resultsA.build_score < resultsB.build_score ? '#ef4444' : '#6b7a90'
                    }}>
                      {resultsA.build_score > resultsB.build_score ? '+' : ''}{resultsA.build_score - resultsB.build_score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import HardwareSelector from './components/HardwareSelector';
import FPSResults from './components/FPSResults';
import BottleneckPanel from './components/BottleneckPanel';
import RecommendedUpgrades from './components/RecommendedUpgrades';
import ProductCards from './components/ProductCards';
import { Zap, Cpu, Gauge } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function App() {
  const [hardware, setHardware] = useState(null);
  const [form, setForm] = useState({
    cpu: '',
    gpu: '',
    ram: '16GB',
    resolution: '1080p',
    game: 'Fortnite',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchHardware();
  }, []);

  const fetchHardware = async () => {
    try {
      const res = await axios.get(`${API}/hardware`);
      setHardware(res.data);
      const firstIntel = res.data.cpus?.Intel?.[0];
      const firstNvidia = res.data.gpus?.NVIDIA?.[0];
      setForm(f => ({
        ...f,
        cpu: firstIntel || '',
        gpu: firstNvidia || '',
      }));
    } catch (e) {
      console.error('Failed to load hardware', e);
    }
  };

  const handleCalculate = async () => {
    if (!form.cpu || !form.gpu) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/calculate`, form);
      setResults(res.data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch (e) {
      setError('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg text-white relative">
      {/* Background glow */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-10 border-b border-gaming-border/50 bg-gaming-bg/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center neon-glow">
              <Gauge className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-russo text-sm tracking-widest text-neon-cyan uppercase">FPS Calculator</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-14 pb-10 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">Dynamic Benchmark Engine</span>
        </div>
        <h1
          className="font-russo text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider leading-tight mb-4"
          data-testid="hero-title"
        >
          Smart PC{' '}
          <span className="neon-text">FPS</span>{' '}
          Calculator
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Select your hardware and game to get accurate FPS estimates, bottleneck analysis, and upgrade recommendations.
        </p>
      </section>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <HardwareSelector
          hardware={hardware}
          form={form}
          setForm={setForm}
          onCalculate={handleCalculate}
          loading={loading}
        />

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {results && (
          <div ref={resultsRef} className="mt-10 space-y-8" data-testid="results-section">
            <FPSResults results={results} />
            <BottleneckPanel bottleneck={results.bottleneck} />
            <RecommendedUpgrades
              upgrades={results.upgrades}
              bestGPUs={results.best_gpus}
              bestCPUs={results.best_cpus}
            />
            <ProductCards cards={results.product_cards} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gaming-border/30 py-8 text-center">
        <p className="text-muted-foreground text-xs font-mono">
          FPS estimates are based on benchmark data. Actual performance may vary.
          Amazon links use affiliate placeholder tags.
        </p>
      </footer>
    </div>
  );
}

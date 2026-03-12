import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import './App.css';
import HardwareSelector from './components/HardwareSelector';
import FPSResults from './components/FPSResults';
import BottleneckPanel from './components/BottleneckPanel';
import RecommendedUpgrades from './components/RecommendedUpgrades';
import ProductCards from './components/ProductCards';
import RequestGameModal from './components/RequestGameModal';
import { Zap, Gauge, Copy, Link, Gamepad2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function FPSCalculator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hardware, setHardware] = useState(null);
  const [form, setForm] = useState({
    cpu: searchParams.get('cpu') || '',
    gpu: searchParams.get('gpu') || '',
    ram: searchParams.get('ram') || '16GB',
    resolution: searchParams.get('res') || '1080p',
    game: searchParams.get('game') || 'Fortnite',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const resultsRef = useRef(null);
  const hasUrlParams = searchParams.get('cpu') && searchParams.get('gpu');

  const fetchHardware = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/hardware`);
      setHardware(res.data);
      // Only set defaults if no URL params
      if (!hasUrlParams) {
        const firstIntel = res.data.cpus?.Intel?.[res.data.cpus.Intel.length - 3] || res.data.cpus?.Intel?.[0];
        const firstNvidia = res.data.gpus?.NVIDIA?.[res.data.gpus.NVIDIA.length - 4] || res.data.gpus?.NVIDIA?.[0];
        setForm(f => ({ ...f, cpu: f.cpu || firstIntel || '', gpu: f.gpu || firstNvidia || '' }));
      }
    } catch (e) {
      console.error('Failed to load hardware', e);
    }
  }, [hasUrlParams]);

  useEffect(() => {
    fetchHardware();
  }, [fetchHardware]);

  // Auto-calculate if URL params are present
  useEffect(() => {
    if (hasUrlParams && hardware && form.cpu && form.gpu) {
      handleCalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardware]);

  const handleCalculate = async () => {
    if (!form.cpu || !form.gpu) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/calculate`, form);
      setResults(res.data);
      // Update URL with current build
      setSearchParams({ cpu: form.cpu, gpu: form.gpu, ram: form.ram, res: form.resolution, game: form.game });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (e) {
      setError('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Build link copied to clipboard!', {
        description: 'Share this URL to show your exact hardware configuration.',
        duration: 3000,
      });
    });
  };

  return (
    <div className="min-h-screen bg-gaming-bg text-white relative">
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRequestModal(true)}
              data-testid="request-game-btn"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-neon-cyan transition-colors border border-gaming-border hover:border-neon-cyan/30 px-3 py-1.5 rounded-lg"
            >
              <Gamepad2 className="w-3 h-3" />
              Request a Game
            </button>
            {results && (
              <button
                onClick={copyShareLink}
                data-testid="copy-link-btn"
                className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-neon-cyan transition-colors border border-gaming-border hover:border-neon-cyan/30 px-3 py-1.5 rounded-lg"
              >
                <Link className="w-3 h-3" />
                Share Build
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-14 pb-10 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">Dynamic Benchmark Engine v2</span>
        </div>
        <h1 className="font-russo text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider leading-tight mb-4" data-testid="hero-title">
          Smart PC <span className="neon-text">FPS</span> Calculator
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Select your hardware and game to get accurate FPS estimates, bottleneck analysis, and upgrade recommendations.
        </p>
      </section>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <HardwareSelector hardware={hardware} form={form} setForm={setForm} onCalculate={handleCalculate} loading={loading} />

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {results && (
          <div ref={resultsRef} className="mt-10 space-y-8" data-testid="results-section">
            {/* Share banner */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
                <span className="font-russo text-sm uppercase tracking-wide text-muted-foreground">
                  Results for {results.build_summary.cpu.split(' ').slice(-2).join(' ')} + {results.build_summary.gpu.split(' ').slice(-1)[0]}
                </span>
              </div>
              <button
                onClick={copyShareLink}
                data-testid="copy-link-results-btn"
                className="flex items-center gap-2 text-xs font-mono text-neon-cyan hover:text-white transition-colors bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 px-3 py-1.5 rounded-lg"
              >
                <Copy className="w-3 h-3" />
                Copy Share Link
              </button>
            </div>

            <FPSResults results={results} />
            <BottleneckPanel bottleneck={results.bottleneck} buildSummary={results.build_summary} />
            <RecommendedUpgrades upgrades={results.upgrades} bestGPUs={results.best_gpus} bestCPUs={results.best_cpus} />
            <ProductCards cards={results.product_cards} />
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-gaming-border/30 py-8 text-center space-y-4">
        <button
          onClick={() => setShowRequestModal(true)}
          data-testid="request-game-footer-btn"
          className="inline-flex items-center gap-2 text-xs font-mono text-neon-cyan hover:text-white transition-colors bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 px-4 py-2 rounded-lg"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Don't see your game? Request it
        </button>
        <p className="text-muted-foreground text-xs font-mono">
          FPS estimates are based on benchmark data. Actual performance may vary.
          Amazon links are affiliate placeholder links (tag: fpscalc-20).
        </p>
      </footer>

      <RequestGameModal open={showRequestModal} onClose={() => setShowRequestModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<FPSCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

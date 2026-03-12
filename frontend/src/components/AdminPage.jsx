import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Trash2, Gamepad2, BarChart3, Hash, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function LoginGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/login`, { password: pw });
      if (res.data.ok) { onAuth(pw); }
      else { setError(true); }
    } catch { setError(true); }
  };

  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gaming-secondary border border-gaming-border rounded-2xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-neon-cyan" />
            </div>
            <h1 className="font-russo text-lg uppercase tracking-wide text-white">Admin Access</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="Enter admin password"
              autoFocus
              data-testid="admin-password-input"
              className="w-full h-11 px-3 bg-[#0b0d12] border border-gaming-border rounded-lg text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan transition-colors"
            />
            {error && <p className="text-xs text-red-400 font-mono">Wrong password</p>}
            <button type="submit" data-testid="admin-login-btn" className="btn-neon w-full h-11 text-xs">
              Unlock
            </button>
          </form>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-neon-cyan transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to calculator
          </Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ password }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    axios.get(`${API}/admin/game-requests?password=${encodeURIComponent(password)}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [password]);

  const handleDelete = async (name) => {
    await axios.delete(`${API}/admin/game-requests/${encodeURIComponent(name)}?password=${encodeURIComponent(password)}`);
    setData(prev => {
      const filtered = prev.requests.filter(r => r.name !== name);
      return { requests: filtered, total_requests: filtered.reduce((s, r) => s + r.count, 0), unique_games: filtered.length };
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
    </div>
  );

  const requests = data?.requests || [];

  return (
    <div className="min-h-screen bg-gaming-bg text-white">
      <header className="border-b border-gaming-border/50 bg-gaming-bg/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Gamepad2 className="w-3.5 h-3.5 text-neon-cyan" />
            </div>
            <span className="font-russo text-sm tracking-widest text-neon-cyan uppercase">Game Requests</span>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-neon-cyan transition-colors">
            <ArrowLeft className="w-3 h-3" /> Calculator
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card-gaming p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <Hash className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-white">{data?.unique_games || 0}</p>
              <p className="text-xs text-muted-foreground font-mono">Unique games</p>
            </div>
          </div>
          <div className="card-gaming p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-white">{data?.total_requests || 0}</p>
              <p className="text-xs text-muted-foreground font-mono">Total requests</p>
            </div>
          </div>
        </div>

        {/* Table */}
        {requests.length === 0 ? (
          <div className="card-gaming p-10 text-center">
            <p className="text-muted-foreground text-sm font-mono">No game requests yet</p>
          </div>
        ) : (
          <div className="card-gaming overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />
            <table className="w-full" data-testid="admin-requests-table">
              <thead>
                <tr className="border-b border-gaming-border/40">
                  <th className="text-left text-xs font-mono uppercase tracking-widest text-muted-foreground px-4 py-3 w-12">#</th>
                  <th className="text-left text-xs font-mono uppercase tracking-widest text-muted-foreground px-4 py-3">Game</th>
                  <th className="text-right text-xs font-mono uppercase tracking-widest text-muted-foreground px-4 py-3">Requests</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.name} className="border-b border-gaming-border/20 hover:bg-white/[0.02] transition-colors" data-testid={`admin-row-${i}`}>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono font-bold text-neon-cyan">{r.count}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(r.name)}
                        data-testid={`delete-btn-${i}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState(null);
  return password ? <Dashboard password={password} /> : <LoginGate onAuth={setPassword} />;
}

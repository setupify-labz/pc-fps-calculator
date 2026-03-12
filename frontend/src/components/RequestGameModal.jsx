import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, TrendingUp, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RequestGameModal({ open, onClose }) {
  const [gameName, setGameName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      axios.get(`${API}/game-requests`).then(r => setRequests(r.data.requests)).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = gameName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/game-requests`, { game_name: name });
      toast.success(`"${res.data.name}" requested!`, { description: `Total requests: ${res.data.count}`, duration: 3000 });
      setGameName('');
      // Refresh leaderboard
      const lb = await axios.get(`${API}/game-requests`);
      setRequests(lb.data.requests);
    } catch {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="request-game-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gaming-secondary border border-gaming-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-neon-cyan" />
            </div>
            <h2 className="font-russo text-lg uppercase tracking-wide">Request a Game</h2>
          </div>
          <button onClick={onClose} data-testid="close-modal-btn" className="text-muted-foreground hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-6 text-xs text-muted-foreground font-mono mb-4">
          Suggest a game to add to the calculator. No personal info needed.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name..."
              maxLength={100}
              required
              data-testid="game-name-input"
              className="flex-1 h-11 px-3 bg-[#0b0d12] border border-gaming-border rounded-lg text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan transition-colors"
            />
            <button
              type="submit"
              disabled={!gameName.trim() || submitting}
              data-testid="submit-request-btn"
              className="btn-neon h-11 px-5 flex items-center gap-2 text-xs whitespace-nowrap"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-gaming-bg/30 border-t-gaming-bg rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Request
            </button>
          </div>
        </form>

        {/* Leaderboard */}
        {requests.length > 0 && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Most Requested</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {requests.map((r, i) => (
                <div
                  key={r.name}
                  data-testid={`request-item-${i}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0b0d12]/60 border border-gaming-border/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <span className="text-sm text-white">{r.name}</span>
                  </div>
                  <span className="text-xs font-mono text-neon-cyan">
                    {r.count} {r.count === 1 ? 'request' : 'requests'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

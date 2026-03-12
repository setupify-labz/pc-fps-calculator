import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Send, Gamepad2, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RequestGameModal({ open, onClose }) {
  const [gameName, setGameName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = gameName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/game-requests`, { game_name: name });
      setSubmitted(true);
      setGameName('');
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setGameName('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="request-game-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-gaming-secondary border border-gaming-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />

        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-neon-cyan" />
            </div>
            <h2 className="font-russo text-lg uppercase tracking-wide">Request a Game</h2>
          </div>
          <button onClick={handleClose} data-testid="close-modal-btn" className="text-muted-foreground hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 pb-6 pt-2 text-center" data-testid="request-confirmation">
            <CheckCircle className="w-10 h-10 text-neon-cyan mx-auto mb-3" />
            <p className="text-sm text-white font-medium mb-1">Thanks! We'll consider adding this game.</p>
            <p className="text-xs text-muted-foreground font-mono mb-5">Your suggestion has been recorded.</p>
            <button
              onClick={() => setSubmitted(false)}
              data-testid="request-another-btn"
              className="text-xs font-mono text-neon-cyan hover:text-white transition-colors underline underline-offset-2"
            >
              Request another game
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground font-mono mb-4">
              Suggest a game to add to the calculator. No personal info needed.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter game name..."
                maxLength={100}
                required
                autoFocus
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

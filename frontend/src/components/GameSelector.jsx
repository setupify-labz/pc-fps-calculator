import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, Search, ChevronDown, Check } from 'lucide-react';

const CATEGORY_COLORS = {
  "Competitive / Esports": "#00e5ff",
  "Open World / AAA":      "#f59e0b",
  "Action RPG":            "#a78bfa",
  "Racing":                "#ef4444",
  "Sandbox / Creative":    "#22c55e",
  "Strategy":              "#60a5fa",
  "Simulation":            "#ec4899",
  "Horror / Survival":     "#f97316",
  "MMO":                   "#14b8a6",
  "Multiplayer / Co-op":   "#8b5cf6",
};

export default function GameSelector({ hardware, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const categories = hardware?.game_categories || [];
  const gamesByCategory = hardware?.games_by_category || {};

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const lowerSearch = search.toLowerCase();

  // Filter categories and games
  const filteredCategories = categories
    .map(cat => {
      const games = (gamesByCategory[cat] || []).filter(g => g.toLowerCase().includes(lowerSearch));
      return { cat, games };
    })
    .filter(({ games }) => games.length > 0);

  const totalMatches = filteredCategories.reduce((sum, { games }) => sum + games.length, 0);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Gamepad2 className="w-3.5 h-3.5 text-neon-cyan" />
        Game Title
      </label>

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          data-testid="game-select"
          className="h-12 w-full flex items-center justify-between px-3 bg-gaming-secondary border border-gaming-border text-white text-sm rounded-xl focus:ring-neon-cyan focus:ring-1 focus:border-neon-cyan/50 hover:border-neon-cyan/30 transition-colors"
        >
          <span className={value ? 'text-white' : 'text-muted-foreground'}>
            {value || 'Select a game...'}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-gaming-secondary border border-gaming-border rounded-xl shadow-2xl z-[100] overflow-hidden"
            data-testid="game-dropdown"
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gaming-border/60">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                data-testid="game-search-input"
                className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{totalMatches} found</span>
              )}
            </div>

            {/* Game list */}
            <div className="max-h-72 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No games found</div>
              ) : (
                filteredCategories.map(({ cat, games }) => (
                  <div key={cat}>
                    {/* Category header */}
                    <div className="sticky top-0 bg-gaming-secondary/95 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] || '#94a3b8' }} />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: CATEGORY_COLORS[cat] || '#94a3b8' }}>
                        {cat}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">({games.length})</span>
                    </div>
                    {/* Games */}
                    {games.map(game => (
                      <button
                        key={game}
                        type="button"
                        onClick={() => {
                          onChange(game);
                          setOpen(false);
                          setSearch('');
                        }}
                        data-testid={`game-option-${game.replace(/[\s:]+/g, '-').toLowerCase()}`}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                          value === game
                            ? 'bg-neon-cyan/10 text-neon-cyan'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{game}</span>
                        {value === game && <Check className="w-3.5 h-3.5 text-neon-cyan" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

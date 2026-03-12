import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const BRAND_COLORS = {
  Intel: '#00e5ff',
  AMD: '#ef4444',
  NVIDIA: '#22c55e',
};

export default function SearchableHardwareSelect({ icon: Icon, label, value, onChange, groups, testId }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const lowerSearch = search.toLowerCase();
  const filteredGroups = Object.entries(groups || {})
    .map(([brand, items]) => ({
      brand,
      items: items.filter(item => item.toLowerCase().includes(lowerSearch)),
    }))
    .filter(({ items }) => items.length > 0);

  const totalMatches = filteredGroups.reduce((sum, { items }) => sum + items.length, 0);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-neon-cyan" />
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          data-testid={testId}
          className="h-12 w-full flex items-center justify-between px-3 bg-gaming-secondary border border-gaming-border text-white text-sm rounded-xl focus:ring-neon-cyan focus:ring-1 focus:border-neon-cyan/50 hover:border-neon-cyan/30 transition-colors"
        >
          <span className={`truncate ${value ? 'text-white' : 'text-muted-foreground'}`}>
            {value || `Select ${label.toLowerCase()}...`}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gaming-secondary border border-gaming-border rounded-xl shadow-2xl z-[100] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gaming-border/60">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                data-testid={`${testId}-search`}
                className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{totalMatches}</span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No results</div>
              ) : (
                filteredGroups.map(({ brand, items }) => (
                  <div key={brand}>
                    <div className="sticky top-0 bg-gaming-secondary/95 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND_COLORS[brand] || '#94a3b8' }} />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: BRAND_COLORS[brand] || '#94a3b8' }}>
                        {brand}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
                    </div>
                    {items.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => { onChange(item); setOpen(false); setSearch(''); }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                          value === item
                            ? 'bg-neon-cyan/10 text-neon-cyan'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{item}</span>
                        {value === item && <Check className="w-3.5 h-3.5 text-neon-cyan shrink-0" />}
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

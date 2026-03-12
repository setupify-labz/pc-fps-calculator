import React, { useState } from 'react';
import { ExternalLink, Cpu, Monitor, HardDrive } from 'lucide-react';

const TIER_COLORS = {
  'Budget':    '#94a3b8',
  'Mid-Range': '#60a5fa',
  'High-End':  '#a78bfa',
  'Flagship':  '#f59e0b',
};

const CATEGORY_ICONS = {
  GPU: Monitor,
  CPU: Cpu,
  RAM: HardDrive,
};

const TABS = ['All', 'GPU', 'CPU', 'RAM'];

function ProductCard({ card }) {
  const tierColor = TIER_COLORS[card.tier] || '#94a3b8';
  const Icon = CATEGORY_ICONS[card.category] || Monitor;

  return (
    <div
      className="card-gaming card-lift flex flex-col overflow-hidden"
      data-testid={`product-card-${card.name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${tierColor}, transparent)` }} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category + Tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Icon className="w-3 h-3" />
            {card.category}
          </div>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
            style={{ color: tierColor, background: `${tierColor}15`, border: `1px solid ${tierColor}25` }}
          >
            {card.tier}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-russo text-sm sm:text-base leading-tight text-white">{card.name}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-xs leading-relaxed flex-1">{card.description}</p>

        {/* Check Price Button */}
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`product-link-${card.name.replace(/\s+/g, '-').toLowerCase()}`}
          className="mt-auto flex items-center justify-center gap-2 w-full text-xs font-mono font-bold uppercase tracking-wider text-gaming-bg bg-neon-cyan hover:bg-neon-cyan/85 transition-all duration-200 px-4 py-2.5 rounded-lg group"
        >
          Check price on Amazon
          <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
}

export default function ProductCards({ cards }) {
  const [activeTab, setActiveTab] = useState('All');

  if (!cards || cards.length === 0) return null;

  const filtered = activeTab === 'All' ? cards : cards.filter(c => c.category === activeTab);

  return (
    <div data-testid="product-cards-section">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-5 w-1 rounded-full bg-neon-cyan neon-glow" />
        <h2 className="font-russo text-lg uppercase tracking-wide">Top Hardware Picks</h2>
        <span className="text-xs text-muted-foreground font-mono">Amazon Affiliate Links</span>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`product-tab-${tab.toLowerCase()}`}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
              activeTab === tab
                ? 'bg-neon-cyan text-gaming-bg font-bold'
                : 'bg-gaming-secondary text-muted-foreground hover:text-white border border-gaming-border hover:border-neon-cyan/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((card, i) => (
          <ProductCard key={i} card={card} />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground font-mono mt-5 opacity-60">
        Prices change frequently — click to see live pricing on Amazon. Affiliate tag: fpscalc-20 (placeholder)
      </p>
    </div>
  );
}

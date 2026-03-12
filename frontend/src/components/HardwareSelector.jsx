import React from 'react';
import { MemoryStick, Monitor, Cpu, Zap } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import SearchableHardwareSelect from './SearchableHardwareSelect';
import GameSelector from './GameSelector';

export default function HardwareSelector({ hardware, form, setForm, onCalculate, loading }) {
  const update = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const canCalculate = form.cpu && form.gpu && !loading;

  return (
    <div className="card-gaming p-6 sm:p-8 scanlines" data-testid="hardware-selector">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-6 w-1 rounded-full bg-neon-cyan neon-glow" />
        <h2 className="font-russo text-xl sm:text-2xl uppercase tracking-wide">Configure Your Build</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* CPU - Searchable */}
        <SearchableHardwareSelect
          icon={Cpu} label="Processor (CPU)" value={form.cpu} onChange={update('cpu')}
          groups={hardware ? hardware.cpus : {}} testId="cpu-select"
        />

        {/* GPU - Searchable */}
        <SearchableHardwareSelect
          icon={Monitor} label="Graphics Card (GPU)" value={form.gpu} onChange={update('gpu')}
          groups={hardware ? hardware.gpus : {}} testId="gpu-select"
        />

        {/* RAM */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MemoryStick className="w-3.5 h-3.5 text-neon-cyan" />
            System RAM
          </label>
          <Select value={form.ram} onValueChange={update('ram')}>
            <SelectTrigger data-testid="ram-select" className="h-12 bg-gaming-secondary border-gaming-border text-white text-sm focus:ring-neon-cyan focus:ring-1 focus:border-neon-cyan/50 hover:border-neon-cyan/30 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gaming-secondary border-gaming-border text-white max-h-64 z-50">
              {(hardware?.rams || ['8GB', '16GB', '32GB', '64GB']).map(r => (
                <SelectItem key={r} value={r} className="text-sm focus:bg-gaming-border focus:text-white">{r} RAM</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-neon-cyan" />
            Target Resolution
          </label>
          <Select value={form.resolution} onValueChange={update('resolution')}>
            <SelectTrigger data-testid="resolution-select" className="h-12 bg-gaming-secondary border-gaming-border text-white text-sm focus:ring-neon-cyan focus:ring-1 focus:border-neon-cyan/50 hover:border-neon-cyan/30 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gaming-secondary border-gaming-border text-white max-h-64 z-50">
              {(hardware?.resolutions || ['1080p', '1440p', '4K']).map(r => (
                <SelectItem key={r} value={r} className="text-sm focus:bg-gaming-border focus:text-white">
                  {r === '1080p' ? '1080p (Full HD)' : r === '1440p' ? '1440p (2K QHD)' : '4K (Ultra HD)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Game - Searchable */}
        <GameSelector hardware={hardware} value={form.game} onChange={update('game')} />

        {/* Calculate Button */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-transparent select-none">Action</label>
          <button
            data-testid="calculate-btn"
            onClick={onCalculate}
            disabled={!canCalculate}
            className="btn-neon h-12 w-full flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-gaming-bg/30 border-t-gaming-bg rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <><Zap className="w-4 h-4" />Estimate FPS</>
            )}
          </button>
        </div>
      </div>

      {/* Current selection summary */}
      {form.cpu && form.gpu && (
        <div className="mt-6 pt-5 border-t border-gaming-border/40 flex flex-wrap gap-3 text-xs font-mono text-muted-foreground">
          <span className="bg-gaming-secondary px-2.5 py-1 rounded-md border border-gaming-border/50">{form.cpu}</span>
          <span className="text-gaming-border self-center">+</span>
          <span className="bg-gaming-secondary px-2.5 py-1 rounded-md border border-gaming-border/50">{form.gpu}</span>
          <span className="text-gaming-border self-center">|</span>
          <span className="bg-gaming-secondary px-2.5 py-1 rounded-md border border-gaming-border/50">{form.ram}</span>
          <span className="bg-gaming-secondary px-2.5 py-1 rounded-md border border-gaming-border/50">{form.resolution}</span>
          <span className="bg-gaming-secondary px-2.5 py-1 rounded-md border border-gaming-border/50">{form.game}</span>
        </div>
      )}
    </div>
  );
}

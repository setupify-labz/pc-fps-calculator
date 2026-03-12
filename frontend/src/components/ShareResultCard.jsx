import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download, Copy, X, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { QUALITY_COLORS, formatCPU, formatGPU } from '../lib/constants';

const W = 680;
const H = 520;
const BG = '#0b0d12';
const CARD = '#161a22';
const BORDER = '#2d3342';
const CYAN = '#00e5ff';
const WHITE = '#f0f0f0';
const MUTED = '#6b7a90';
const FONT_MONO = '"JetBrains Mono", "Courier New", monospace';
const FONT_SANS = '"Manrope", "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawCard(ctx, results) {
  const { fps, build_summary, build_score, build_tier, bottleneck } = results;
  const cpu = formatCPU(build_summary.cpu);
  const gpu = formatGPU(build_summary.gpu);

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Main card
  roundRect(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.fillStyle = CARD;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top accent line
  ctx.fillStyle = CYAN;
  roundRect(ctx, 20, 20, W - 40, 3, 0);
  ctx.fill();

  // Header: Game + Resolution
  let y = 52;
  ctx.font = `bold 22px ${FONT_SANS}`;
  ctx.fillStyle = WHITE;
  ctx.fillText(build_summary.game, 44, y);
  const gameW = ctx.measureText(build_summary.game).width;
  ctx.font = `bold 13px ${FONT_MONO}`;
  ctx.fillStyle = CYAN;
  ctx.fillText(build_summary.resolution, 44 + gameW + 14, y);

  // Build tier badge
  ctx.font = `bold 11px ${FONT_MONO}`;
  const tierText = build_tier;
  const tierW = ctx.measureText(tierText).width + 16;
  const tierX = W - 44 - tierW;
  roundRect(ctx, tierX, y - 14, tierW, 20, 6);
  ctx.fillStyle = `${CYAN}20`;
  ctx.fill();
  ctx.strokeStyle = `${CYAN}50`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = CYAN;
  ctx.fillText(tierText, tierX + 8, y - 0.5);

  // Divider
  y += 18;
  ctx.strokeStyle = `${BORDER}80`;
  ctx.beginPath();
  ctx.moveTo(44, y);
  ctx.lineTo(W - 44, y);
  ctx.stroke();

  // Hardware specs row
  y += 22;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillStyle = MUTED;
  ctx.fillText('CPU', 44, y);
  ctx.fillText('GPU', 240, y);
  ctx.fillText('RAM', 440, y);
  y += 16;
  ctx.font = `bold 13px ${FONT_SANS}`;
  ctx.fillStyle = WHITE;
  ctx.fillText(cpu, 44, y);
  ctx.fillText(gpu, 240, y);
  ctx.fillText(build_summary.ram, 440, y);

  // FPS Results section
  y += 32;
  ctx.font = `bold 11px ${FONT_MONO}`;
  ctx.fillStyle = CYAN;
  ctx.fillText('FPS ESTIMATES', 44, y);

  y += 20;
  const qualities = ['Performance', 'Low', 'Medium', 'High', 'Ultra'].filter(q => q in fps);
  const barStartX = 160;
  const barW = 360;
  const maxFPS = Math.max(...qualities.map(q => fps[q]), 1);

  qualities.forEach(q => {
    const color = QUALITY_COLORS[q];
    const fpsVal = fps[q];
    const pct = fpsVal / maxFPS;

    // Quality label
    ctx.font = `bold 11px ${FONT_MONO}`;
    ctx.fillStyle = color;
    ctx.fillText(q.toUpperCase(), 44, y + 2);

    // Bar background
    roundRect(ctx, barStartX, y - 9, barW, 14, 4);
    ctx.fillStyle = `${BORDER}60`;
    ctx.fill();

    // Bar fill
    const fillW = Math.max(barW * pct, 8);
    roundRect(ctx, barStartX, y - 9, fillW, 14, 4);
    ctx.fillStyle = `${color}cc`;
    ctx.fill();

    // FPS value
    ctx.font = `bold 13px ${FONT_MONO}`;
    ctx.fillStyle = WHITE;
    const fpsText = `${fpsVal} FPS`;
    const fpsW = ctx.measureText(fpsText).width;
    ctx.fillText(fpsText, barStartX + barW + 14, y + 2);

    y += 28;
  });

  // Bottleneck section
  y += 8;
  ctx.strokeStyle = `${BORDER}80`;
  ctx.beginPath();
  ctx.moveTo(44, y);
  ctx.lineTo(W - 44, y);
  ctx.stroke();
  y += 20;

  ctx.font = `bold 11px ${FONT_MONO}`;
  ctx.fillStyle = MUTED;
  ctx.fillText('BOTTLENECK', 44, y);

  const bnType = bottleneck?.type || 'Balanced';
  const bnSeverity = bottleneck?.severity || 0;
  const bnColor = bnType === 'Balanced' ? '#22c55e' : bnSeverity > 20 ? '#ef4444' : '#eab308';
  const bnText = bnType === 'Balanced' ? 'Well Balanced' : `${bnType} Bottleneck ${bnSeverity}%`;

  ctx.fillStyle = bnColor;
  ctx.font = `bold 13px ${FONT_SANS}`;
  ctx.fillText(bnText, 130, y);

  // Build score
  ctx.fillStyle = MUTED;
  ctx.font = `bold 11px ${FONT_MONO}`;
  ctx.fillText('BUILD SCORE', 440, y);
  ctx.fillStyle = CYAN;
  ctx.font = `bold 16px ${FONT_MONO}`;
  ctx.fillText(String(build_score), 560, y + 1);

  // Footer
  y = H - 46;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillStyle = `${MUTED}80`;
  ctx.fillText('Generated with Smart PC FPS Calculator', W / 2 - ctx.measureText('Generated with Smart PC FPS Calculator').width / 2, y);
}

export default function ShareResultCard({ results, open, onClose }) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  const render = useCallback(() => {
    if (!results || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    drawCard(ctx, results);
    setImageUrl(canvas.toDataURL('image/png'));
  }, [results]);

  useEffect(() => {
    if (open) render();
  }, [open, render]);

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `fps-result-${results.build_summary.game.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
    toast.success('Image downloaded');
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise(res => canvasRef.current.toBlob(res, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('Image copied to clipboard');
    } catch {
      toast.error('Copy failed — try downloading instead');
    }
  };

  const shareToReddit = () => {
    const { build_summary, fps, bottleneck, build_tier } = results;
    const cpu = formatCPU(build_summary.cpu);
    const gpu = formatGPU(build_summary.gpu);
    const lines = [
      `**${build_summary.game} @ ${build_summary.resolution}** — ${build_tier} Build`,
      `CPU: ${cpu} | GPU: ${gpu} | RAM: ${build_summary.ram}`,
      '',
      ...['Low', 'Medium', 'High', 'Ultra'].filter(q => q in fps).map(q => `${q}: ${fps[q]} FPS`),
      '',
      `Bottleneck: ${bottleneck?.type === 'Balanced' ? 'Well Balanced' : `${bottleneck?.type} ${bottleneck?.severity}%`}`,
      '',
      '*Generated with Smart PC FPS Calculator*',
    ].join('\n');
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(`${build_summary.game} FPS Results — ${cpu} + ${gpu}`)}&text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  const shareToDiscord = async () => {
    const { build_summary, fps, bottleneck, build_tier } = results;
    const cpu = formatCPU(build_summary.cpu);
    const gpu = formatGPU(build_summary.gpu);
    const lines = [
      `**${build_summary.game} @ ${build_summary.resolution}** — ${build_tier} Build`,
      `CPU: ${cpu} | GPU: ${gpu} | RAM: ${build_summary.ram}`,
      ...['Low', 'Medium', 'High', 'Ultra'].filter(q => q in fps).map(q => `${q}: **${fps[q]} FPS**`),
      `Bottleneck: ${bottleneck?.type === 'Balanced' ? 'Well Balanced' : `${bottleneck?.type} ${bottleneck?.severity}%`}`,
      `_Generated with Smart PC FPS Calculator_`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      toast.success('Discord-ready text copied to clipboard — paste in any channel');
    } catch {
      toast.error('Copy failed');
    }
  };

  if (!open || !results) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="share-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[740px] bg-gaming-secondary border border-gaming-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-neon-cyan via-neon-cyan/50 to-transparent" />

        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-neon-cyan" />
            </div>
            <h2 className="font-russo text-lg uppercase tracking-wide">Share Result</h2>
          </div>
          <button onClick={onClose} data-testid="close-share-modal" className="text-muted-foreground hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="px-6 pb-4 overflow-x-auto">
          <canvas
            ref={canvasRef}
            data-testid="share-canvas"
            className="rounded-xl border border-gaming-border/50 mx-auto block"
          />
        </div>

        {/* Share buttons */}
        <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={downloadImage}
            data-testid="share-download-btn"
            className="btn-neon h-10 flex items-center justify-center gap-2 text-xs rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={copyImage}
            data-testid="share-copy-btn"
            className="h-10 flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0b0d12] border border-gaming-border hover:border-neon-cyan/40 transition-colors rounded-lg"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Image
          </button>
          <button
            onClick={shareToReddit}
            data-testid="share-reddit-btn"
            className="h-10 flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#FF4500]/15 border border-[#FF4500]/30 hover:bg-[#FF4500]/25 transition-colors rounded-lg"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            Reddit
          </button>
          <button
            onClick={shareToDiscord}
            data-testid="share-discord-btn"
            className="h-10 flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#5865F2]/15 border border-[#5865F2]/30 hover:bg-[#5865F2]/25 transition-colors rounded-lg"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
            Discord
          </button>
        </div>
      </div>
    </div>
  );
}

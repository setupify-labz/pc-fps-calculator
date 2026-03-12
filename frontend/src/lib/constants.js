// Shared quality color constants — single source of truth
export const QUALITY_COLORS = {
  Performance: '#00e5ff',
  Low:         '#22c55e',
  Medium:      '#60a5fa',
  High:        '#a78bfa',
  Ultra:       '#f59e0b',
};

export const QUALITY_ORDER = ['Performance', 'Low', 'Medium', 'High', 'Ultra'];

export function getFPSColor(fps) {
  if (fps >= 240) return '#00e5ff';
  if (fps >= 144) return '#22c55e';
  if (fps >= 100) return '#60a5fa';
  if (fps >= 60)  return '#eab308';
  if (fps >= 30)  return '#f97316';
  return '#ef4444';
}

export function getFPSGrade(fps) {
  if (fps >= 240) return { label: 'Elite',     color: '#00e5ff' };
  if (fps >= 144) return { label: 'Excellent', color: '#22c55e' };
  if (fps >= 100) return { label: 'Great',     color: '#60a5fa' };
  if (fps >= 60)  return { label: 'Good',      color: '#eab308' };
  if (fps >= 30)  return { label: 'Fair',      color: '#f97316' };
  return { label: 'Poor', color: '#ef4444' };
}

// Strip brand prefix for compact display, keep model identifier
export function formatCPU(name) {
  if (!name) return '';
  return name.replace(/^AMD\s+/, '').replace(/^Intel\s+/, '');
}

export function formatGPU(name) {
  if (!name) return '';
  return name.replace(/^NVIDIA\s+/, '').replace(/^AMD\s+/, '');
}

// Truncate with ellipsis, but never mid-word
export function truncateLabel(str, max = 18) {
  if (!str || str.length <= max) return str;
  const truncated = str.substring(0, max).replace(/\s+\S*$/, '');
  return truncated + '…';
}

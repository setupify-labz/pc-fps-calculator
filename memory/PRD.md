# Smart PC FPS Calculator — PRD

## Problem Statement
Build a smart PC FPS calculator website with dark modern gaming UI that allows users to estimate gaming FPS based on their hardware configuration with bottleneck detection, upgrade recommendations, and Amazon affiliate product cards.

## Architecture

### Backend (FastAPI + MongoDB)
- `GET /api/hardware` — Returns grouped CPU (Intel/AMD), GPU (NVIDIA/AMD), RAM, resolution, and game lists
- `POST /api/calculate` — Dynamic FPS calculation using benchmark scoring formula
- MongoDB stores calculation history in `calculations` collection

### Frontend (React + Tailwind)
- Single-page app with sticky header, hero section, calculator form, and results sections
- Components: HardwareSelector, FPSResults, BottleneckPanel, RecommendedUpgrades, ProductCards

## Core Requirements (Static)
1. Dark gaming UI (#0b0d12 bg, #161a22 cards, #00e5ff neon cyan accents)
2. Russo One font for headings, Manrope for body, JetBrains Mono for data
3. Dropdowns for CPU (33 options), GPU (55 options), RAM, Resolution, Game (16 titles)
4. Dynamic FPS calculation (Low/Medium/High/Ultra quality per resolution)
5. Bottleneck detection with severity % and visual bar
6. Recommended upgrade suggestions by priority
7. Best GPU/CPU matching cards with affiliate links
8. Amazon product cards with tab filters (All/GPU/CPU/RAM)
9. Mobile responsive

## FPS Calculation Formula
```
fps = base_fps * (gpu_factor^gpu_weight * cpu_factor^cpu_weight) * res_mult * quality_mult * ram_mult * (1 - bottleneck_penalty)
```
- Reference: GPU=50, CPU=50 → base FPS at Medium 1080p
- Resolution multipliers: 1080p=1.0, 1440p=0.60, 4K=0.40
- Quality multipliers: Low=1.55, Medium=1.0, High=0.78, Ultra=0.62
- Bottleneck threshold: 15 score point difference

## Hardware Database
- **CPUs**: 43 total (Intel 8th–14th Gen + AMD Ryzen 2000/3000/5000/7000)
- **GPUs**: 55 total (NVIDIA GTX 16xx, RTX 2000–5000 + AMD RX 5000–9000)
- **Games**: 81 titles across 10 categories (Competitive/Esports, Open World/AAA, Action RPG, Racing, Sandbox/Creative, Strategy, Simulation, Horror/Survival, MMO, Multiplayer/Co-op)

## What's Been Implemented (Feb 2026)
- [x] Complete dark gaming UI with neon cyan accents
- [x] Hardware selector with grouped dropdowns (Intel/AMD, NVIDIA/AMD)
- [x] Dynamic FPS calculation engine in Python backend
- [x] FPS result cards with animated counters (useCountUp hook)
- [x] Bottleneck detection (CPU/GPU/Balanced) with severity percentage
- [x] Recommended upgrades by priority (High/Medium)
- [x] Best GPU for build + Best CPU upgrade matching cards
- [x] Amazon affiliate product cards with All/GPU/CPU/RAM tab filters — no hardcoded prices, "Check price on Amazon" button links to affiliate URL
- [x] Build tier classification (Budget/Mid-Range/High-End/Enthusiast/Flagship)
- [x] MongoDB calculation history storage
- [x] Mobile responsive design
- [x] Framer-motion ready (installed)
- [x] 81 games across 10 categories with searchable, category-grouped dropdown
- [x] "Request a Game" modal — private submissions stored in MongoDB, no personal data collected, admin-only visibility via GET /api/game-requests

## Backlog / Next Tasks

### P0 (Critical)
- None — core features complete

### P1 (High Value)
- Add comparison mode (compare 2 builds side by side)
- Add FPS history chart (show past calculations)
- Add more games (Baldur's Gate 3, Starfield, The Witcher 3)
- Add search/filter in CPU/GPU dropdowns

### P2 (Nice to Have)
- User can save/share their build configuration via URL
- Add GPU/CPU benchmarks chart (visual bar comparison)
- Add "Build Cost Estimator" using Amazon pricing
- Add 1440p ultrawide resolution option
- Add DLSS/FSR impact toggle in calculation
- Dark/light theme toggle

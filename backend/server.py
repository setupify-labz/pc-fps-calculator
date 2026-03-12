from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===================== HARDWARE DATABASE =====================
# CPU scores: normalized scale where ~100 = top gaming CPU (7800X3D / 7950X3D tier)

CPUS = {
    # Intel 8th/9th Gen (legacy)
    "Intel Core i5-8600K":   {"score": 56, "tier": "Budget",    "brand": "Intel"},
    "Intel Core i5-9400F":   {"score": 57, "tier": "Budget",    "brand": "Intel"},
    "Intel Core i5-9600K":   {"score": 62, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-9700K":   {"score": 67, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i9-9900K":   {"score": 74, "tier": "High-End",  "brand": "Intel"},
    # Intel 10th Gen
    "Intel Core i5-10400F":  {"score": 65, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-10600K":  {"score": 68, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-10700K":  {"score": 73, "tier": "High-End",  "brand": "Intel"},
    "Intel Core i9-10900K":  {"score": 76, "tier": "High-End",  "brand": "Intel"},
    # Intel 11th Gen
    "Intel Core i5-11600K":  {"score": 68, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i9-11900K":  {"score": 76, "tier": "High-End",  "brand": "Intel"},
    # Intel 12th Gen
    "Intel Core i3-12100F":  {"score": 66, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-12400F":  {"score": 76, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-12600K":  {"score": 80, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-12700K":  {"score": 87, "tier": "High-End",  "brand": "Intel"},
    "Intel Core i9-12900K":  {"score": 92, "tier": "Flagship",  "brand": "Intel"},
    # Intel 13th Gen
    "Intel Core i5-13400F":  {"score": 79, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-13600K":  {"score": 85, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-13700K":  {"score": 90, "tier": "High-End",  "brand": "Intel"},
    "Intel Core i9-13900K":  {"score": 97, "tier": "Flagship",  "brand": "Intel"},
    # Intel 14th Gen
    "Intel Core i5-14600K":  {"score": 86, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-14700K":  {"score": 91, "tier": "High-End",  "brand": "Intel"},
    "Intel Core i9-14900K":  {"score": 96, "tier": "Flagship",  "brand": "Intel"},
    # AMD Ryzen 2000 (older)
    "AMD Ryzen 5 2600":      {"score": 52, "tier": "Budget",    "brand": "AMD"},
    "AMD Ryzen 7 2700X":     {"score": 58, "tier": "Budget",    "brand": "AMD"},
    # AMD Ryzen 3000
    "AMD Ryzen 3 3300X":     {"score": 52, "tier": "Budget",    "brand": "AMD"},
    "AMD Ryzen 5 3600":      {"score": 60, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 3700X":     {"score": 65, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 9 3900X":     {"score": 72, "tier": "High-End",  "brand": "AMD"},
    # AMD Ryzen 5000
    "AMD Ryzen 5 5600":      {"score": 74, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 5 5600X":     {"score": 77, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 5 5600G":     {"score": 68, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 5800X":     {"score": 82, "tier": "High-End",  "brand": "AMD"},
    "AMD Ryzen 7 5800X3D":   {"score": 93, "tier": "High-End",  "brand": "AMD"},
    "AMD Ryzen 9 5900X":     {"score": 88, "tier": "Flagship",  "brand": "AMD"},
    "AMD Ryzen 9 5950X":     {"score": 90, "tier": "Flagship",  "brand": "AMD"},
    # AMD Ryzen 7000
    "AMD Ryzen 5 7600":      {"score": 84, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 5 7600X":     {"score": 85, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 7700X":     {"score": 88, "tier": "High-End",  "brand": "AMD"},
    "AMD Ryzen 7 7800X3D":   {"score": 98, "tier": "Flagship",  "brand": "AMD"},
    "AMD Ryzen 9 7900X":     {"score": 92, "tier": "Flagship",  "brand": "AMD"},
    "AMD Ryzen 9 7950X":     {"score": 95, "tier": "Flagship",  "brand": "AMD"},
    "AMD Ryzen 9 7950X3D":   {"score": 99, "tier": "Flagship",  "brand": "AMD"},
}

# GPU scores: RTX 4090 = 100 reference, RTX 5090 = 120 (20% faster)
GPUS = {
    # NVIDIA GTX — Budget
    "NVIDIA GTX 1060 6GB":    {"score": 28, "tier": "Budget",    "vram": 6,  "brand": "NVIDIA"},
    "NVIDIA GTX 1070":        {"score": 34, "tier": "Budget",    "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA GTX 1080 Ti":     {"score": 44, "tier": "Mid-Range", "vram": 11, "brand": "NVIDIA"},
    "NVIDIA GTX 1650":        {"score": 26, "tier": "Budget",    "vram": 4,  "brand": "NVIDIA"},
    "NVIDIA GTX 1650 Super":  {"score": 33, "tier": "Budget",    "vram": 4,  "brand": "NVIDIA"},
    "NVIDIA GTX 1660":        {"score": 35, "tier": "Budget",    "vram": 6,  "brand": "NVIDIA"},
    "NVIDIA GTX 1660 Super":  {"score": 40, "tier": "Budget",    "vram": 6,  "brand": "NVIDIA"},
    "NVIDIA GTX 1660 Ti":     {"score": 42, "tier": "Budget",    "vram": 6,  "brand": "NVIDIA"},
    # NVIDIA RTX 2000
    "NVIDIA RTX 2060":        {"score": 49, "tier": "Mid-Range", "vram": 6,  "brand": "NVIDIA"},
    "NVIDIA RTX 2060 Super":  {"score": 54, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 2070":        {"score": 57, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 2070 Super":  {"score": 62, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 2080 Super":  {"score": 69, "tier": "High-End",  "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 2080 Ti":     {"score": 74, "tier": "High-End",  "vram": 11, "brand": "NVIDIA"},
    # NVIDIA RTX 3000
    "NVIDIA RTX 3060":        {"score": 57, "tier": "Mid-Range", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 3060 Ti":     {"score": 67, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 3070":        {"score": 74, "tier": "High-End",  "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 3070 Ti":     {"score": 77, "tier": "High-End",  "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 3080":        {"score": 85, "tier": "High-End",  "vram": 10, "brand": "NVIDIA"},
    "NVIDIA RTX 3080 Ti":     {"score": 90, "tier": "Flagship",  "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 3090":        {"score": 92, "tier": "Flagship",  "vram": 24, "brand": "NVIDIA"},
    # NVIDIA RTX 4000
    "NVIDIA RTX 4060":        {"score": 63, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 4060 Ti":     {"score": 72, "tier": "Mid-Range", "vram": 8,  "brand": "NVIDIA"},
    "NVIDIA RTX 4070":        {"score": 80, "tier": "High-End",  "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Super":  {"score": 84, "tier": "High-End",  "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Ti":     {"score": 88, "tier": "High-End",  "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Ti Super":{"score":91, "tier": "High-End",  "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4080":        {"score": 94, "tier": "Flagship",  "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4080 Super":  {"score": 96, "tier": "Flagship",  "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4090":        {"score": 100,"tier": "Flagship",  "vram": 24, "brand": "NVIDIA"},
    # NVIDIA RTX 5000 (Blackwell — ~15–25% faster per tier vs 4000)
    "NVIDIA RTX 5070":        {"score": 92, "tier": "High-End",  "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 5070 Ti":     {"score": 98, "tier": "Flagship",  "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 5080":        {"score": 112,"tier": "Flagship",  "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 5090":        {"score": 120,"tier": "Flagship",  "vram": 32, "brand": "NVIDIA"},
    # AMD RX 5000
    "AMD RX 5600 XT":         {"score": 41, "tier": "Budget",    "vram": 6,  "brand": "AMD"},
    "AMD RX 5700":            {"score": 46, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    "AMD RX 5700 XT":         {"score": 50, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    # AMD RX 6000
    "AMD RX 6600":            {"score": 52, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    "AMD RX 6600 XT":         {"score": 58, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    "AMD RX 6650 XT":         {"score": 60, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    "AMD RX 6700":            {"score": 62, "tier": "Mid-Range", "vram": 10, "brand": "AMD"},
    "AMD RX 6700 XT":         {"score": 65, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 6750 XT":         {"score": 67, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 6800":            {"score": 72, "tier": "High-End",  "vram": 16, "brand": "AMD"},
    "AMD RX 6800 XT":         {"score": 80, "tier": "High-End",  "vram": 16, "brand": "AMD"},
    "AMD RX 6900 XT":         {"score": 87, "tier": "Flagship",  "vram": 16, "brand": "AMD"},
    "AMD RX 6950 XT":         {"score": 90, "tier": "Flagship",  "vram": 16, "brand": "AMD"},
    # AMD RX 7000
    "AMD RX 7600":            {"score": 58, "tier": "Mid-Range", "vram": 8,  "brand": "AMD"},
    "AMD RX 7700 XT":         {"score": 68, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 7800 XT":         {"score": 76, "tier": "High-End",  "vram": 16, "brand": "AMD"},
    "AMD RX 7900 GRE":        {"score": 82, "tier": "High-End",  "vram": 16, "brand": "AMD"},
    "AMD RX 7900 XT":         {"score": 88, "tier": "Flagship",  "vram": 20, "brand": "AMD"},
    "AMD RX 7900 XTX":        {"score": 93, "tier": "Flagship",  "vram": 24, "brand": "AMD"},
    # AMD RX 9000
    "AMD RX 9070":            {"score": 82, "tier": "High-End",  "vram": 16, "brand": "AMD"},
    "AMD RX 9070 XT":         {"score": 86, "tier": "High-End",  "vram": 16, "brand": "AMD"},
}

# ── base_fps: expected FPS at GPU=100, CPU=100, 1080p, Medium quality ──
# Calibrated so RTX 5090 + 7950X3D Fortnite 4K hits:
#   Low:300-400  Medium:220-260  High:180-220  Ultra:140-180  Perf:350-500
GAMES = {
    "Fortnite":               {"base_fps": 350, "gpu_weight": 0.75, "supports_perf_mode": True},
    "Call of Duty: Warzone":  {"base_fps": 240, "gpu_weight": 0.82},
    "Minecraft":              {"base_fps": 600, "gpu_weight": 0.45},
    "GTA V":                  {"base_fps": 290, "gpu_weight": 0.75},
    "Valorant":               {"base_fps": 520, "gpu_weight": 0.55},
    "CS2":                    {"base_fps": 480, "gpu_weight": 0.60},
    "Apex Legends":           {"base_fps": 370, "gpu_weight": 0.70},
    "Cyberpunk 2077":         {"base_fps": 200, "gpu_weight": 0.92, "res_4k_mult": 0.44},
    "Elden Ring":             {"base_fps": 160, "gpu_weight": 0.80},
    "Red Dead Redemption 2":  {"base_fps": 185, "gpu_weight": 0.87, "res_4k_mult": 0.45},
    "Rainbow Six Siege":      {"base_fps": 600, "gpu_weight": 0.62},
    "PUBG":                   {"base_fps": 220, "gpu_weight": 0.78},
    "Overwatch 2":            {"base_fps": 430, "gpu_weight": 0.62},
    "Rocket League":          {"base_fps": 700, "gpu_weight": 0.52},
    "League of Legends":      {"base_fps": 620, "gpu_weight": 0.50},
    "Dota 2":                 {"base_fps": 480, "gpu_weight": 0.58},
}

RAM_MULTIPLIERS = {"8GB": 0.82, "16GB": 1.0, "32GB": 1.04, "64GB": 1.05}

# 4K: ~42% performance vs 1080p (accounts for real-world GPU memory bandwidth penalty)
RESOLUTION_MULTIPLIERS = {"1080p": 1.0, "1440p": 0.70, "4K": 0.58}

# Performance Mode: Fortnite's ultra-low render resolution setting (~1.85x Medium fps)
QUALITY_MULTIPLIERS = {
    "Performance": 1.85,
    "Low":         1.40,
    "Medium":      1.00,
    "High":        0.82,
    "Ultra":       0.65,
}

PRODUCT_CARDS = [
    {"name": "NVIDIA RTX 5090",              "category": "GPU", "description": "Blackwell flagship. 20% faster than RTX 4090, 32GB VRAM.",    "price": "$1,999", "tier": "Flagship", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+5090&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 5080",              "category": "GPU", "description": "Next-gen powerhouse. Faster than RTX 4090 for less.",         "price": "$999",   "tier": "Flagship", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+5080&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 4090",              "category": "GPU", "description": "The 4K gaming king. Still unmatched in raw rasterization.",    "price": "$1,599", "tier": "Flagship", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4090&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 4070 Super",        "category": "GPU", "description": "Best 1440p value. Dominates competitive and AAA titles.",      "price": "$599",   "tier": "High-End", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4070+Super&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 4070",              "category": "GPU", "description": "Excellent 1440p GPU. Great performance-per-watt.",             "price": "$549",   "tier": "High-End", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4070&tag=fpscalc-20"},
    {"name": "AMD RX 7900 XTX",              "category": "GPU", "description": "AMD flagship with 24GB VRAM. Outstanding 4K value.",           "price": "$749",   "tier": "Flagship", "url": "https://www.amazon.com/s?k=AMD+RX+7900+XTX&tag=fpscalc-20"},
    {"name": "AMD RX 7800 XT",               "category": "GPU", "description": "Best mid-range bang for buck. Great 1440p performance.",       "price": "$479",   "tier": "High-End", "url": "https://www.amazon.com/s?k=AMD+RX+7800+XT&tag=fpscalc-20"},
    {"name": "AMD Ryzen 9 7950X3D",          "category": "CPU", "description": "Ultimate gaming CPU — 3D V-Cache + 16 cores. Unstoppable.",     "price": "$699",   "tier": "Flagship", "url": "https://www.amazon.com/s?k=Ryzen+9+7950X3D&tag=fpscalc-20"},
    {"name": "AMD Ryzen 7 7800X3D",          "category": "CPU", "description": "#1 pure gaming CPU. 3D V-Cache dominates at all resolutions.",  "price": "$449",   "tier": "Flagship", "url": "https://www.amazon.com/s?k=Ryzen+7+7800X3D&tag=fpscalc-20"},
    {"name": "Intel Core i9-13900K",         "category": "CPU", "description": "Intel powerhouse. Blazing fast for gaming and workloads.",      "price": "$549",   "tier": "Flagship", "url": "https://www.amazon.com/s?k=Intel+i9-13900K&tag=fpscalc-20"},
    {"name": "Intel Core i5-13600K",         "category": "CPU", "description": "Best value gaming CPU. Stellar performance per dollar.",        "price": "$299",   "tier": "Mid-Range","url": "https://www.amazon.com/s?k=Intel+i5-13600K&tag=fpscalc-20"},
    {"name": "G.Skill Ripjaws 32GB DDR4",    "category": "RAM", "description": "Top DDR4 kit for AM4 and older Intel platforms.",               "price": "$89",    "tier": "Mid-Range","url": "https://www.amazon.com/s?k=G.Skill+Ripjaws+32GB+DDR4-3600&tag=fpscalc-20"},
    {"name": "G.Skill Trident Z5 32GB DDR5", "category": "RAM", "description": "Premium DDR5 for AM5 and Intel 12th/13th gen platforms.",       "price": "$119",   "tier": "High-End", "url": "https://www.amazon.com/s?k=G.Skill+Trident+Z5+32GB+DDR5-6000&tag=fpscalc-20"},
]


# ===================== CALCULATION HELPERS =====================

def build_gpu_rec(name: str, data: dict) -> dict:
    return {
        "name": name, "score": data["score"], "tier": data["tier"],
        "vram": data["vram"], "brand": data["brand"],
        "affiliate_url": f"https://www.amazon.com/s?k={name.replace(' ', '+')}&tag=fpscalc-20",
    }

def build_cpu_rec(name: str, data: dict) -> dict:
    return {
        "name": name, "score": data["score"], "tier": data["tier"], "brand": data["brand"],
        "affiliate_url": f"https://www.amazon.com/s?k={name.replace(' ', '+')}&tag=fpscalc-20",
    }


def get_bottleneck(cpu_score: int, gpu_score: int, cpu_name: str, gpu_name: str) -> dict:
    diff = gpu_score - cpu_score
    threshold = 15

    # Raw dual-sided percentages (no threshold, for the visual meter)
    cpu_pct = min(100, max(0, round(max(0, diff) * 1.15)))
    gpu_pct = min(100, max(0, round(max(0, -diff) * 1.15)))

    if diff > threshold:
        severity = min(int((diff - threshold) / 0.7), 100)
        fps_penalty = min(severity / 100 * 0.20, 0.20)
        return {
            "type": "CPU", "severity": severity, "fps_penalty": fps_penalty,
            "cpu_bottleneck_pct": cpu_pct, "gpu_bottleneck_pct": 0,
            "message": f"{cpu_name} is bottlenecking your {gpu_name}.",
            "detail": f"CPU score ({cpu_score}) is {diff} pts below GPU score ({gpu_score}). You're leaving GPU performance unused.",
        }
    elif diff < -threshold:
        severity = min(int((-diff - threshold) / 0.7), 100)
        return {
            "type": "GPU", "severity": severity, "fps_penalty": 0.0,
            "cpu_bottleneck_pct": 0, "gpu_bottleneck_pct": gpu_pct,
            "message": f"{gpu_name} is limiting your {cpu_name}'s potential.",
            "detail": f"GPU score ({gpu_score}) is {-diff} pts below CPU score ({cpu_score}). Upgrading GPU will increase FPS significantly.",
        }
    else:
        return {
            "type": "Balanced", "severity": 0, "fps_penalty": 0.0,
            "cpu_bottleneck_pct": cpu_pct, "gpu_bottleneck_pct": gpu_pct,
            "message": "Your build is well balanced!",
            "detail": f"CPU ({cpu_score}) and GPU ({gpu_score}) scores are well matched for optimal gaming performance.",
        }


def get_upgrades(cpu_name: str, gpu_name: str, ram: str, cpu_score: int, gpu_score: int) -> list:
    upgrades = []
    if cpu_score < 70:
        upgrades.append({
            "component": "CPU", "priority": "High",
            "reason": "Your CPU is limiting FPS. A modern CPU will significantly boost performance and reduce stutters.",
            "suggestions": ["AMD Ryzen 7 7800X3D", "Intel Core i5-13600K", "AMD Ryzen 5 7600X"],
        })
    elif cpu_score < 82:
        upgrades.append({
            "component": "CPU", "priority": "Medium",
            "reason": "A CPU upgrade improves minimum FPS and 1% lows in demanding titles.",
            "suggestions": ["AMD Ryzen 7 7800X3D", "Intel Core i7-13700K", "AMD Ryzen 9 7950X3D"],
        })
    if gpu_score < 57:
        upgrades.append({
            "component": "GPU", "priority": "High",
            "reason": "Your GPU is the main FPS bottleneck. This upgrade delivers the biggest single improvement.",
            "suggestions": ["NVIDIA RTX 4060 Ti", "AMD RX 7700 XT", "NVIDIA RTX 4070"],
        })
    elif gpu_score < 75:
        upgrades.append({
            "component": "GPU", "priority": "Medium",
            "reason": "A GPU upgrade significantly improves FPS at higher resolutions and quality settings.",
            "suggestions": ["NVIDIA RTX 4070", "AMD RX 7800 XT", "NVIDIA RTX 4070 Super"],
        })
    if ram == "8GB":
        upgrades.append({
            "component": "RAM", "priority": "High",
            "reason": "8GB RAM causes stuttering in modern games. Upgrade to 16GB or 32GB immediately.",
            "suggestions": ["16GB DDR4-3200", "32GB DDR4-3600", "32GB DDR5-6000"],
        })
    return upgrades


def get_best_gpus(current_gpu: str, current_gpu_score: int) -> dict:
    """Returns comparable, upgrade, and major_upgrade GPU tiers. Never recommends weaker GPUs."""
    gpus_sorted = sorted(GPUS.items(), key=lambda x: x[1]["score"])

    comparable = [
        build_gpu_rec(n, d) for n, d in gpus_sorted
        if abs(d["score"] - current_gpu_score) <= 8 and n != current_gpu
    ][:3]

    upgrade = [
        build_gpu_rec(n, d) for n, d in gpus_sorted
        if 8 < d["score"] - current_gpu_score <= 22
    ][:3]

    major_upgrade = [
        build_gpu_rec(n, d) for n, d in gpus_sorted
        if d["score"] - current_gpu_score > 22
    ][:2]

    return {"comparable": comparable, "upgrade": upgrade, "major_upgrade": major_upgrade}


def get_best_cpus(gpu_score: int, current_cpu: str, current_cpu_score: int) -> dict:
    """Returns comparable and upgrade CPU options matched to GPU tier."""
    target = gpu_score
    cpus_sorted = sorted(CPUS.items(), key=lambda x: x[1]["score"])

    comparable = [
        build_cpu_rec(n, d) for n, d in cpus_sorted
        if abs(d["score"] - target) <= 10 and n != current_cpu
    ][:3]

    upgrade = [
        build_cpu_rec(n, d) for n, d in cpus_sorted
        if d["score"] > current_cpu_score + 5 and n != current_cpu
    ][-3:]  # top 3 above current

    return {"comparable": comparable, "upgrade": upgrade}


# ===================== MODELS =====================
class CalculationRequest(BaseModel):
    cpu: str
    gpu: str
    ram: str
    resolution: str
    game: str


# ===================== ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "FPS Calculator API v2.0"}


@api_router.get("/hardware")
async def get_hardware():
    # Sort by score descending (best hardware first in dropdowns)
    intel = sorted([k for k, v in CPUS.items() if v["brand"] == "Intel"], key=lambda k: -CPUS[k]["score"])
    amd_cpu = sorted([k for k, v in CPUS.items() if v["brand"] == "AMD"], key=lambda k: -CPUS[k]["score"])
    nvidia = sorted([k for k, v in GPUS.items() if v["brand"] == "NVIDIA"], key=lambda k: -GPUS[k]["score"])
    amd_gpu = sorted([k for k, v in GPUS.items() if v["brand"] == "AMD"], key=lambda k: -GPUS[k]["score"])
    return {
        "cpus": {"Intel": intel, "AMD": amd_cpu},
        "gpus": {"NVIDIA": nvidia, "AMD": amd_gpu},
        "rams": list(RAM_MULTIPLIERS.keys()),
        "resolutions": list(RESOLUTION_MULTIPLIERS.keys()),
        "games": list(GAMES.keys()),
    }


@api_router.post("/calculate")
async def calculate_fps(req: CalculationRequest):
    cpu = CPUS.get(req.cpu)
    gpu = GPUS.get(req.gpu)
    game = GAMES.get(req.game)
    if not cpu or not gpu or not game:
        return {"error": "Invalid selection"}

    cpu_score = cpu["score"]
    gpu_score = gpu["score"]
    ram_mult = RAM_MULTIPLIERS.get(req.ram, 1.0)

    # Use per-game 4K multiplier if defined, else default
    res_mult = RESOLUTION_MULTIPLIERS.get(req.resolution, 1.0)
    if req.resolution == "4K" and "res_4k_mult" in game:
        res_mult = game["res_4k_mult"]

    gpu_weight = game["gpu_weight"]
    cpu_weight = 1 - gpu_weight
    base_fps = game["base_fps"]

    # Normalized to GPU=100 (RTX 4090) and CPU=100 reference
    gpu_factor = gpu_score / 100.0
    cpu_factor = cpu_score / 100.0
    perf_factor = (gpu_factor ** gpu_weight) * (cpu_factor ** cpu_weight)

    bottleneck = get_bottleneck(cpu_score, gpu_score, req.cpu, req.gpu)
    fps_penalty = bottleneck.get("fps_penalty", 0)

    fps = {}
    for quality, q_mult in QUALITY_MULTIPLIERS.items():
        if quality == "Performance" and not game.get("supports_perf_mode", False):
            continue
        raw = base_fps * perf_factor * res_mult * q_mult * ram_mult * (1 - fps_penalty)
        fps[quality] = max(5, round(raw))  # No artificial cap — formula is calibrated

    build_score = round((cpu_score + gpu_score) / 2)
    if build_score < 45:    build_tier = "Budget"
    elif build_score < 65:  build_tier = "Mid-Range"
    elif build_score < 82:  build_tier = "High-End"
    elif build_score < 95:  build_tier = "Enthusiast"
    else:                   build_tier = "Flagship"

    await db.calculations.insert_one({
        "id": str(uuid.uuid4()), "cpu": req.cpu, "gpu": req.gpu, "ram": req.ram,
        "resolution": req.resolution, "game": req.game, "fps": fps,
        "build_score": build_score, "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "fps": fps,
        "cpu_score": cpu_score, "gpu_score": gpu_score,
        "build_score": build_score, "build_tier": build_tier,
        "bottleneck": bottleneck,
        "upgrades": get_upgrades(req.cpu, req.gpu, req.ram, cpu_score, gpu_score),
        "best_gpus": get_best_gpus(req.gpu, gpu_score),
        "best_cpus": get_best_cpus(gpu_score, req.cpu, cpu_score),
        "product_cards": PRODUCT_CARDS,
        "supports_perf_mode": game.get("supports_perf_mode", False),
        "build_summary": {
            "cpu": req.cpu, "gpu": req.gpu, "ram": req.ram,
            "resolution": req.resolution, "game": req.game,
            "cpu_tier": cpu["tier"], "gpu_tier": gpu["tier"],
            "gpu_vram": gpu["vram"],
        },
    }


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"], allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

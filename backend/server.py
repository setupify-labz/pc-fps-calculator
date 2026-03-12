from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
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

CPUS = {
    # Intel 9th Gen
    "Intel Core i5-9600K": {"score": 62, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-9700K": {"score": 68, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i9-9900K": {"score": 74, "tier": "High-End", "brand": "Intel"},
    # Intel 10th Gen
    "Intel Core i5-10400F": {"score": 65, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-10600K": {"score": 68, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-10700K": {"score": 73, "tier": "High-End", "brand": "Intel"},
    # Intel 12th Gen
    "Intel Core i5-12400F": {"score": 76, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-12600K": {"score": 80, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-12700K": {"score": 87, "tier": "High-End", "brand": "Intel"},
    "Intel Core i9-12900K": {"score": 92, "tier": "Flagship", "brand": "Intel"},
    # Intel 13th Gen
    "Intel Core i5-13400F": {"score": 79, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i5-13600K": {"score": 85, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-13700K": {"score": 90, "tier": "High-End", "brand": "Intel"},
    "Intel Core i9-13900K": {"score": 97, "tier": "Flagship", "brand": "Intel"},
    # Intel 14th Gen
    "Intel Core i5-14600K": {"score": 86, "tier": "Mid-Range", "brand": "Intel"},
    "Intel Core i7-14700K": {"score": 91, "tier": "High-End", "brand": "Intel"},
    "Intel Core i9-14900K": {"score": 96, "tier": "Flagship", "brand": "Intel"},
    # AMD Ryzen 3000
    "AMD Ryzen 5 3600": {"score": 60, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 3700X": {"score": 65, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 9 3900X": {"score": 72, "tier": "High-End", "brand": "AMD"},
    # AMD Ryzen 5000
    "AMD Ryzen 5 5600": {"score": 74, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 5 5600X": {"score": 77, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 5800X": {"score": 82, "tier": "High-End", "brand": "AMD"},
    "AMD Ryzen 7 5800X3D": {"score": 93, "tier": "High-End", "brand": "AMD"},
    "AMD Ryzen 9 5900X": {"score": 88, "tier": "Flagship", "brand": "AMD"},
    "AMD Ryzen 9 5950X": {"score": 90, "tier": "Flagship", "brand": "AMD"},
    # AMD Ryzen 7000
    "AMD Ryzen 5 7600": {"score": 84, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 5 7600X": {"score": 85, "tier": "Mid-Range", "brand": "AMD"},
    "AMD Ryzen 7 7700X": {"score": 88, "tier": "High-End", "brand": "AMD"},
    "AMD Ryzen 7 7800X3D": {"score": 98, "tier": "Flagship", "brand": "AMD"},
    "AMD Ryzen 9 7900X": {"score": 92, "tier": "Flagship", "brand": "AMD"},
    "AMD Ryzen 9 7950X": {"score": 95, "tier": "Flagship", "brand": "AMD"},
    "AMD Ryzen 9 7950X3D": {"score": 99, "tier": "Flagship", "brand": "AMD"},
}

GPUS = {
    # NVIDIA GTX Series
    "NVIDIA GTX 1060 6GB": {"score": 28, "tier": "Budget", "vram": 6, "brand": "NVIDIA"},
    "NVIDIA GTX 1070": {"score": 34, "tier": "Budget", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA GTX 1080 Ti": {"score": 44, "tier": "Mid-Range", "vram": 11, "brand": "NVIDIA"},
    "NVIDIA GTX 1650": {"score": 26, "tier": "Budget", "vram": 4, "brand": "NVIDIA"},
    "NVIDIA GTX 1650 Super": {"score": 33, "tier": "Budget", "vram": 4, "brand": "NVIDIA"},
    "NVIDIA GTX 1660": {"score": 35, "tier": "Budget", "vram": 6, "brand": "NVIDIA"},
    "NVIDIA GTX 1660 Super": {"score": 40, "tier": "Budget", "vram": 6, "brand": "NVIDIA"},
    "NVIDIA GTX 1660 Ti": {"score": 42, "tier": "Budget", "vram": 6, "brand": "NVIDIA"},
    # NVIDIA RTX 2000
    "NVIDIA RTX 2060": {"score": 49, "tier": "Mid-Range", "vram": 6, "brand": "NVIDIA"},
    "NVIDIA RTX 2060 Super": {"score": 54, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 2070": {"score": 57, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 2070 Super": {"score": 62, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 2080 Super": {"score": 69, "tier": "High-End", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 2080 Ti": {"score": 74, "tier": "High-End", "vram": 11, "brand": "NVIDIA"},
    # NVIDIA RTX 3000
    "NVIDIA RTX 3060": {"score": 57, "tier": "Mid-Range", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 3060 Ti": {"score": 67, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 3070": {"score": 74, "tier": "High-End", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 3070 Ti": {"score": 77, "tier": "High-End", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 3080": {"score": 85, "tier": "High-End", "vram": 10, "brand": "NVIDIA"},
    "NVIDIA RTX 3080 Ti": {"score": 90, "tier": "Flagship", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 3090": {"score": 92, "tier": "Flagship", "vram": 24, "brand": "NVIDIA"},
    # NVIDIA RTX 4000
    "NVIDIA RTX 4060": {"score": 63, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 4060 Ti": {"score": 72, "tier": "Mid-Range", "vram": 8, "brand": "NVIDIA"},
    "NVIDIA RTX 4070": {"score": 80, "tier": "High-End", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Super": {"score": 84, "tier": "High-End", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Ti": {"score": 88, "tier": "High-End", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 4070 Ti Super": {"score": 91, "tier": "High-End", "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4080": {"score": 94, "tier": "Flagship", "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4080 Super": {"score": 96, "tier": "Flagship", "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 4090": {"score": 100, "tier": "Flagship", "vram": 24, "brand": "NVIDIA"},
    # NVIDIA RTX 5000
    "NVIDIA RTX 5070": {"score": 90, "tier": "High-End", "vram": 12, "brand": "NVIDIA"},
    "NVIDIA RTX 5070 Ti": {"score": 95, "tier": "Flagship", "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 5080": {"score": 98, "tier": "Flagship", "vram": 16, "brand": "NVIDIA"},
    "NVIDIA RTX 5090": {"score": 112, "tier": "Flagship", "vram": 32, "brand": "NVIDIA"},
    # AMD RX 5000
    "AMD RX 5600 XT": {"score": 41, "tier": "Budget", "vram": 6, "brand": "AMD"},
    "AMD RX 5700": {"score": 46, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    "AMD RX 5700 XT": {"score": 50, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    # AMD RX 6000
    "AMD RX 6600": {"score": 52, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    "AMD RX 6600 XT": {"score": 58, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    "AMD RX 6650 XT": {"score": 60, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    "AMD RX 6700": {"score": 62, "tier": "Mid-Range", "vram": 10, "brand": "AMD"},
    "AMD RX 6700 XT": {"score": 65, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 6750 XT": {"score": 67, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 6800": {"score": 72, "tier": "High-End", "vram": 16, "brand": "AMD"},
    "AMD RX 6800 XT": {"score": 80, "tier": "High-End", "vram": 16, "brand": "AMD"},
    "AMD RX 6900 XT": {"score": 87, "tier": "Flagship", "vram": 16, "brand": "AMD"},
    "AMD RX 6950 XT": {"score": 90, "tier": "Flagship", "vram": 16, "brand": "AMD"},
    # AMD RX 7000
    "AMD RX 7600": {"score": 58, "tier": "Mid-Range", "vram": 8, "brand": "AMD"},
    "AMD RX 7700 XT": {"score": 68, "tier": "Mid-Range", "vram": 12, "brand": "AMD"},
    "AMD RX 7800 XT": {"score": 76, "tier": "High-End", "vram": 16, "brand": "AMD"},
    "AMD RX 7900 GRE": {"score": 82, "tier": "High-End", "vram": 16, "brand": "AMD"},
    "AMD RX 7900 XT": {"score": 88, "tier": "Flagship", "vram": 20, "brand": "AMD"},
    "AMD RX 7900 XTX": {"score": 93, "tier": "Flagship", "vram": 24, "brand": "AMD"},
    "AMD RX 9070": {"score": 82, "tier": "High-End", "vram": 16, "brand": "AMD"},
    "AMD RX 9070 XT": {"score": 86, "tier": "High-End", "vram": 16, "brand": "AMD"},
}

# base_fps: expected at GPU=50, CPU=50, 16GB RAM, 1080p, Medium quality
GAMES = {
    "Fortnite":                  {"base_fps": 120, "gpu_weight": 0.75},
    "Call of Duty: Warzone":     {"base_fps": 85,  "gpu_weight": 0.80},
    "Minecraft":                 {"base_fps": 200, "gpu_weight": 0.50},
    "GTA V":                     {"base_fps": 100, "gpu_weight": 0.75},
    "Valorant":                  {"base_fps": 220, "gpu_weight": 0.60},
    "CS2":                       {"base_fps": 180, "gpu_weight": 0.62},
    "Apex Legends":              {"base_fps": 140, "gpu_weight": 0.70},
    "Cyberpunk 2077":            {"base_fps": 80,  "gpu_weight": 0.90},
    "Elden Ring":                {"base_fps": 65,  "gpu_weight": 0.82},
    "Red Dead Redemption 2":     {"base_fps": 60,  "gpu_weight": 0.85},
    "Rainbow Six Siege":         {"base_fps": 200, "gpu_weight": 0.65},
    "PUBG":                      {"base_fps": 80,  "gpu_weight": 0.78},
    "Overwatch 2":               {"base_fps": 150, "gpu_weight": 0.65},
    "Rocket League":             {"base_fps": 240, "gpu_weight": 0.55},
    "League of Legends":         {"base_fps": 200, "gpu_weight": 0.55},
    "Dota 2":                    {"base_fps": 160, "gpu_weight": 0.60},
}

RAM_MULTIPLIERS = {"8GB": 0.82, "16GB": 1.0, "32GB": 1.04, "64GB": 1.05}
RESOLUTION_MULTIPLIERS = {"1080p": 1.0, "1440p": 0.60, "4K": 0.40}
QUALITY_MULTIPLIERS = {"Low": 1.55, "Medium": 1.0, "High": 0.78, "Ultra": 0.62}

PRODUCT_CARDS = [
    {"name": "NVIDIA RTX 4070",              "category": "GPU", "description": "Best 1440p GPU. Excellent performance-per-watt.",       "price": "$549", "tier": "High-End", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4070&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 4070 Super",        "category": "GPU", "description": "Boosted RTX 4070. Dominates 1440p gaming.",             "price": "$599", "tier": "High-End", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4070+Super&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 4080",              "category": "GPU", "description": "Flagship 4K GPU with incredible ray tracing.",          "price": "$999", "tier": "Flagship", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+4080&tag=fpscalc-20"},
    {"name": "AMD RX 7800 XT",               "category": "GPU", "description": "Best value high-end GPU. Great 1440p performance.",    "price": "$499", "tier": "High-End", "url": "https://www.amazon.com/s?k=AMD+RX+7800+XT&tag=fpscalc-20"},
    {"name": "AMD RX 7900 XTX",              "category": "GPU", "description": "AMD flagship. 24GB VRAM for demanding titles.",         "price": "$749", "tier": "Flagship", "url": "https://www.amazon.com/s?k=AMD+RX+7900+XTX&tag=fpscalc-20"},
    {"name": "NVIDIA RTX 5080",              "category": "GPU", "description": "Next-gen Blackwell. Blisteringly fast at 4K.",          "price": "$999", "tier": "Flagship", "url": "https://www.amazon.com/s?k=NVIDIA+RTX+5080&tag=fpscalc-20"},
    {"name": "AMD Ryzen 7 7800X3D",          "category": "CPU", "description": "The #1 gaming CPU with 3D V-Cache technology.",         "price": "$449", "tier": "Flagship", "url": "https://www.amazon.com/s?k=Ryzen+7+7800X3D&tag=fpscalc-20"},
    {"name": "Intel Core i5-13600K",         "category": "CPU", "description": "Best value gaming CPU. Stellar single-core perf.",     "price": "$299", "tier": "Mid-Range", "url": "https://www.amazon.com/s?k=Intel+i5-13600K&tag=fpscalc-20"},
    {"name": "Intel Core i7-13700K",         "category": "CPU", "description": "High-end powerhouse for gaming and streaming.",        "price": "$409", "tier": "High-End", "url": "https://www.amazon.com/s?k=Intel+i7-13700K&tag=fpscalc-20"},
    {"name": "AMD Ryzen 5 7600X",            "category": "CPU", "description": "Fast AM5 entry. Great competitive gaming.",            "price": "$229", "tier": "Mid-Range", "url": "https://www.amazon.com/s?k=Ryzen+5+7600X&tag=fpscalc-20"},
    {"name": "G.Skill Ripjaws 32GB DDR4",    "category": "RAM", "description": "Top DDR4 kit for AM4 and older Intel builds.",         "price": "$89",  "tier": "Mid-Range", "url": "https://www.amazon.com/s?k=G.Skill+Ripjaws+32GB+DDR4-3600&tag=fpscalc-20"},
    {"name": "G.Skill Trident Z5 32GB DDR5", "category": "RAM", "description": "Premium DDR5 for AM5 and modern Intel builds.",        "price": "$119", "tier": "High-End", "url": "https://www.amazon.com/s?k=G.Skill+Trident+Z5+32GB+DDR5-6000&tag=fpscalc-20"},
]


# ===================== CALCULATION HELPERS =====================

def get_bottleneck(cpu_score: int, gpu_score: int, cpu_name: str, gpu_name: str) -> dict:
    diff = gpu_score - cpu_score
    threshold = 15

    if diff > threshold:
        severity = min(int((diff - threshold) / 0.7), 100)
        fps_penalty = min(severity / 100 * 0.22, 0.22)
        return {
            "type": "CPU",
            "severity": severity,
            "fps_penalty": fps_penalty,
            "message": f"{cpu_name} is bottlenecking your {gpu_name}.",
            "detail": f"CPU score ({cpu_score}) is {diff} pts below GPU score ({gpu_score}). You're leaving GPU performance on the table.",
        }
    elif diff < -threshold:
        severity = min(int((-diff - threshold) / 0.7), 100)
        return {
            "type": "GPU",
            "severity": severity,
            "fps_penalty": 0.0,
            "message": f"{gpu_name} is limiting your {cpu_name}'s potential.",
            "detail": f"GPU score ({gpu_score}) is {-diff} pts below CPU score ({cpu_score}). Upgrade GPU for higher FPS and better visuals.",
        }
    else:
        return {
            "type": "Balanced",
            "severity": 0,
            "fps_penalty": 0.0,
            "message": "Your build is well balanced!",
            "detail": f"CPU ({cpu_score}) and GPU ({gpu_score}) scores are well matched for optimal gaming performance.",
        }


def get_upgrades(cpu_name: str, gpu_name: str, ram: str, cpu_score: int, gpu_score: int) -> list:
    upgrades = []

    if cpu_score < 70:
        upgrades.append({
            "component": "CPU", "priority": "High",
            "reason": "Your CPU is limiting gaming performance. A modern CPU will significantly boost FPS and reduce stutters.",
            "suggestions": ["AMD Ryzen 7 7800X3D", "Intel Core i5-13600K", "AMD Ryzen 5 7600X"],
        })
    elif cpu_score < 82:
        upgrades.append({
            "component": "CPU", "priority": "Medium",
            "reason": "A CPU upgrade would improve minimum FPS and 1% lows in demanding titles.",
            "suggestions": ["AMD Ryzen 7 7800X3D", "Intel Core i7-13700K", "AMD Ryzen 5 7600X"],
        })

    if gpu_score < 57:
        upgrades.append({
            "component": "GPU", "priority": "High",
            "reason": "Your GPU is the main FPS bottleneck. Upgrading delivers the biggest single improvement.",
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


def get_best_gpus(cpu_score: int, current_gpu: str) -> list:
    target = cpu_score
    sorted_gpus = sorted(GPUS.items(), key=lambda x: x[1]["score"])
    candidates = [(n, d) for n, d in sorted_gpus if abs(d["score"] - target) <= 18 and n != current_gpu]
    if len(candidates) < 2:
        candidates = sorted([(n, d) for n, d in sorted_gpus if n != current_gpu], key=lambda x: abs(x[1]["score"] - target))[:4]
    return [
        {"name": n, "score": d["score"], "tier": d["tier"], "vram": d["vram"], "brand": d["brand"],
         "affiliate_url": f"https://www.amazon.com/s?k={n.replace(' ', '+')}&tag=fpscalc-20"}
        for n, d in candidates[:4]
    ]


def get_best_cpus(gpu_score: int, current_cpu: str) -> list:
    target = gpu_score
    sorted_cpus = sorted(CPUS.items(), key=lambda x: x[1]["score"])
    candidates = [(n, d) for n, d in sorted_cpus if abs(d["score"] - target) <= 18 and n != current_cpu]
    if len(candidates) < 2:
        candidates = sorted([(n, d) for n, d in sorted_cpus if n != current_cpu], key=lambda x: abs(x[1]["score"] - target))[:4]
    return [
        {"name": n, "score": d["score"], "tier": d["tier"], "brand": d["brand"],
         "affiliate_url": f"https://www.amazon.com/s?k={n.replace(' ', '+')}&tag=fpscalc-20"}
        for n, d in candidates[:4]
    ]


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
    return {"message": "FPS Calculator API v1.0"}


@api_router.get("/hardware")
async def get_hardware():
    return {
        "cpus": {
            "Intel": [k for k, v in CPUS.items() if v["brand"] == "Intel"],
            "AMD": [k for k, v in CPUS.items() if v["brand"] == "AMD"],
        },
        "gpus": {
            "NVIDIA": [k for k, v in GPUS.items() if v["brand"] == "NVIDIA"],
            "AMD": [k for k, v in GPUS.items() if v["brand"] == "AMD"],
        },
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
    gpu_score = min(gpu["score"], 110)
    ram_mult = RAM_MULTIPLIERS.get(req.ram, 1.0)
    res_mult = RESOLUTION_MULTIPLIERS.get(req.resolution, 1.0)

    gpu_weight = game["gpu_weight"]
    cpu_weight = 1 - gpu_weight
    base_fps = game["base_fps"]

    gpu_factor = gpu_score / 50
    cpu_factor = cpu_score / 50
    perf_factor = (gpu_factor ** gpu_weight) * (cpu_factor ** cpu_weight)

    bottleneck = get_bottleneck(cpu_score, gpu["score"], req.cpu, req.gpu)
    fps_penalty = bottleneck.get("fps_penalty", 0)

    fps = {}
    for quality, q_mult in QUALITY_MULTIPLIERS.items():
        raw = base_fps * perf_factor * res_mult * q_mult * ram_mult * (1 - fps_penalty)
        fps[quality] = min(360, max(5, round(raw)))

    # Overall build score
    build_score = round((cpu_score + gpu["score"]) / 2)
    if build_score < 45:
        build_tier = "Budget"
    elif build_score < 65:
        build_tier = "Mid-Range"
    elif build_score < 82:
        build_tier = "High-End"
    elif build_score < 93:
        build_tier = "Enthusiast"
    else:
        build_tier = "Flagship"

    # Save calculation
    doc = {
        "id": str(uuid.uuid4()),
        "cpu": req.cpu, "gpu": req.gpu, "ram": req.ram,
        "resolution": req.resolution, "game": req.game,
        "fps": fps, "build_score": build_score,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.calculations.insert_one(doc)

    return {
        "fps": fps,
        "cpu_score": cpu_score,
        "gpu_score": gpu["score"],
        "build_score": build_score,
        "build_tier": build_tier,
        "bottleneck": bottleneck,
        "upgrades": get_upgrades(req.cpu, req.gpu, req.ram, cpu_score, gpu["score"]),
        "best_gpus": get_best_gpus(cpu_score, req.gpu),
        "best_cpus": get_best_cpus(gpu["score"], req.cpu),
        "product_cards": PRODUCT_CARDS,
        "build_summary": {
            "cpu": req.cpu, "gpu": req.gpu, "ram": req.ram,
            "resolution": req.resolution, "game": req.game,
            "cpu_tier": cpu["tier"], "gpu_tier": gpu["tier"],
            "gpu_vram": gpu["vram"],
        },
    }


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

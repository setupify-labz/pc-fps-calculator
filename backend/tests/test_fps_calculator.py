"""Backend tests for FPS Calculator API"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHardwareAPI:
    """Test /api/hardware endpoint"""

    def test_hardware_returns_200(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        assert r.status_code == 200

    def test_hardware_has_cpus_gpus_rams(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "cpus" in data
        assert "gpus" in data
        assert "rams" in data
        assert "resolutions" in data
        assert "games" in data

    def test_cpus_have_intel_and_amd(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "Intel" in data["cpus"]
        assert "AMD" in data["cpus"]
        assert len(data["cpus"]["Intel"]) >= 5
        assert len(data["cpus"]["AMD"]) >= 5

    def test_gpus_have_nvidia_and_amd(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "NVIDIA" in data["gpus"]
        assert "AMD" in data["gpus"]
        assert len(data["gpus"]["NVIDIA"]) >= 5
        assert len(data["gpus"]["AMD"]) >= 5

    def test_rams_options(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "8GB" in data["rams"]
        assert "16GB" in data["rams"]
        assert "32GB" in data["rams"]
        assert "64GB" in data["rams"]

    def test_games_has_16_games(self):
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert len(data["games"]) >= 16
        assert "Fortnite" in data["games"]
        assert "Cyberpunk 2077" in data["games"]
        assert "Valorant" in data["games"]


class TestCalculateAPI:
    """Test /api/calculate endpoint"""

    DEFAULT_PAYLOAD = {
        "cpu": "Intel Core i5-9600K",
        "gpu": "NVIDIA GTX 1060 6GB",
        "ram": "16GB",
        "resolution": "1080p",
        "game": "Fortnite"
    }

    def test_calculate_returns_200(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        assert r.status_code == 200

    def test_calculate_returns_fps_4_qualities(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "fps" in data
        for q in ["Low", "Medium", "High", "Ultra"]:
            assert q in data["fps"], f"Missing quality: {q}"
            assert data["fps"][q] > 0

    def test_calculate_returns_bottleneck(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "bottleneck" in data
        assert "type" in data["bottleneck"]
        assert "severity" in data["bottleneck"]
        assert data["bottleneck"]["type"] in ["CPU", "GPU", "Balanced"]

    def test_calculate_returns_upgrades(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "upgrades" in data
        assert isinstance(data["upgrades"], list)

    def test_calculate_returns_best_gpus_cpus(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "best_gpus" in data
        assert "best_cpus" in data
        assert len(data["best_gpus"]) > 0
        assert len(data["best_cpus"]) > 0

    def test_calculate_returns_product_cards(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "product_cards" in data
        assert len(data["product_cards"]) > 0
        for card in data["product_cards"]:
            assert "name" in card
            assert "category" in card
            assert card["url"].startswith("https://")

    def test_build_tier_returned(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "build_tier" in data
        assert data["build_tier"] in ["Budget", "Mid-Range", "High-End", "Enthusiast", "Flagship"]

    def test_cpu_bottleneck_scenario(self):
        """GTX 1060 6GB (score 28) + Ryzen 7 7800X3D (score 98) -> GPU bottleneck (GPU score << CPU score)"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "AMD Ryzen 7 7800X3D",
            "gpu": "NVIDIA GTX 1060 6GB",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Fortnite"
        })
        data = r.json()
        assert data["bottleneck"]["type"] == "GPU", f"Expected GPU bottleneck, got {data['bottleneck']['type']}"

    def test_gpu_bottleneck_scenario(self):
        """RTX 4090 (score 100) + Ryzen 5 3600 (score 60) -> CPU bottleneck"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "AMD Ryzen 5 3600",
            "gpu": "NVIDIA RTX 4090",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Fortnite"
        })
        data = r.json()
        assert data["bottleneck"]["type"] == "CPU", f"Expected CPU bottleneck, got {data['bottleneck']['type']}"

    def test_balanced_build_scenario(self):
        """i5-13600K (score 85) + RTX 4070 (score 80) -> Balanced"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "Intel Core i5-13600K",
            "gpu": "NVIDIA RTX 4070",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Fortnite"
        })
        data = r.json()
        # Diff is 80-85 = -5, within threshold of 15, should be Balanced
        assert data["bottleneck"]["type"] == "Balanced", f"Expected Balanced, got {data['bottleneck']['type']}"

    def test_invalid_cpu_returns_error(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "InvalidCPU",
            "gpu": "NVIDIA GTX 1060 6GB",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Fortnite"
        })
        data = r.json()
        assert "error" in data

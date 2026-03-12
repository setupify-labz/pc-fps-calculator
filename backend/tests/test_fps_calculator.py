"""Backend tests for FPS Calculator API - Updated for 81 games and category grouping"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHardwareAPI:
    """Test /api/hardware endpoint with 81 games and 10 categories"""

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

    # ========== NEW TESTS: 81 games + categories ==========

    def test_games_has_81_games(self):
        """Verify we now have 81 games total"""
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert len(data["games"]) == 81, f"Expected 81 games, got {len(data['games'])}"
        # Sample games from different categories
        assert "Fortnite" in data["games"]  # Competitive / Esports
        assert "Cyberpunk 2077" in data["games"]  # Open World / AAA
        assert "Baldur's Gate 3" in data["games"]  # Action RPG
        assert "Helldivers 2" in data["games"]  # Multiplayer / Co-op
        assert "Microsoft Flight Simulator" in data["games"]  # Simulation

    def test_hardware_returns_game_categories(self):
        """Verify game_categories array with 10 categories"""
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "game_categories" in data
        assert len(data["game_categories"]) == 10
        expected_categories = [
            "Competitive / Esports",
            "Open World / AAA",
            "Action RPG",
            "Racing",
            "Sandbox / Creative",
            "Strategy",
            "Simulation",
            "Horror / Survival",
            "MMO",
            "Multiplayer / Co-op",
        ]
        for cat in expected_categories:
            assert cat in data["game_categories"], f"Missing category: {cat}"

    def test_hardware_returns_games_by_category(self):
        """Verify games_by_category dict with all 10 categories"""
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        assert "games_by_category" in data
        gbc = data["games_by_category"]
        assert len(gbc) == 10, f"Expected 10 categories, got {len(gbc)}"
        
        # Verify each category has games
        for cat in data["game_categories"]:
            assert cat in gbc, f"Missing category in games_by_category: {cat}"
            assert len(gbc[cat]) > 0, f"Category {cat} is empty"

    def test_games_by_category_competitive_esports(self):
        """Verify Competitive / Esports has expected games"""
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        comp_games = data["games_by_category"].get("Competitive / Esports", [])
        # Should have 17 games based on server.py
        assert "Fortnite" in comp_games
        assert "Valorant" in comp_games
        assert "CS2" in comp_games
        assert "Call of Duty: Warzone" in comp_games
        assert "The Finals" in comp_games
        assert len(comp_games) >= 10

    def test_games_by_category_multiplayer_coop(self):
        """Verify Multiplayer / Co-op category has Helldivers 2"""
        r = requests.get(f"{BASE_URL}/api/hardware")
        data = r.json()
        coop_games = data["games_by_category"].get("Multiplayer / Co-op", [])
        assert "Helldivers 2" in coop_games
        assert "Palworld" in coop_games
        assert "Lethal Company" in coop_games


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

    def test_calculate_fortnite_has_performance_mode(self):
        """Fortnite supports Performance mode"""
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "Performance" in data["fps"], "Fortnite should have Performance mode"
        assert data["supports_perf_mode"] == True

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

    def test_calculate_returns_product_cards_no_price(self):
        """Product cards should have URL but no price field"""
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "product_cards" in data
        assert len(data["product_cards"]) > 0
        for card in data["product_cards"]:
            assert "name" in card
            assert "category" in card
            assert "url" in card
            assert card["url"].startswith("https://www.amazon.com")
            # NO price field in cards
            assert "price" not in card, f"Card {card['name']} should NOT have price field"

    def test_build_tier_returned(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json=self.DEFAULT_PAYLOAD)
        data = r.json()
        assert "build_tier" in data
        assert data["build_tier"] in ["Budget", "Mid-Range", "High-End", "Enthusiast", "Flagship"]

    # ========== NEW GAME TESTS ==========

    def test_calculate_helldivers_2(self):
        """Test calculation with new game: Helldivers 2"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "AMD Ryzen 7 7800X3D",
            "gpu": "NVIDIA RTX 4070",
            "ram": "32GB",
            "resolution": "1440p",
            "game": "Helldivers 2"
        })
        assert r.status_code == 200
        data = r.json()
        assert "fps" in data
        assert "Low" in data["fps"]
        assert "Medium" in data["fps"]
        # Helldivers 2 does not support Performance mode
        assert "Performance" not in data["fps"]
        assert data["fps"]["Medium"] > 50  # Reasonable FPS for this build

    def test_calculate_microsoft_flight_simulator(self):
        """Test calculation with new game: Microsoft Flight Simulator (demanding)"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "Intel Core i9-13900K",
            "gpu": "NVIDIA RTX 4090",
            "ram": "32GB",
            "resolution": "4K",
            "game": "Microsoft Flight Simulator"
        })
        assert r.status_code == 200
        data = r.json()
        assert "fps" in data
        # MSFS should have res_4k_mult of 0.40 for 4K
        # Even with top hardware at 4K, expect lower FPS due to demanding nature
        assert data["fps"]["Medium"] > 30

    def test_calculate_baldurs_gate_3(self):
        """Test calculation with new game: Baldur's Gate 3"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "AMD Ryzen 5 7600X",
            "gpu": "NVIDIA RTX 4060",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Baldur's Gate 3"
        })
        assert r.status_code == 200
        data = r.json()
        assert "fps" in data
        assert data["fps"]["High"] > 50

    def test_calculate_cyberpunk_2077_4k(self):
        """Test Cyberpunk 2077 at 4K with res_4k_mult"""
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "AMD Ryzen 9 7950X3D",
            "gpu": "NVIDIA RTX 5090",
            "ram": "64GB",
            "resolution": "4K",
            "game": "Cyberpunk 2077"
        })
        assert r.status_code == 200
        data = r.json()
        assert "fps" in data
        # Cyberpunk at 4K with best hardware - should have reasonable FPS
        assert data["fps"]["High"] > 40

    # ========== BOTTLENECK SCENARIOS ==========

    def test_cpu_bottleneck_scenario(self):
        """GTX 1060 6GB (score 28) + Ryzen 7 7800X3D (score 98) -> GPU bottleneck"""
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

    def test_invalid_game_returns_error(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "Intel Core i5-9600K",
            "gpu": "NVIDIA GTX 1060 6GB",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "NonExistentGame"
        })
        data = r.json()
        assert "error" in data


class TestProductCards:
    """Test product cards have no price and proper Amazon links"""

    def test_product_cards_structure(self):
        r = requests.post(f"{BASE_URL}/api/calculate", json={
            "cpu": "Intel Core i5-9600K",
            "gpu": "NVIDIA GTX 1060 6GB",
            "ram": "16GB",
            "resolution": "1080p",
            "game": "Fortnite"
        })
        data = r.json()
        cards = data["product_cards"]
        assert len(cards) > 0
        
        for card in cards:
            # Required fields
            assert "name" in card
            assert "category" in card
            assert "description" in card
            assert "tier" in card
            assert "url" in card
            
            # NO price field
            assert "price" not in card
            
            # URL must be Amazon search link
            assert "amazon.com" in card["url"]
            assert "tag=fpscalc-20" in card["url"]


# ========== NEW TESTS: History API ==========

class TestHistoryAPI:
    """Test /api/history endpoint for FPS History chart feature"""

    def test_history_returns_200(self):
        """Verify /api/history endpoint returns 200"""
        r = requests.get(f"{BASE_URL}/api/history")
        assert r.status_code == 200

    def test_history_returns_history_array(self):
        """Verify response contains history array"""
        r = requests.get(f"{BASE_URL}/api/history")
        data = r.json()
        assert "history" in data
        assert isinstance(data["history"], list)

    def test_history_limit_parameter(self):
        """Verify limit parameter works"""
        r = requests.get(f"{BASE_URL}/api/history?limit=5")
        data = r.json()
        assert "history" in data
        assert len(data["history"]) <= 5

    def test_history_entry_structure(self):
        """Verify each history entry has required fields"""
        r = requests.get(f"{BASE_URL}/api/history?limit=5")
        data = r.json()
        if len(data["history"]) > 0:
            entry = data["history"][0]
            # Required fields for HistoryChart component
            assert "cpu" in entry
            assert "gpu" in entry
            assert "ram" in entry
            assert "resolution" in entry
            assert "game" in entry
            assert "fps" in entry
            assert "build_score" in entry
            assert "timestamp" in entry
            # fps should have quality levels
            assert "Medium" in entry["fps"] or "Low" in entry["fps"]

    def test_history_sorted_by_timestamp_desc(self):
        """Verify history is sorted by timestamp descending (newest first)"""
        r = requests.get(f"{BASE_URL}/api/history?limit=10")
        data = r.json()
        if len(data["history"]) >= 2:
            # First entry should have more recent timestamp than second
            first_ts = data["history"][0]["timestamp"]
            second_ts = data["history"][1]["timestamp"]
            assert first_ts >= second_ts, "History should be sorted by timestamp descending"

    def test_history_no_mongodb_id(self):
        """Verify _id field from MongoDB is excluded"""
        r = requests.get(f"{BASE_URL}/api/history?limit=5")
        data = r.json()
        for entry in data["history"]:
            assert "_id" not in entry, "MongoDB _id should be excluded"

import requests
import json
import time
import random
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Diverse search keywords to avoid duplicate results
KEYWORDS = [
    "marble texture", "ancient column", "stone carving", "golden light",
    "clouds sky", "ocean waves", "mountain landscape", "forest mist",
    "candle light", "book pages", "old manuscript", "parchment scroll",
    "night stars", "sunrise dawn", "autumn leaves", "winter frost",
    "river flowing", "garden flowers", "wind sculpture", "rain drops",
    "sand dunes", "clay pottery", "bronze metal", "silver surface",
    "dark shadow", "bright beam", "warm glow", "cool breeze",
    "earth tones", "blue gradient", "green moss", "red sunset",
    "white marble", "black obsidian", "amber resin", "copper patina",
    "ivory bone", "jade stone", "crystal clear", "fog morning",
    "dew drops", "spider web", "leaf veins", "bark texture",
    "wave foam", "coral reef", "pebble shore", "drift wood",
    "flame fire", "smoke wisps", "dust particles", "light rays",
    "geometric pattern", "organic shape", "spiral form", "wave pattern",
    "mosaic tile", "fresco wall", "painted surface", "sketch lines",
    "ink wash", "watercolor blend", "oil painting", "charcoal drawing",
    "mosaic pattern", "textile weave", "rope fiber", "thread detail",
    "glass surface", "mirror reflection", "prism light", "rainbow arc",
    "cave interior", "canyon wall", "cliff face", "volcanic rock",
    "desert oasis", "tropical palm", "bamboo grove", "cedar bark",
    "pine needle", "oak leaf", "vine tendril", "fern frond",
    "lily pad", "lotus flower", "rose petal", "lavender field",
    "wheat field", "rice paddy", "corn husk", "cotton boll",
    "seashell spiral", "starfish arm", "jellyfish bell", "coral branch",
    "eagle wing", "owl eye", "dolphin fin", "whale tail",
    "fox fur", "deer antler", "butterfly wing", "dragonfly body",
    "bee honeycomb", "ant trail", "snail shell", "spider silk"
]

def get_image(query):
    """Get an image from Unsplash with retry"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape"
    }
    
    for attempt in range(3):  # 3 retries
        try:
            response = requests.get(f"{BASE_URL}/search/photos", headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data["results"]:
                    return data["results"][0]["urls"]["regular"]
            elif response.status_code == 429:
                print("Rate limited!")
                return None
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    
    return None

# Get quotes with duplicate images
result = db.all("""
    SELECT q.id, q.image_url
    FROM quotes q
    INNER JOIN (
        SELECT image_url, COUNT(*) as cnt
        FROM quotes
        WHERE image_url IS NOT NULL
        GROUP BY image_url
        HAVING COUNT(*) > 1
    ) d ON q.image_url = d.image_url
    ORDER BY RANDOM()
    LIMIT 30
""")

print(f"Processing {len(result)} quotes...")

updated = 0
for r in result:
    # Pick a random keyword to ensure diverse results
    keyword = random.choice(KEYWORDS)
    print(f"  {r.id} ({keyword}): ", end="")
    
    image_url = get_image(keyword)
    if image_url:
        # Verify it's not already in use
        existing = db.one("SELECT id FROM quotes WHERE image_url = %s AND id != %s", [image_url, r.id])
        if existing:
            print("DUP, retry...")
            time.sleep(1)
            keyword = random.choice(KEYWORDS)
            image_url = get_image(keyword)
            if image_url:
                db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, r.id])
                updated += 1
                print("OK")
            else:
                print("SKIP")
        else:
            db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, r.id])
            updated += 1
            print("OK")
    else:
        print("SKIP")
    
    time.sleep(1)

print(f"\nDone! Updated: {updated}")

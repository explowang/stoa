import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Track used image IDs
used_images = set()

def get_unique_image(query, attempt=0):
    """Get a unique image from Unsplash"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": 30,
        "orientation": "landscape",
        "page": (attempt // 30) + 1
    }
    
    try:
        response = requests.get(f"{BASE_URL}/search/photos", headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            # Try to find an unused image
            start_idx = attempt % 30
            for photo in data["results"][start_idx:]:
                if photo["id"] not in used_images:
                    used_images.add(photo["id"])
                    return photo["urls"]["regular"]
        elif response.status_code == 429:
            print("Rate limited, waiting 60 seconds...")
            time.sleep(60)
            return get_unique_image(query, attempt)
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Get all quotes
quotes = db.all("SELECT id FROM quotes")
print(f"Found {len(quotes)} quotes")

# Process each quote with unique search terms
updated = 0

for i, quote in enumerate(quotes):
    # Create unique search term for each quote
    search_terms = [
        f"abstract texture {i}",
        f"abstract pattern {i}",
        f"abstract color {i}",
        f"abstract shape {i}",
        f"abstract light {i}",
    ]
    
    keyword = search_terms[i % len(search_terms)]
    attempt = i
    
    print(f"  [{i+1}/{len(quotes)}] Searching for: {keyword}")
    image_url = get_unique_image(keyword, attempt)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, quote])
        updated += 1
        print(f"    -> Found unique image")
    else:
        print(f"    -> No image found")
    
    # Rate limiting
    time.sleep(1.2)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")
print(f"Total unique images: {len(used_images)}")

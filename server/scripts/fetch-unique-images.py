import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Track used image IDs to avoid duplicates
used_images = set()

def search_unique_image(query, page=1):
    """Search Unsplash for a unique image"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": 10,
        "orientation": "landscape",
        "page": page
    }
    
    try:
        response = requests.get(f"{BASE_URL}/search/photos", headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            for photo in data["results"]:
                if photo["id"] not in used_images:
                    used_images.add(photo["id"])
                    return photo["urls"]["regular"]
        elif response.status_code == 429:
            print("Rate limited, waiting 60 seconds...")
            time.sleep(60)
            return search_unique_image(query, page)
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Abstract keywords with more variety
abstract_keywords = [
    "abstract minimal white",
    "abstract blue gradient",
    "abstract gold texture",
    "abstract marble pattern",
    "abstract smoke dark",
    "abstract water ripple",
    "abstract geometric shape",
    "abstract light beam",
    "abstract nature fog",
    "abstract stone texture",
    "abstract sky clouds",
    "abstract bokeh lights",
    "abstract blur color",
    "abstract gradient warm",
    "abstract gradient cool",
    "abstract line pattern",
    "abstract circle shape",
    "abstract wave form",
    "abstract organic shape",
    "abstract crystal texture",
    "abstract sand pattern",
    "abstract wood grain",
    "abstract metal surface",
    "abstract glass reflection",
    "abstract shadow play",
    "abstract light shadow",
    "abstract color blend",
    "abstract monochrome",
    "abstract sepia tone",
    "abstract cool tone",
]

# Get all quotes
quotes = db.all("SELECT id FROM quotes")
print(f"Found {len(quotes)} quotes")

# Process each quote
updated = 0

for i, quote in enumerate(quotes):
    # Use different keyword and page to get unique images
    keyword = abstract_keywords[i % len(abstract_keywords)]
    page = (i // len(abstract_keywords)) + 1
    
    print(f"  [{i+1}/{len(quotes)}] Searching for: {keyword} (page {page})")
    image_url = search_unique_image(keyword, page)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, quote])
        updated += 1
        print(f"    -> Found unique image")
    else:
        print(f"    -> No unique image found, trying fallback")
        # Try with a different keyword
        fallback_keyword = f"abstract texture {i}"
        image_url = search_unique_image(fallback_keyword)
        if image_url:
            db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, quote])
            updated += 1
            print(f"    -> Found fallback image")
    
    # Rate limiting
    time.sleep(1.5)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")
print(f"Total unique images used: {len(used_images)}")

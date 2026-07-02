import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

def get_image(query, page=1):
    """Get an image from Unsplash"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape",
        "page": page
    }
    
    try:
        response = requests.get(f"{BASE_URL}/search/photos", headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                photo = data["results"][0]
                return photo["urls"]["regular"]
        elif response.status_code == 429:
            print("Rate limited, waiting 60 seconds...")
            time.sleep(60)
            return get_image(query, page)
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Get all quotes
quotes = db.all("SELECT id FROM quotes")
print(f"Found {len(quotes)} quotes")

# Process each quote
updated = 0

for i, quote in enumerate(quotes):
    # Use unique search term for each quote
    search_term = f"abstract art {i+100}"
    page = ((i * 7) % 20) + 1  # Vary page to get different images
    
    print(f"  [{i+1}/{len(quotes)}] Updating {quote}: {search_term} (page {page})")
    
    image_url = get_image(search_term, page)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, quote])
        updated += 1
        print(f"    -> Updated")
    
    time.sleep(1.2)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")

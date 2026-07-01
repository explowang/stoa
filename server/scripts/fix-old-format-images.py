import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

def search_image(query):
    """Search Unsplash for an image matching the query"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape"
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
            return search_image(query)
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Get quotes with old format images
result = db.all("SELECT id, image_url FROM quotes WHERE image_url NOT LIKE '%photo-%'")
print(f"Found {len(result)} quotes with old format images")

# Abstract keywords
abstract_keywords = [
    "abstract minimal",
    "abstract light",
    "abstract geometry",
    "abstract marble",
    "abstract gold",
]

# Process each quote
updated = 0

for i, quote in enumerate(result):
    keyword = abstract_keywords[i % len(abstract_keywords)]
    
    print(f"  [{i+1}/{len(result)}] Updating {quote.id} with: {keyword}")
    image_url = search_image(keyword)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, quote.id])
        updated += 1
        print(f"    -> Updated")
    else:
        print(f"    -> No image found")
    
    time.sleep(1.5)

print(f"\nUpdated: {updated}")

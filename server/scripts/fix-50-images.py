import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Track used images in this batch
used_images = set()

def get_image(query, page=1):
    """Get an image from Unsplash"""
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
            # Find an unused image
            for photo in data["results"]:
                if photo["id"] not in used_images:
                    used_images.add(photo["id"])
                    return photo["urls"]["regular"]
        elif response.status_code == 429:
            print("Rate limited! Wait 1 hour or use different API key.")
            return None
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Get quotes with duplicate images (limit 50 per batch)
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
    ORDER BY q.image_url
    LIMIT 50
""")

print(f"=== Batch Fix: Processing {len(result)} quotes ===")

# Process each quote
updated = 0

for i, r in enumerate(result):
    # Use unique search term
    search_term = f"abstract art {updated + 500}"
    page = (updated % 5) + 1
    
    print(f"  [{i+1}/{len(result)}] Updating {r.id}")
    image_url = get_image(search_term, page)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, r.id])
        updated += 1
        print(f"    -> OK")
    
    time.sleep(1.2)

print(f"\n=== Batch Complete ===")
print(f"Updated: {updated}")
print(f"Run this script again tomorrow to fix more images.")

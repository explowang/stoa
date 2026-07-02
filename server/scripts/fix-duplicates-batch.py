import requests
import json
import time
import postgres

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

# Database connection
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

def get_images_batch(query, count=10):
    """Get multiple images from Unsplash in one request"""
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": count,
        "orientation": "landscape"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/search/photos", headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            return [photo["urls"]["regular"] for photo in data["results"]]
        elif response.status_code == 429:
            print("Rate limited, waiting 60 seconds...")
            time.sleep(60)
            return get_images_batch(query, count)
    except Exception as e:
        print(f"Error: {e}")
    
    return []

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
""")

print(f"Found {len(result)} quotes with duplicate images")

# Group by image_url
from collections import defaultdict
groups = defaultdict(list)
for r in result:
    groups[r.image_url].append(r.id)

print(f"Found {len(groups)} groups of duplicates")

# Process each group
updated = 0
used_images = set()

for image_url, quote_ids in groups.items():
    if len(quote_ids) <= 1:
        continue
    
    # Keep the first quote's image, update the rest
    for quote_id in quote_ids[1:]:
        # Get a new unique image
        search_term = f"abstract art {updated}"
        images = get_images_batch(search_term, 5)
        
        for img in images:
            if img not in used_images:
                used_images.add(img)
                db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [img, quote_id])
                updated += 1
                print(f"  Updated {quote_id}")
                break
        
        time.sleep(1.5)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")

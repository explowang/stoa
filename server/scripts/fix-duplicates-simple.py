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
    ORDER BY q.image_url
""")

print(f"Found {len(result)} quotes with duplicate images")

# Process each quote
updated = 0
processed = set()

for r in result:
    # Skip if already processed
    if r.id in processed:
        continue
    
    # Get a new unique image
    search_term = f"abstract texture {updated + 200}"
    page = (updated % 10) + 1
    
    print(f"  Updating {r.id}: {search_term}")
    image_url = get_image(search_term, page)
    
    if image_url:
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [image_url, r.id])
        updated += 1
        processed.add(r.id)
        print(f"    -> Updated")
    
    time.sleep(1.5)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")

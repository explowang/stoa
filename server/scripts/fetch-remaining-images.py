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
                return {
                    "id": photo["id"],
                    "url": photo["urls"]["regular"],
                    "thumb": photo["urls"]["thumb"],
                    "photographer": photo["user"]["name"],
                    "photographer_url": photo["user"]["links"]["html"]
                }
        elif response.status_code == 429:
            print("Rate limited, waiting 60 seconds...")
            time.sleep(60)
            return search_image(query)
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Get quotes without images
quotes = db.all("SELECT id, philosopher_id, content, themes, image_url FROM quotes WHERE image_url IS NULL OR image_url = ''")
print(f"Found {len(quotes)} quotes without images")

# Process each quote with different search queries
for quote in quotes:
    print(f"\nProcessing {quote.id}: {quote.content[:50]}...")
    
    # Try multiple search queries
    search_queries = [
        "epicurus greek philosopher",
        "ancient greek philosophy garden",
        "stoicism peace calm",
        "greek philosophy wisdom",
        "ancient philosophy nature"
    ]
    
    for query in search_queries:
        print(f"  Searching for: {query}")
        result = search_image(query)
        if result:
            db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [result["url"], quote.id])
            print(f"  -> Found image: {result['url'][:50]}...")
            break
        time.sleep(1.5)
    else:
        print(f"  -> No image found with any query")

print("\nDone!")

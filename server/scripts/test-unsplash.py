import requests
import json
import time

# Unsplash API
ACCESS_KEY = "6rze19tF3CUX1tzbwNVuBdOdEZuE3_PuiBxkpn81r-A"
BASE_URL = "https://api.unsplash.com"

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

# Test the function
result = search_image("ancient greek philosopher")
print(json.dumps(result, indent=2))

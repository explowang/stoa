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

def generate_search_query(philosopher_name, themes, content):
    """Generate a search query based on philosopher and themes"""
    # Map philosopher names to English search terms
    philosopher_map = {
        "苏格拉底": "socrates ancient greek philosopher",
        "柏拉图": "plato ancient greek philosopher",
        "亚里士多德": "aristotle ancient greek philosopher",
        "赫拉克利特": "heraclitus ancient greek philosopher",
        "巴门尼德": "parmenides ancient greek philosopher",
        "毕达哥拉斯": "pythagoras ancient greek mathematician",
        "德谟克利特": "democritus ancient greek philosopher",
        "阿那克萨戈拉": "anaxagoras ancient greek philosopher",
        "恩培多克勒": "empedocles ancient greek philosopher",
        "普罗泰戈拉": "protagoras ancient greek sophist",
        "高尔吉亚": "gorgias ancient greek sophist",
        "爱比克泰德": "epictetus stoic philosopher",
        "马可·奥勒留": "marcus aurelius roman emperor stoic",
        "伊壁鸠鲁": "epicurus ancient greek philosopher",
        "第欧根尼": "diogenes ancient greek cynic philosopher",
        "芝诺（斯多亚）": "zeno stoic philosopher",
    }
    
    # Get English philosopher name
    phil_search = philosopher_map.get(philosopher_name, "ancient greek philosophy")
    
    # Simplified theme keywords - use more generic terms
    theme_keywords = {
        "智慧": "light",
        "知识": "book",
        "灵魂": "spirit",
        "正义": "balance",
        "美德": "moral",
        "幸福": "joy",
        "死亡": "mortality",
        "自然": "nature",
        "变化": "river",
        "存在": "abstract",
        "真理": "truth",
        "理性": "logic",
        "自由": "liberty",
        "勇气": "strength",
        "节制": "balance",
        "友谊": "connection",
        "爱": "heart",
        "美": "aesthetic",
        "善": "goodness",
        "恶": "darkness",
        "教育": "learning",
        "政治": "government",
        "法律": "justice",
        "民主": "people",
        "战争": "battle",
        "和平": "calm",
        "宇宙": "cosmos",
        "原子": "particle",
        "数": "mathematics",
        "音乐": "harmony",
        "悲剧": "drama",
        "喜剧": "theater",
        "记忆": "mind",
        "判断": "decision",
        "情绪": "emotion",
        "控制": "power",
        "接纳": "peace",
        "无常": "change",
        "时间": "clock",
        "未来": "horizon",
        "当下": "moment",
        "行动": "movement",
        "思想": "thought",
        "语言": "word",
        "简朴": "minimal",
        "满足": "contentment",
        "欲望": "passion",
        "财富": "treasure",
        "劳动": "work",
        "闲暇": "leisure",
        "本原": "source",
        "目的论": "purpose",
        "中道": "moderation",
        "实践": "action",
        "理论": "knowledge",
        "逻辑": "reasoning",
        "修辞": "speech",
        "怀疑": "question",
        "相对主义": "perspective",
        "犬儒": "simplicity",
        "斯多亚": "calm",
        "伊壁鸠鲁": "pleasure",
    }
    
    # Get theme keywords
    theme_keywords_list = []
    if themes:
        for theme in themes:
            if theme in theme_keywords:
                theme_keywords_list.append(theme_keywords[theme])
    
    # Build search query - use simpler terms
    if theme_keywords_list:
        return f"{phil_search} {theme_keywords_list[0]}"
    else:
        return f"{phil_search} ancient philosophy"

# Get quotes without images
quotes = db.all("SELECT id, philosopher_id, content, themes, image_url FROM quotes WHERE image_url IS NULL OR image_url = ''")
print(f"Found {len(quotes)} quotes without images")

# Process each quote
updated = 0

for i, quote in enumerate(quotes):
    # Get philosopher name
    philosopher = db.one("SELECT name FROM philosophers WHERE id = %s", [quote.philosopher_id])
    if not philosopher:
        print(f"  [{i+1}/{len(quotes)}] Philosopher not found for {quote.id}")
        continue
    
    # Parse themes
    themes = []
    if quote.themes:
        try:
            themes = json.loads(quote.themes)
        except:
            themes = []
    
    # Generate search query
    query = generate_search_query(philosopher, themes, quote.content)
    
    # Search for image
    print(f"  [{i+1}/{len(quotes)}] Searching for: {query}")
    result = search_image(query)
    
    if result:
        # Update database
        db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [result["url"], quote.id])
        updated += 1
        print(f"    -> Found image: {result['url'][:50]}...")
    else:
        # Try with a simpler query
        simple_query = f"ancient greek philosophy {philosopher}"
        print(f"    -> Trying simpler query: {simple_query}")
        result = search_image(simple_query)
        if result:
            db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [result["url"], quote.id])
            updated += 1
            print(f"    -> Found image: {result['url'][:50]}...")
        else:
            print(f"    -> No image found")
    
    # Rate limiting - Unsplash allows 50 requests/hour for demo
    time.sleep(1.5)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")
print(f"Total processed: {len(quotes)}")

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
    
    # Map themes to image keywords
    theme_map = {
        "智慧": "wisdom light",
        "知识": "knowledge book",
        "灵魂": "soul spirit",
        "正义": "justice balance",
        "美德": "virtue moral",
        "幸福": "happiness joy",
        "死亡": "death mortality",
        "自然": "nature universe",
        "变化": "change flow river",
        "存在": "existence being",
        "真理": "truth light",
        "理性": "reason logic",
        "自由": "freedom liberty",
        "勇气": "courage strength",
        "节制": "temperance balance",
        "友谊": "friendship connection",
        "爱": "love heart",
        "美": "beauty aesthetic",
        "善": "goodness virtue",
        "恶": "evil darkness",
        "教育": "education learning",
        "政治": "politics government",
        "法律": "law justice",
        "民主": "democracy people",
        "战争": "war battle",
        "和平": "peace calm",
        "宇宙": "universe cosmos",
        "原子": "atom particle",
        "数": "number mathematics",
        "音乐": "music harmony",
        "悲剧": "tragedy drama",
        "喜剧": "comedy theater",
        "记忆": "memory mind",
        "判断": "judgment decision",
        "情绪": "emotion feeling",
        "控制": "control power",
        "接纳": "acceptance peace",
        "无常": "impermanence change",
        "时间": "time clock",
        "未来": "future horizon",
        "当下": "present moment",
        "行动": "action movement",
        "思想": "thought mind",
        "语言": "language word",
        "简朴": "simplicity minimal",
        "满足": "contentment peace",
        "欲望": "desire passion",
        "财富": "wealth treasure",
        "劳动": "work labor",
        "闲暇": "leisure calm",
        "本原": "origin source",
        "目的论": "teleology purpose",
        "中道": "moderation balance",
        "实践": "practice action",
        "理论": "theory knowledge",
        "逻辑": "logic reasoning",
        "修辞": "rhetoric speech",
        "怀疑": "doubt question",
        "相对主义": "relativity perspective",
        "犬儒": "cynicism simplicity",
        "斯多亚": "stoicism calm",
        "伊壁鸠鲁": "epicureanism pleasure",
    }
    
    # Get theme keywords
    theme_keywords = []
    if themes:
        for theme in themes:
            if theme in theme_map:
                theme_keywords.append(theme_map[theme])
    
    # Build search query
    if theme_keywords:
        return f"{phil_search} {theme_keywords[0]}"
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
        print(f"    -> No image found")
    
    # Rate limiting - Unsplash allows 50 requests/hour for demo
    time.sleep(1.5)

print(f"\n=== Complete ===")
print(f"Updated: {updated}")
print(f"Total processed: {len(quotes)}")

import postgres
import json

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get all quotes with non-JSON themes
result = db.all("SELECT id, themes FROM quotes")
updated = 0

for row in result:
    themes = row.themes
    # Check if it's already JSON (starts with [)
    if themes and themes.startswith('['):
        continue
    
    # Convert comma-separated to JSON array
    if themes and ',' in themes:
        theme_list = [t.strip() for t in themes.split(',') if t.strip()]
        json_themes = json.dumps(theme_list, ensure_ascii=False)
        db.run("UPDATE quotes SET themes = %s WHERE id = %s", [json_themes, row.id])
        updated += 1
        print(f'Updated {row.id}: {themes} -> {json_themes}')

print(f'\nTotal updated: {updated}')

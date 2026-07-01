import postgres
import json

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get all philosophers
result = db.all("SELECT id, name, core_ideas FROM philosophers")
updated = 0

for row in result:
    core_ideas = row.core_ideas
    # Check if it's already JSON (starts with [)
    if core_ideas and core_ideas.startswith('['):
        # Check if it's a proper JSON array with multiple items
        try:
            parsed = json.loads(core_ideas)
            if isinstance(parsed, list) and len(parsed) > 1:
                print(f'SKIP {row.id}: already proper JSON array')
                continue
        except:
            pass
    
    # Convert comma-separated to JSON array (handle both , and 、)
    if core_ideas:
        # Replace Chinese comma with regular comma, then split
        normalized = core_ideas.replace('、', ',')
        ideas_list = [i.strip() for i in normalized.split(',') if i.strip()]
        json_ideas = json.dumps(ideas_list, ensure_ascii=False)
        db.run("UPDATE philosophers SET core_ideas = %s WHERE id = %s", [json_ideas, row.id])
        updated += 1
        print(f'Updated {row.id}: {core_ideas} -> {json_ideas}')
    else:
        print(f'SKIP {row.id}: empty core_ideas')

print(f'\nTotal updated: {updated}')

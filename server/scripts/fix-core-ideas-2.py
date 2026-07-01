import postgres
import json

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get all philosophers
result = db.all("SELECT id, name, core_ideas FROM philosophers")
updated = 0

for row in result:
    core_ideas = row.core_ideas
    if not core_ideas:
        continue
    
    try:
        parsed = json.loads(core_ideas)
        # Check if it's a list with one element that looks like a JSON string
        if isinstance(parsed, list) and len(parsed) == 1 and parsed[0].startswith('['):
            # It's double-encoded, parse the inner string
            inner_parsed = json.loads(parsed[0])
            json_ideas = json.dumps(inner_parsed, ensure_ascii=False)
            db.run("UPDATE philosophers SET core_ideas = %s WHERE id = %s", [json_ideas, row.id])
            updated += 1
            print(f'Fixed {row.id}: {core_ideas} -> {json_ideas}')
        elif isinstance(parsed, list) and len(parsed) > 1:
            # Already a proper array
            print(f'SKIP {row.id}: already proper')
        else:
            print(f'SKIP {row.id}: unexpected format')
    except json.JSONDecodeError:
        print(f'SKIP {row.id}: not JSON')

print(f'\nTotal fixed: {updated}')

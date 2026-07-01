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
        if isinstance(parsed, list):
            # Check if first element looks like it contains a JSON array string
            if len(parsed) > 0 and parsed[0].startswith('["'):
                # Join all elements and parse as JSON
                combined = ''.join(parsed)
                # Remove trailing ] if present and add ]
                if combined.endswith(']'):
                    combined = combined[:-1]
                # Add opening [
                if not combined.startswith('['):
                    combined = '[' + combined
                # Try to parse
                try:
                    inner_parsed = json.loads(combined)
                    json_ideas = json.dumps(inner_parsed, ensure_ascii=False)
                    db.run("UPDATE philosophers SET core_ideas = %s WHERE id = %s", [json_ideas, row.id])
                    updated += 1
                    print(f'Fixed {row.id}: {parsed} -> {inner_parsed}')
                except:
                    print(f'FAILED {row.id}: could not parse {combined}')
            else:
                print(f'SKIP {row.id}: proper format')
        else:
            print(f'SKIP {row.id}: not a list')
    except json.JSONDecodeError:
        print(f'SKIP {row.id}: not JSON')

print(f'\nTotal fixed: {updated}')

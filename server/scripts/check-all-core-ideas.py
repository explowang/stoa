import postgres
import json

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

result = db.all("SELECT id, name, core_ideas FROM philosophers")
for r in result:
    print(f'{r.id}: {r.name}')
    try:
        parsed = json.loads(r.core_ideas)
        print(f'  Type: {type(parsed).__name__}, Length: {len(parsed) if isinstance(parsed, list) else "N/A"}')
        print(f'  Content: {parsed}')
    except:
        print(f'  NOT JSON: {r.core_ideas}')
    print()

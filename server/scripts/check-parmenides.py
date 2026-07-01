import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
result = db.all("SELECT id, name, core_ideas FROM philosophers WHERE id = 'parmenides'")
for r in result:
    print(f'{r.id}: {r.name}')
    print(f'core_ideas raw: {r.core_ideas}')

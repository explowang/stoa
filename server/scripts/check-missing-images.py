import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get quotes without images
result = db.all("SELECT id, philosopher_id, content FROM quotes WHERE image_url IS NULL OR image_url = ''")
print("Quotes without images:")
for r in result:
    print(f"  - {r.id}: {r.content[:50]}...")

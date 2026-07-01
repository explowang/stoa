import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get a sample of images
result = db.all("SELECT id, image_url FROM quotes LIMIT 5")
print("Sample images:")
for r in result:
    print(f"  {r}: {r.image_url[:80]}...")

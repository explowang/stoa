import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Check how many quotes have images
result = db.one("SELECT COUNT(*) FROM quotes WHERE image_url IS NOT NULL AND image_url != ''")
print(f"Quotes with images: {result}")

result2 = db.one("SELECT COUNT(*) FROM quotes WHERE image_url IS NULL OR image_url = ''")
print(f"Quotes without images: {result2}")

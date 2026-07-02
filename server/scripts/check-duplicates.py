import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Check for duplicate images
result = db.all("""
    SELECT image_url, COUNT(*) as cnt 
    FROM quotes 
    WHERE image_url IS NOT NULL 
    GROUP BY image_url 
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
""")
print("Duplicate images:")
for r in result:
    print(f"  {r.cnt} quotes share: {r.image_url[:60]}...")

# Check for old format images
result2 = db.all("SELECT id, image_url FROM quotes WHERE image_url NOT LIKE '%photo-%'")
print(f"\nOld format images: {len(result2)}")
for r in result2:
    print(f"  {r.id}: {r.image_url[:60]}...")

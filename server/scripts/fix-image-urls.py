import postgres
import re

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Get all images
result = db.all("SELECT id, image_url FROM quotes")
updated = 0

for r in result:
    url = r.image_url
    if not url:
        continue
    
    # Extract photo ID from URL
    # Pattern: https://images.unsplash.com/photo-XXXXX or https://images.unsplash.com/XXXXX
    match = re.search(r'unsplash\.com/([a-zA-Z0-9_-]+)', url)
    if match:
        photo_id = match.group(1)
        # Create new URL with fixed size
        new_url = f"https://images.unsplash.com/{photo_id}?w=1200&h=630&fit=crop&auto=format"
        if new_url != url:
            db.run("UPDATE quotes SET image_url = %s WHERE id = %s", [new_url, r.id])
            updated += 1
            print(f"Updated {r.id}")

print(f"\nTotal updated: {updated}")

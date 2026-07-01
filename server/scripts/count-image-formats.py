import postgres
import re

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Count images with old format (no photo- prefix)
result = db.all("SELECT id, image_url FROM quotes")
old_format = 0
new_format = 0

for r in result:
    if r.image_url and 'photo-' in r.image_url:
        new_format += 1
    else:
        old_format += 1

print(f"New format (photo-): {new_format}")
print(f"Old format: {old_format}")
print(f"Total: {old_format + new_format}")

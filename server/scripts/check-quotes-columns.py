import postgres
db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
result = db.all("SELECT column_name FROM information_schema.columns WHERE table_name = 'quotes'")
print("Quotes columns:")
for r in result:
    print(f"  - {r}")

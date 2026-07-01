"""
Import quotes from Excel file into Neon PostgreSQL database.
Usage: py -3.12 server/scripts/import-excel.py
"""

import os
import sys
import pandas as pd
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Database connection
try:
    import postgres
except ImportError:
    print("Installing postgres package...")
    os.system("pip install postgres")
    import postgres

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
db = postgres.Postgres(DATABASE_URL)

# Read Excel file
excel_path = Path(__file__).parent.parent.parent / "古希腊哲学语录数据库.xlsx"
df = pd.read_excel(excel_path, sheet_name="语录数据库")

print(f"Found {len(df)} quotes in Excel file")

# Get existing philosophers
existing_philosophers = db.all("SELECT id, name FROM philosophers")
existing_map = {p.name: p.id for p in existing_philosophers}
print(f"Existing philosophers: {list(existing_map.keys())}")

# Extract unique philosophers from Excel
excel_philosophers = {}
for _, row in df.iterrows():
    name = row.iloc[1]
    era = str(row.iloc[2])
    if name not in excel_philosophers:
        excel_philosophers[name] = era

print(f"\nPhilosophers in Excel ({len(excel_philosophers)}):")
for name, era in excel_philosophers.items():
    status = "EXISTS" if name in existing_map else "NEW"
    print(f"  {name} ({era}) - {status}")

# Create ID mapping for Chinese names to English slugs
name_to_id = {
    "赫拉克利特": "heraclitus",
    "巴门尼德": "parmenides",
    "毕达哥拉斯": "pythagoras",
    "德谟克利特": "democritus",
    "阿那克萨戈拉": "anaxagoras",
    "恩培多克勒": "empedocles",
    "普罗泰戈拉": "protagoras",
    "高尔吉亚": "gorgias",
    "苏格拉底": "socrates",
    "柏拉图": "plato",
    "亚里士多德": "aristotle",
    "爱比克泰德": "epictetus",
    "马可·奥勒留": "marcus-aurelius",
    "伊壁鸠鲁": "epicurus",
    "第欧根尼": "diogenes",
    "芝诺（斯多亚）": "zeno-stoic",
}

# Complete philosopher data (birth_year and death_year as integers, negative for BC)
philosopher_data = {
    "赫拉克利特": {"name_en": "Heraclitus", "name_greek": "Ἡράκλειτος", "school_en": "Ephesian", "region": "古希腊", "birth_year": -535, "death_year": -475, "core_ideas": "万物流变、逻各斯、对立统一"},
    "巴门尼德": {"name_en": "Parmenides", "name_greek": "Παρμενίδης", "school_en": "Eleatic", "region": "古希腊", "birth_year": -515, "death_year": -450, "core_ideas": "存在论、理性主义、否定变化"},
    "毕达哥拉斯": {"name_en": "Pythagoras", "name_greek": "Πυθαγόρας", "school_en": "Pythagorean", "region": "古希腊", "birth_year": -570, "death_year": -495, "core_ideas": "数即万物、灵魂转世、和谐"},
    "德谟克利特": {"name_en": "Democritus", "name_greek": "Δημόκριτος", "school_en": "Atomist", "region": "古希腊", "birth_year": -460, "death_year": -370, "core_ideas": "原子论、唯物主义、快乐主义"},
    "阿那克萨戈拉": {"name_en": "Anaxagoras", "name_greek": "Ἀναξαγόρας", "school_en": "Pluralist", "region": "古希腊", "birth_year": -500, "death_year": -428, "core_ideas": "努斯（心灵）、种子说"},
    "恩培多克勒": {"name_en": "Empedocles", "name_greek": "Ἐμπεδοκλῆς", "school_en": "Pluralist", "region": "古希腊", "birth_year": -494, "death_year": -434, "core_ideas": "四根说、爱与恨"},
    "普罗泰戈拉": {"name_en": "Protagoras", "name_greek": "Πρωταγόρας", "school_en": "Sophist", "region": "古希腊", "birth_year": -490, "death_year": -420, "core_ideas": "人是万物的尺度、相对主义"},
    "高尔吉亚": {"name_en": "Gorgias", "name_greek": "Γοργίας", "school_en": "Sophist", "region": "古希腊", "birth_year": -483, "death_year": -375, "core_ideas": "修辞术、怀疑论"},
    "芝诺（斯多亚）": {"name_en": "Zeno of Citium", "name_greek": "Ζήνων", "school_en": "Stoic", "region": "塞浦路斯", "birth_year": -334, "death_year": -262, "core_ideas": "斯多亚学派创始人、理性主义、自然法"},
}

# Insert new philosophers
new_philosophers = {}
for name, era in excel_philosophers.items():
    if name not in existing_map:
        # Get English ID and data
        phil_id = name_to_id.get(name)
        data = philosopher_data.get(name)
        if not phil_id or not data:
            print(f"  Warning: No data for '{name}', skipping")
            continue
        
        # Extract school from era
        school = ""
        if "·" in era:
            school = era.split("·")[-1].strip()
        else:
            school = era
        
        db.run(
            """INSERT INTO philosophers (id, name, name_en, name_greek, school, school_en, region, birth_year, death_year, biography, core_ideas, portrait)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            [phil_id, name, data["name_en"], data["name_greek"], school, data["school_en"], data["region"], data["birth_year"], data["death_year"], f"{name} - {era}", data["core_ideas"], ""]
        )
        new_philosophers[name] = phil_id
        existing_map[name] = phil_id
        print(f"  Created philosopher: {name} (id={phil_id})")

# Insert quotes
inserted = 0
skipped = 0

for _, row in df.iterrows():
    quote_id = row.iloc[0]
    philosopher_name = row.iloc[1]
    quote_content = row.iloc[3]
    english = row.iloc[4] if pd.notna(row.iloc[4]) else ""
    source = row.iloc[6] if pd.notna(row.iloc[6]) else ""
    note = row.iloc[7] if pd.notna(row.iloc[7]) else ""
    
    # Check if quote already exists
    existing = db.one("SELECT id FROM quotes WHERE id = %s", [quote_id])
    if existing:
        skipped += 1
        continue
    
    # Get philosopher ID
    philosopher_id = existing_map.get(philosopher_name)
    if not philosopher_id:
        print(f"  Warning: Philosopher '{philosopher_name}' not found, skipping quote")
        continue
    
    # Parse themes from source column (comma-separated)
    themes = [t.strip() for t in source.split(",") if t.strip()]
    themes_str = ",".join(themes) if themes else "哲学"
    
    db.run(
        """INSERT INTO quotes (id, philosopher_id, content, themes, source)
           VALUES (%s, %s, %s, %s, %s)""",
        [quote_id, philosopher_id, quote_content, themes_str, note]
    )
    inserted += 1

print(f"\n=== Import Complete ===")
print(f"Inserted: {inserted} quotes")
print(f"Skipped (already exist): {skipped} quotes")
total = db.one("SELECT COUNT(*) FROM quotes")
print(f"Total quotes in database: {total}")

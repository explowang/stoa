import postgres
import json

db = postgres.Postgres('postgresql://neondb_owner:npg_q8SZK0xOGIgF@ep-nameless-grass-aoh5gx78.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')

# Manually set the correct core_ideas for each philosopher
philosopher_core_ideas = {
    "parmenides": ["存在论", "理性主义", "否定变化"],
    "pythagoras": ["数即万物", "灵魂转世", "和谐"],
    "democritus": ["原子论", "唯物主义", "快乐主义"],
    "anaxagoras": ["努斯（心灵）", "种子说"],
    "empedocles": ["四根说", "爱与恨"],
    "protagoras": ["人是万物的尺度", "相对主义"],
    "gorgias": ["修辞术", "怀疑论"],
    "zeno-stoic": ["斯多亚学派创始人", "理性主义", "自然法"],
}

updated = 0
for phil_id, ideas in philosopher_core_ideas.items():
    json_ideas = json.dumps(ideas, ensure_ascii=False)
    db.run("UPDATE philosophers SET core_ideas = %s WHERE id = %s", [json_ideas, phil_id])
    updated += 1
    print(f'Updated {phil_id}: {json_ideas}')

print(f'\nTotal updated: {updated}')

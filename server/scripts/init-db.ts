import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function initializeDatabase() {
  console.log('Connecting to database...');
  
  try {
    // 测试连接
    await sql`SELECT 1`;
    console.log('Database connected successfully');

    // 创建表
    console.log('Creating tables...');
    
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS philosophers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_greek TEXT,
        birth_year INTEGER NOT NULL,
        death_year INTEGER NOT NULL,
        school TEXT NOT NULL,
        school_en TEXT NOT NULL,
        region TEXT NOT NULL,
        biography TEXT NOT NULL,
        core_ideas TEXT NOT NULL,
        portrait TEXT NOT NULL
      );
    `);
    console.log('Table "philosophers" created');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        philosopher_id TEXT NOT NULL,
        content TEXT NOT NULL,
        content_original TEXT,
        source TEXT NOT NULL,
        source_work TEXT,
        themes TEXT NOT NULL,
        image_url TEXT,
        year INTEGER,
        context TEXT,
        is_verified INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (philosopher_id) REFERENCES philosophers(id)
      );
    `);
    console.log('Table "quotes" created');

    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_quotes_philosopher ON quotes(philosopher_id);`);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes(themes);`);
    console.log('Indexes created');

    // 导入哲学家数据
    console.log('Importing philosophers...');
    
    const philosophers = [
      { id: 'socrates', name: '苏格拉底', nameEn: 'Socrates', nameGreek: 'Σωκράτης', birthYear: -470, deathYear: -399, school: '苏格拉底学派', schoolEn: 'Socratic', region: '古希腊·雅典', biography: '苏格拉底是古希腊哲学家，西方哲学的奠基者之一。他以对话法（产婆术）著称，通过不断追问引导人们思考真理。', coreIdeas: ['认识你自己', '美德即知识', '产婆术', '未经审视的人生不值得过'], portrait: '/assets/images/socrates.webp' },
      { id: 'plato', name: '柏拉图', nameEn: 'Plato', nameGreek: 'Πλάτων', birthYear: -428, deathYear: -348, school: '柏拉图学派', schoolEn: 'Platonic', region: '古希腊·雅典', biography: '柏拉图是古希腊哲学家，苏格拉底的学生，亚里士多德的老师。他创立了柏拉图学园，提出了理念论。', coreIdeas: ['理念论', '洞穴隐喻', '灵魂三分', '哲人王'], portrait: '/assets/images/plato.webp' },
      { id: 'aristotle', name: '亚里士多德', nameEn: 'Aristotle', nameGreek: 'Ἀριστοτέλης', birthYear: -384, deathYear: -322, school: '逍遥学派', schoolEn: 'Peripatetic', region: '古希腊·马其顿', biography: '亚里士多德是古希腊哲学家，柏拉图的学生，亚历山大大帝的老师。他是百科全书式的学者。', coreIdeas: ['四因说', '中庸之道', '形式逻辑', '幸福论'], portrait: '/assets/images/aristotle.webp' },
      { id: 'diogenes', name: '第欧根尼', nameEn: 'Diogenes', nameGreek: 'Διογένης', birthYear: -412, deathYear: -323, school: '犬儒学派', schoolEn: 'Cynic', region: '古希腊·锡诺普', biography: '第欧根尼是古希腊犬儒学派的代表人物，以极端的简朴生活和对社会习俗的蔑视著称。', coreIdeas: ['自足', '简朴生活', '回归自然', '蔑视习俗'], portrait: '/assets/images/diogenes.webp' },
      { id: 'epictetus', name: '爱比克泰德', nameEn: 'Epictetus', nameGreek: 'Ἐπίκτητος', birthYear: 55, deathYear: 135, school: '斯多亚学派', schoolEn: 'Stoic', region: '古罗马·希拉波利斯', biography: '爱比克泰德是古罗马斯多亚学派哲学家，曾为奴隶。他的思想强调区分我们能控制的和不能控制的。', coreIdeas: ['控制二分法', '内心自由', '接受命运', '德行即幸福'], portrait: '/assets/images/epictetus.webp' },
      { id: 'marcus-aurelius', name: '马可·奥勒留', nameEn: 'Marcus Aurelius', nameGreek: 'Μάρκος Αὐρήλιος', birthYear: 121, deathYear: 180, school: '斯多亚学派', schoolEn: 'Stoic', region: '古罗马', biography: '马可·奥勒留是古罗马皇帝，也是斯多亚学派的重要代表人物。他在征战途中写下了《沉思录》。', coreIdeas: ['接受命运', '当下即永恒', '内在城堡', '责任与德行'], portrait: '/assets/images/marcus-aurelius.webp' },
      { id: 'heraclitus', name: '赫拉克利特', nameEn: 'Heraclitus', nameGreek: 'Ἡράκλειτος', birthYear: -535, deathYear: -475, school: '爱菲斯学派', schoolEn: 'Ephesian', region: '古希腊·爱菲斯', biography: '赫拉克利特是古希腊哲学家，以万物皆流的思想著称。他认为变化是宇宙的根本法则。', coreIdeas: ['万物皆流', '逻各斯', '对立统一', '火是万物之源'], portrait: '/assets/images/heraclitus.webp' },
      { id: 'epicurus', name: '伊壁鸠鲁', nameEn: 'Epicurus', nameGreek: 'Ἐπίκουρος', birthYear: -341, deathYear: -270, school: '伊壁鸠鲁学派', schoolEn: 'Epicurean', region: '古希腊·萨摩斯', biography: '伊壁鸠鲁是古希腊哲学家，伊壁鸠鲁学派的创始人。他主张快乐是人生的最高目的。', coreIdeas: ['快乐主义', '心灵宁静', '原子论', '友谊的重要性'], portrait: '/assets/images/epicurus.webp' },
    ];

    for (const p of philosophers) {
      await sql`
        INSERT INTO philosophers (id, name, name_en, name_greek, birth_year, death_year, school, school_en, region, biography, core_ideas, portrait)
        VALUES (${p.id}, ${p.name}, ${p.nameEn}, ${p.nameGreek}, ${p.birthYear}, ${p.deathYear}, ${p.school}, ${p.schoolEn}, ${p.region}, ${p.biography}, ${JSON.stringify(p.coreIdeas)}, ${p.portrait})
        ON CONFLICT (id) DO UPDATE SET
          name = ${p.name}, name_en = ${p.nameEn}, name_greek = ${p.nameGreek},
          birth_year = ${p.birthYear}, death_year = ${p.deathYear}, school = ${p.school},
          school_en = ${p.schoolEn}, region = ${p.region}, biography = ${p.biography},
          core_ideas = ${JSON.stringify(p.coreIdeas)}, portrait = ${p.portrait}
      `;
    }
    console.log(`Imported ${philosophers.length} philosophers`);

    // 导入语录数据
    console.log('Importing quotes...');
    
    const quotes = [
      { id: 'socrates-001', philosopherId: 'socrates', content: '未经审视的人生是不值得过的。', source: '《申辩篇》', themes: ['self-knowledge', 'wisdom', 'purpose'] },
      { id: 'socrates-002', philosopherId: 'socrates', content: '我唯一知道的，就是我一无所知。', source: '《申辩篇》', themes: ['wisdom', 'knowledge'] },
      { id: 'socrates-003', philosopherId: 'socrates', content: '认识你自己。', source: '德尔斐神庙铭文', themes: ['self-knowledge', 'wisdom'] },
      { id: 'socrates-004', philosopherId: 'socrates', content: '教育不是灌输，而是点燃火焰。', source: '转述自第欧根尼·拉尔修', themes: ['education', 'wisdom'] },
      { id: 'socrates-005', philosopherId: 'socrates', content: '最聪明的人是知道自己不聪明的人。', source: '《申辩篇》', themes: ['wisdom', 'self-knowledge'] },
      { id: 'plato-001', philosopherId: 'plato', content: '洞穴中的囚徒以为墙上的影子就是全部现实。', source: '《理想国》第七卷', themes: ['truth', 'knowledge'] },
      { id: 'plato-002', philosopherId: 'plato', content: '爱是一种对美的永恒追寻。', source: '《会饮篇》', themes: ['happiness', 'virtue'] },
      { id: 'plato-003', philosopherId: 'plato', content: '不正义的人即使拥有全世界，也不如正义的人拥有一颗宁静的心。', source: '《理想国》', themes: ['justice', 'happiness'] },
      { id: 'plato-004', philosopherId: 'plato', content: '哲学始于惊奇。', source: '《泰阿泰德篇》', themes: ['wisdom', 'knowledge'] },
      { id: 'plato-005', philosopherId: 'plato', content: '除非哲学家成为国王，否则国家的灾难永无休止。', source: '《理想国》', themes: ['politics', 'wisdom'] },
      { id: 'aristotle-001', philosopherId: 'aristotle', content: '幸福是灵魂的一种合乎德性的现实活动。', source: '《尼各马可伦理学》', themes: ['happiness', 'virtue'] },
      { id: 'aristotle-002', philosopherId: 'aristotle', content: '吾爱吾师，吾更爱真理。', source: '转述自第欧根尼·拉尔修', themes: ['truth', 'wisdom'] },
      { id: 'aristotle-003', philosopherId: 'aristotle', content: '人是理性的动物。', source: '《政治学》', themes: ['self-knowledge', 'education'] },
      { id: 'aristotle-004', philosopherId: 'aristotle', content: '美德是一种习惯，而不是一种天性。', source: '《尼各马可伦理学》', themes: ['virtue', 'education'] },
      { id: 'aristotle-005', philosopherId: 'aristotle', content: '中庸是美德的特征。', source: '《尼各马可伦理学》', themes: ['virtue', 'moderation'] },
      { id: 'diogenes-001', philosopherId: 'diogenes', content: '别挡我的阳光。', source: '第欧根尼·拉尔修《哲人言行录》', themes: ['courage', 'freedom'] },
      { id: 'diogenes-002', philosopherId: 'diogenes', content: '我正在寻找一个人。', source: '第欧根尼·拉尔修《哲人言行录》', themes: ['virtue', 'self-knowledge'] },
      { id: 'diogenes-003', philosopherId: 'diogenes', content: '财富并不能使人真正富有，真正富有的人是对财富无所求的人。', source: '第欧根尼·拉尔修《哲人言行录》', themes: ['happiness', 'virtue'] },
      { id: 'epictetus-001', philosopherId: 'epictetus', content: '我们能控制的只有自己的思想、判断和欲望，其他一切都不在我们控制之中。', source: '《手册》', themes: ['fate', 'freedom'] },
      { id: 'epictetus-002', philosopherId: 'epictetus', content: '困扰人们的不是事物本身，而是人们对事物的看法。', source: '《手册》', themes: ['self-knowledge', 'wisdom'] },
      { id: 'epictetus-003', philosopherId: 'epictetus', content: '不要祈求事情如你所愿地发生，而要祈愿自己能接受事情本来的样子。', source: '《手册》', themes: ['fate', 'happiness'] },
      { id: 'marcus-aurelius-001', philosopherId: 'marcus-aurelius', content: '你所拥有的一切，都是借来的，终将归还。珍惜当下。', source: '《沉思录》第二卷', themes: ['time', 'fate'] },
      { id: 'marcus-aurelius-002', philosopherId: 'marcus-aurelius', content: '你的心智是你自己的宇宙。你可以随时退回到内心的宁静之中。', source: '《沉思录》第四卷', themes: ['self-knowledge', 'happiness'] },
      { id: 'marcus-aurelius-003', philosopherId: 'marcus-aurelius', content: '不要为你无法控制的事情悲伤，而要为你能控制的事情而努力。', source: '《沉思录》', themes: ['fate', 'courage'] },
      { id: 'marcus-aurelius-004', philosopherId: 'marcus-aurelius', content: '最好的报复是不要变成你的敌人。', source: '《沉思录》第六卷', themes: ['virtue', 'justice'] },
      { id: 'heraclitus-001', philosopherId: 'heraclitus', content: '万物皆流，无物常住。', source: '残篇', themes: ['time', 'nature'] },
      { id: 'heraclitus-002', philosopherId: 'heraclitus', content: '人不能两次踏入同一条河流。', source: '残篇', themes: ['time', 'nature'] },
      { id: 'heraclitus-003', philosopherId: 'heraclitus', content: '逻各斯是永恒的，但人们总是不理解它。', source: '残篇', themes: ['wisdom', 'truth'] },
      { id: 'epicurus-001', philosopherId: 'epicurus', content: '不要害怕死亡。当死亡来临时，我们已经不存在了。', source: '《致美诺伊凯乌斯的信》', themes: ['death', 'happiness'] },
      { id: 'epicurus-002', philosopherId: 'epicurus', content: '快乐是幸福生活的起点和终点。', source: '《致美诺伊凯乌斯的信》', themes: ['happiness', 'virtue'] },
      { id: 'epicurus-003', philosopherId: 'epicurus', content: '在智慧提供给整个人生的幸福中，最重要的是获得友谊。', source: '《主要教义》', themes: ['friendship', 'happiness'] },
    ];

    for (const q of quotes) {
      await sql`
        INSERT INTO quotes (id, philosopher_id, content, content_original, source, source_work, themes, image_url, year, context, is_verified)
        VALUES (${q.id}, ${q.philosopherId}, ${q.content}, ${null}, ${q.source}, ${null}, ${JSON.stringify(q.themes)}, ${null}, ${null}, ${null}, ${1})
        ON CONFLICT (id) DO UPDATE SET
          philosopher_id = ${q.philosopherId}, content = ${q.content}, content_original = ${null},
          source = ${q.source}, source_work = ${null}, themes = ${JSON.stringify(q.themes)},
          image_url = ${null}, year = ${null}, context = ${null}, is_verified = ${1}
      `;
    }
    console.log(`Imported ${quotes.length} quotes`);

    // 验证数据
    const philosopherCount = await sql`SELECT COUNT(*) as count FROM philosophers`;
    const quoteCount = await sql`SELECT COUNT(*) as count FROM quotes`;
    console.log(`\nVerification:`);
    console.log(`Philosophers: ${philosopherCount[0].count}`);
    console.log(`Quotes: ${quoteCount[0].count}`);

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

initializeDatabase();

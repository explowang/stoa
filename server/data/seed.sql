-- 哲学家数据
INSERT INTO philosophers (id, name, name_en, name_greek, birth_year, death_year, school, school_en, region, biography, core_ideas, portrait) VALUES
('socrates', '苏格拉底', 'Socrates', 'Σωκράτης', -470, -399, '苏格拉底学派', 'Socratic', '古希腊·雅典', '苏格拉底是古希腊哲学家，西方哲学的奠基者之一。他以对话法（产婆术）著称，通过不断追问引导人们思考真理。', '["认识你自己","美德即知识","产婆术","未经审视的人生不值得过"]', '/assets/images/socrates.webp'),
('plato', '柏拉图', 'Plato', 'Πλάτων', -428, -348, '柏拉图学派', 'Platonic', '古希腊·雅典', '柏拉图是古希腊哲学家，苏格拉底的学生，亚里士多德的老师。他创立了柏拉图学园，提出了理念论。', '["理念论","洞穴隐喻","灵魂三分","哲人王"]', '/assets/images/plato.webp'),
('aristotle', '亚里士多德', 'Aristotle', 'Ἀριστοτέλης', -384, -322, '逍遥学派', 'Peripatetic', '古希腊·马其顿', '亚里士多德是古希腊哲学家，柏拉图的学生，亚历山大大帝的老师。他是百科全书式的学者。', '["四因说","中庸之道","形式逻辑","幸福论"]', '/assets/images/aristotle.webp'),
('diogenes', '第欧根尼', 'Diogenes', 'Διογένης', -412, -323, '犬儒学派', 'Cynic', '古希腊·锡诺普', '第欧根尼是古希腊犬儒学派的代表人物，以极端的简朴生活和对社会习俗的蔑视著称。', '["自足","简朴生活","回归自然","蔑视习俗"]', '/assets/images/diogenes.webp'),
('epictetus', '爱比克泰德', 'Epictetus', 'Ἐπίκτητος', 55, 135, '斯多亚学派', 'Stoic', '古罗马·希拉波利斯', '爱比克泰德是古罗马斯多亚学派哲学家，曾为奴隶。他的思想强调区分"我们能控制的"和"我们不能控制的"。', '["控制二分法","内心自由","接受命运","德行即幸福"]', '/assets/images/epictetus.webp'),
('marcus-aurelius', '马可·奥勒留', 'Marcus Aurelius', 'Μάρκος Αὐρήλιος', 121, 180, '斯多亚学派', 'Stoic', '古罗马', '马可·奥勒留是古罗马皇帝，也是斯多亚学派的重要代表人物。他在征战途中写下了《沉思录》。', '["接受命运","当下即永恒","内在城堡","责任与德行"]', '/assets/images/marcus-aurelius.webp'),
('heraclitus', '赫拉克利特', 'Heraclitus', 'Ἡράκλειτος', -535, -475, '爱菲斯学派', 'Ephesian', '古希腊·爱菲斯', '赫拉克利特是古希腊哲学家，以"万物皆流"的思想著称。他认为变化是宇宙的根本法则。', '["万物皆流","逻各斯","对立统一","火是万物之源"]', '/assets/images/heraclitus.webp'),
('epicurus', '伊壁鸠鲁', 'Epicurus', 'Ἐπίκουρος', -341, -270, '伊壁鸠鲁学派', 'Epicurean', '古希腊·萨摩斯', '伊壁鸠鲁是古希腊哲学家，伊壁鸠鲁学派的创始人。他主张快乐是人生的最高目的。', '["快乐主义","心灵宁静","原子论","友谊的重要性"]', '/assets/images/epicurus.webp')
ON CONFLICT (id) DO NOTHING;

-- 语录数据
INSERT INTO quotes (id, philosopher_id, content, content_original, source, source_work, themes, image_url, year, context, is_verified) VALUES
('socrates-001', 'socrates', '未经审视的人生是不值得过的。', NULL, '《申辩篇》', 'Apology', '["self-knowledge","wisdom","purpose"]', NULL, NULL, NULL, 1),
('socrates-002', 'socrates', '我唯一知道的，就是我一无所知。', NULL, '《申辩篇》', 'Apology', '["wisdom","knowledge"]', NULL, NULL, NULL, 1),
('socrates-003', 'socrates', '认识你自己。', NULL, '德尔斐神庙铭文', NULL, '["self-knowledge","wisdom"]', NULL, NULL, NULL, 1),
('socrates-004', 'socrates', '教育不是灌输，而是点燃火焰。', NULL, '转述自第欧根尼·拉尔修', NULL, '["education","wisdom"]', NULL, NULL, NULL, 1),
('socrates-005', 'socrates', '最聪明的人是知道自己不聪明的人。', NULL, '《申辩篇》', NULL, '["wisdom","self-knowledge"]', NULL, NULL, NULL, 1),
('plato-001', 'plato', '洞穴中的囚徒以为墙上的影子就是全部现实。', NULL, '《理想国》第七卷', 'Republic', '["truth","knowledge"]', NULL, NULL, NULL, 1),
('plato-002', 'plato', '爱是一种对美的永恒追寻。', NULL, '《会饮篇》', 'Symposium', '["happiness","virtue"]', NULL, NULL, NULL, 1),
('plato-003', 'plato', '不正义的人即使拥有全世界，也不如正义的人拥有一颗宁静的心。', NULL, '《理想国》', 'Republic', '["justice","happiness"]', NULL, NULL, NULL, 1),
('plato-004', 'plato', '哲学始于惊奇。', NULL, '《泰阿泰德篇》', NULL, '["wisdom","knowledge"]', NULL, NULL, NULL, 1),
('plato-005', 'plato', '除非哲学家成为国王，否则国家的灾难永无休止。', NULL, '《理想国》', 'Republic', '["politics","wisdom"]', NULL, NULL, NULL, 1),
('aristotle-001', 'aristotle', '幸福是灵魂的一种合乎德性的现实活动。', NULL, '《尼各马可伦理学》', 'Nicomachean Ethics', '["happiness","virtue"]', NULL, NULL, NULL, 1),
('aristotle-002', 'aristotle', '吾爱吾师，吾更爱真理。', NULL, '转述自第欧根尼·拉尔修', NULL, '["truth","wisdom"]', NULL, NULL, NULL, 1),
('aristotle-003', 'aristotle', '人是理性的动物。', NULL, '《政治学》', 'Politics', '["self-knowledge","education"]', NULL, NULL, NULL, 1),
('aristotle-004', 'aristotle', '美德是一种习惯，而不是一种天性。', NULL, '《尼各马可伦理学》', 'Nicomachean Ethics', '["virtue","education"]', NULL, NULL, NULL, 1),
('aristotle-005', 'aristotle', '中庸是美德的特征。', NULL, '《尼各马可伦理学》', 'Nicomachean Ethics', '["virtue","moderation"]', NULL, NULL, NULL, 1),
('diogenes-001', 'diogenes', '别挡我的阳光。', NULL, '第欧根尼·拉尔修《哲人言行录》', NULL, '["courage","freedom"]', NULL, NULL, NULL, 1),
('diogenes-002', 'diogenes', '我正在寻找一个人。', NULL, '第欧根尼·拉尔修《哲人言行录》', NULL, '["virtue","self-knowledge"]', NULL, NULL, NULL, 1),
('diogenes-003', 'diogenes', '财富并不能使人真正富有，真正富有的人是对财富无所求的人。', NULL, '第欧根尼·拉尔修《哲人言行录》', NULL, '["happiness","virtue"]', NULL, NULL, NULL, 1),
('epictetus-001', 'epictetus', '我们能控制的只有自己的思想、判断和欲望，其他一切都不在我们控制之中。', NULL, '《手册》', 'Enchiridion', '["fate","freedom"]', NULL, NULL, NULL, 1),
('epictetus-002', 'epictetus', '困扰人们的不是事物本身，而是人们对事物的看法。', NULL, '《手册》', 'Enchiridion', '["self-knowledge","wisdom"]', NULL, NULL, NULL, 1),
('epictetus-003', 'epictetus', '不要祈求事情如你所愿地发生，而要祈愿自己能接受事情本来的样子。', NULL, '《手册》', 'Enchiridion', '["fate","happiness"]', NULL, NULL, NULL, 1),
('marcus-aurelius-001', 'marcus-aurelius', '你所拥有的一切，都是借来的，终将归还。珍惜当下。', NULL, '《沉思录》第二卷', 'Meditations', '["time","fate"]', NULL, NULL, NULL, 1),
('marcus-aurelius-002', 'marcus-aurelius', '你的心智是你自己的宇宙。你可以随时退回到内心的宁静之中。', NULL, '《沉思录》第四卷', 'Meditations', '["self-knowledge","happiness"]', NULL, NULL, NULL, 1),
('marcus-aurelius-003', 'marcus-aurelius', '不要为你无法控制的事情悲伤，而要为你能控制的事情而努力。', NULL, '《沉思录》', 'Meditations', '["fate","courage"]', NULL, NULL, NULL, 1),
('marcus-aurelius-004', 'marcus-aurelius', '最好的报复是不要变成你的敌人。', NULL, '《沉思录》第六卷', 'Meditations', '["virtue","justice"]', NULL, NULL, NULL, 1),
('heraclitus-001', 'heraclitus', '万物皆流，无物常住。', NULL, '残篇', NULL, '["time","nature"]', NULL, NULL, NULL, 1),
('heraclitus-002', 'heraclitus', '人不能两次踏入同一条河流。', NULL, '残篇', NULL, '["time","nature"]', NULL, NULL, NULL, 1),
('heraclitus-003', 'heraclitus', '逻各斯是永恒的，但人们总是不理解它。', NULL, '残篇', NULL, '["wisdom","truth"]', NULL, NULL, NULL, 1),
('epicurus-001', 'epicurus', '不要害怕死亡。当死亡来临时，我们已经不存在了。', NULL, '《致美诺伊凯乌斯的信》', NULL, '["death","happiness"]', NULL, NULL, NULL, 1),
('epicurus-002', 'epicurus', '快乐是幸福生活的起点和终点。', NULL, '《致美诺伊凯乌斯的信》', NULL, '["happiness","virtue"]', NULL, NULL, NULL, 1),
('epicurus-003', 'epicurus', '在智慧提供给整个人生的幸福中，最重要的是获得友谊。', NULL, '《主要教义》', NULL, '["friendship","happiness"]', NULL, NULL, NULL, 1)
ON CONFLICT (id) DO NOTHING;

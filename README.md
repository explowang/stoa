# Stoa - 古希腊哲学语录网站

一个安静的数字空间：打开即是一句哲人之言与一幅意境画面。

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 导入数据

```bash
npm run import:data
```

### 启动开发服务器

```bash
npm run dev
```

这将同时启动：
- 前端: http://localhost:5173
- 后端: http://localhost:3001

## 项目结构

```
stoa/
├── client/          # React + Vite 前端
├── server/          # Node.js + Express 后端
├── package.json     # 根配置
└── README.md
```

## 功能模块

1. **首页** - 随机语录展示
2. **哲学家图鉴** - 浏览所有哲学家
3. **语录合集** - 按主题分类浏览
4. **收藏功能** - 本地收藏语录

## 技术栈

- **前端**: React 18, Vite, Tailwind CSS, Framer Motion, React Query
- **后端**: Node.js, Express, SQLite, TypeScript
- **设计**: 古典优雅风格，大量留白

## 数据来源

语录数据来自可靠的学术来源，包括：
- 柏拉图对话录
- 亚里士多德著作
- 《沉思录》
- 第欧根尼·拉尔修《哲人言行录》

## 开发命令

```bash
# 前端开发
cd client && npm run dev

# 后端开发
cd server && npm run dev

# 构建前端
cd client && npm run build

# 类型检查
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

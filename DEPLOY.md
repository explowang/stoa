# Vercel 部署指南

## 前置条件

1. **Vercel 账号**: https://vercel.com 注册
2. **Neon 数据库**: https://neon.tech 注册并创建项目
3. **Git 仓库**: 推送代码到 GitHub/GitLab

## 部署步骤

### 第一步：配置 Neon 数据库

1. 登录 Neon 控制台
2. 创建新项目
3. 复制数据库连接字符串（格式：`postgresql://...`）
4. 在 Neon SQL Editor 中运行以下 SQL 创建表：

```sql
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

CREATE INDEX IF NOT EXISTS idx_quotes_philosopher ON quotes(philosopher_id);
CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes(themes);
```

### 第二步：导入数据

在本地运行数据导入（需要先设置 DATABASE_URL 环境变量）：

```bash
cd server
export DATABASE_URL="你的Neon连接字符串"
npx tsx data/import.ts
```

或者直接在 Neon SQL Editor 中执行 `server/data/seed.sql` 文件中的 SQL。

### 第三步：部署到 Vercel

1. 将代码推送到 GitHub
2. 登录 Vercel: https://vercel.com
3. 点击 "New Project"
4. 导入你的 Git 仓库
5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`

6. 添加环境变量：
   - `DATABASE_URL`: 你的 Neon 数据库连接字符串

7. 点击 "Deploy"

### 第四步：配置域名（可选）

1. 在 Vercel 项目设置中进入 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

## 本地开发

```bash
# 安装依赖
npm install
cd client && npm install
cd ../server && npm install

# 配置环境变量
cp .env.example server/.env
# 编辑 server/.env 添加 DATABASE_URL

# 导入数据
cd server && npx tsx data/import.ts

# 启动开发服务器
cd .. && npm run dev
```

## 项目结构

```
stoa/
├── api/                    # Vercel 无服务器函数
│   └── index.ts
├── client/                 # React 前端
│   ├── src/
│   └── dist/              # 构建输出
├── server/                 # 本地开发服务器
│   ├── src/
│   └── data/
├── vercel.json            # Vercel 配置
└── package.json
```

## 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | Neon 数据库连接字符串 | 是 |
| `VITE_API_URL` | API 地址（默认 `/api`） | 否 |

## 常见问题

### 1. 数据库连接失败

确保 `DATABASE_URL` 格式正确，且包含 `?sslmode=require`

### 2. 构建失败

检查 Node.js 版本（建议 18+）

### 3. API 返回 404

确保 Vercel 部署包含 `api/` 目录下的无服务器函数

## 监控

- Vercel Dashboard 查看部署状态和日志
- Neon Dashboard 监控数据库使用情况

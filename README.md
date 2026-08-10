# 记词 · 英语学习卡片

看美剧时随手记下的生词、俚语、句子，AI 自动生成卡片（含义、日常用法、例句），并用简化的 Leitner 五盒法安排复习，避免"记了就忘"。

- 前端/后端：Next.js（App Router + TypeScript）+ Tailwind CSS
- 数据库 + 登录：[Supabase](https://supabase.com)（Postgres，邮箱/密码登录，Row Level Security 保证每个用户只看到自己的卡片）
- AI 生成：调用实验室内部 LLM 网关（[lab_llm_api](https://github.com/tjboise/lab_llm_api)，OpenAI 兼容接口，模型 `qwen3-32b`）
- 部署：Vercel

## 已知依赖 / 风险

AI 生成卡片依赖实验室本地机器 + ngrok 隧道（`LAB_LLM_BASE_URL`）保持在线。如果那台机器关机或隧道断开，**新建卡片会失败**，但已保存的卡片、卡片列表、复习功能不受影响（数据都在 Supabase）。

## 本地开发

```bash
npm install
cp .env.example .env.local   # 然后填入真实的 Supabase / LLM 配置
npm run dev
```

打开 http://localhost:3000

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（Project Settings → API） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 项目 anon public key |
| `LAB_LLM_BASE_URL` | LLM 网关地址，默认 `https://improper-faceless-savanna.ngrok-free.dev/v1` |
| `LAB_LLM_API_KEY` | LLM 网关的 API key（只在服务端使用，绝不暴露给浏览器） |
| `LAB_LLM_MODEL` | 模型名，默认 `qwen3-32b` |

## 首次搭建 Supabase

1. 在 [supabase.com](https://supabase.com) 注册并新建一个项目
2. 项目建好后，进入 **SQL Editor → New query**，粘贴并运行 [`supabase/schema.sql`](supabase/schema.sql)（建表 + 开启 Row Level Security）
3. **Project Settings → API**，把 `Project URL` 和 `anon public` key 填进 `.env.local`
4. **Authentication → Providers → Email**，可以关闭 "Confirm email"，方便小范围使用时注册后直接登录

## 部署到 Vercel

1. 在 [vercel.com](https://vercel.com) 用 GitHub 账号登录
2. Import 这个仓库
3. 在项目的 **Settings → Environment Variables** 里添加上面表格中的 5 个变量（真实值）
4. Deploy

## 数据模型 / 复习算法

见 [`supabase/schema.sql`](supabase/schema.sql)。复习用简化 Leitner 五盒法：新卡片进 1 号盒，立即可复习；点"记得"进下一盒（间隔 1/2/4/7/14 天依次变长），点"不记得"打回 1 号盒、次日再复习。

# 记词 · 英语学习卡片

看美剧时随手记下的生词、俚语、句子，AI 自动生成卡片（含义、日常用法、例句），并用 SM-2（遗忘曲线）算法安排复习，每天早上邮件提醒到期的卡片，避免"记了就忘"。

- 前端/后端：Next.js（App Router + TypeScript）+ Tailwind CSS
- 数据库 + 登录：[Supabase](https://supabase.com)（Postgres，邮箱/密码登录，Row Level Security 保证每个用户只看到自己的卡片）
- AI 生成：调用实验室内部 LLM 网关（[lab_llm_api](https://github.com/tjboise/lab_llm_api)，OpenAI 兼容接口，模型 `qwen3-32b`）
- 每日复习提醒：Vercel Cron 每天北京时间 8:00 触发，通过 Gmail SMTP 给有到期卡片的用户发邮件
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
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` secret key（绕过 RLS，只在每日提醒的 cron 任务里用，**只能存在服务端**） |
| `GMAIL_USER` | 用来发提醒邮件的 Gmail 地址 |
| `GMAIL_APP_PASSWORD` | 该 Gmail 账号的应用专用密码（不是登录密码，见下面说明） |
| `APP_URL` | 部署后的网址，例如 `https://eng-learning.vercel.app`，用来拼邮件里的复习链接 |
| `CRON_SECRET` | 随机字符串，防止别人直接调用 `/api/cron/daily-reminder` |

## 首次搭建 Supabase

1. 在 [supabase.com](https://supabase.com) 注册并新建一个项目
2. 项目建好后，进入 **SQL Editor → New query**，粘贴并运行 [`supabase/schema.sql`](supabase/schema.sql)（建表 + 开启 Row Level Security）
3. **Project Settings → API**，把 `Project URL` 和 `anon public` key 填进 `.env.local`；同一页面的 `service_role` `secret` key 填进 `SUPABASE_SERVICE_ROLE_KEY`（这个 key 权限很高，绝对不能提交进仓库或暴露给浏览器）
4. **Authentication → Providers → Email**，可以关闭 "Confirm email"，方便小范围使用时注册后直接登录

## 配置每日提醒邮件（Gmail）

1. 给要用来发信的 Gmail 账号开启两步验证（Google 账号 → 安全性 → 两步验证）
2. 开启后，去 [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) 生成一个"应用专用密码"（16 位，不带空格），填进 `GMAIL_APP_PASSWORD`；`GMAIL_USER` 就是这个 Gmail 地址
3. `CRON_SECRET` 随便生成一串随机字符串即可，例如 `openssl rand -hex 32`
4. 部署到 Vercel 后，`vercel.json` 里已经配置好每天 UTC 0:00（北京时间 8:00）触发 `/api/cron/daily-reminder`；Vercel 会自动把 `CRON_SECRET` 作为请求头带上，接口据此校验请求确实来自 Vercel Cron

## 部署到 Vercel

1. 在 [vercel.com](https://vercel.com) 用 GitHub 账号登录
2. Import 这个仓库
3. 在项目的 **Settings → Environment Variables** 里添加上面表格中的全部变量（真实值）
4. Deploy

## 数据模型 / 复习算法

见 [`supabase/schema.sql`](supabase/schema.sql)。复习用 SM-2（Ebbinghaus 遗忘曲线）算法：每张卡片记录 `ease_factor`（难度系数）、`interval_days`（当前间隔）、`repetitions`（连续记得的次数）。复习时选"忘记了/有点难/记得/很简单"四档，据此重新计算下次复习时间——记得越轻松，间隔拉得越长；忘记了就从头开始。`review_count` 记录这张卡片总共被复习过多少次，会显示在卡片列表和复习页上。

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    // Email confirmation is required by the Supabase project settings.
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <div className="text-2xl">📬</div>
          <p className="text-sm">注册成功，请查收邮件完成验证后再登录。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-sm"
      >
        <div className="space-y-1 text-center">
          <div className="text-2xl">🗂️</div>
          <h1 className="text-xl font-semibold">创建账号</h1>
          <p className="text-sm text-muted">开始记录你学到的单词和句子</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-muted">邮箱</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-muted">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-3 py-2.5 font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "注册中…" : "注册"}
        </button>

        <p className="text-center text-sm text-muted">
          已有账号？{" "}
          <Link href="/login" className="text-accent hover:underline">
            去登录
          </Link>
        </p>
      </form>
    </div>
  );
}

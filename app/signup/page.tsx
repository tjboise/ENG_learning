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
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="max-w-sm text-center text-sm">
          注册成功，请查收邮件完成验证后再登录。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10"
      >
        <h1 className="text-xl font-semibold">注册</h1>

        <div className="space-y-1">
          <label className="block text-sm">邮箱</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "注册中…" : "注册"}
        </button>

        <p className="text-center text-sm text-black/60 dark:text-white/60">
          已有账号？{" "}
          <Link href="/login" className="underline">
            去登录
          </Link>
        </p>
      </form>
    </div>
  );
}

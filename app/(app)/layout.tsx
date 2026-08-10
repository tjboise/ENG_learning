import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            记词
          </Link>
          <Link href="/" className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
            记一笔
          </Link>
          <Link href="/cards" className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
            卡片列表
          </Link>
          <Link href="/review" className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
            复习
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-black/50 dark:text-white/50">{user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </div>
  );
}

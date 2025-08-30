"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession(); // セッションと認証状態を取得

  return (
    <header className="p-4 text-white bg-gray-800 shadow-md">
      <nav className="container flex items-center justify-between mx-auto">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          securewebapp
        </Link>
        <div className="flex items-center space-x-4">
          {/* 読み込み中はUIの骨格を表示 */}
          {status === "loading" && (
            <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
          )}

          {/* 認証済みの場合 */}
          {status === "authenticated" && (
            <>
              <Link
                href="/dashboard"
                className="hidden font-medium sm:block hover:text-gray-300"
              >
                ダッシュボード
              </Link>
              <span className="hidden font-medium md:block">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1 font-semibold text-white bg-red-600 rounded hover:bg-red-700"
              >
                ログアウト
              </button>
            </>
          )}

          {/* 未認証の場合 */}
          {status === "unauthenticated" && (
            <>
              <Link href="/login" className="font-medium hover:text-gray-300">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 font-semibold text-gray-900 bg-white rounded hover:bg-gray-200"
              >
                アカウントを作成
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

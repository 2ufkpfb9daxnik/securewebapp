"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false, // リダイレクトは手動で処理
        email,
        password,
      });

      if (result?.error) {
        // authorize関数からスローされた特定のエラーを処理
        console.log("Login error:", result.error); // デバッグ

        if (
          result.error.includes("アカウントがロックされています") ||
          result.error.includes("アカウントがロックされました")
        ) {
          setError(result.error);
        } else if (
          result.error.includes("ログイン試行が多すぎます") ||
          result.error.includes("ログイン試行回数が多すぎます")
        ) {
          setError(result.error);
        } else if (result.error === "CredentialsSignin") {
          // NextAuthの標準エラー（認証失敗）
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else if (result.error === "Configuration") {
          // NextAuth設定エラー
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else if (result.error === "AccessDenied") {
          // アクセス拒否エラー
          setError("アクセスが拒否されました。");
        } else if (result.error === "Verification") {
          // 検証エラー
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else {
          // その他のエラー（日本語のカスタムエラーメッセージのみ表示）
          if (result.error.match(/[ひらがなカタカナ漢字]/)) {
            setError(result.error);
          } else {
            setError("メールアドレスまたはパスワードが正しくありません。");
          }
        }
      } else if (result?.ok) {
        // 成功した場合、指定されたページにリダイレクト
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          ログイン
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-center text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          アカウントを持っていない場合{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            アカウントを作成
          </Link>
        </p>
      </div>
    </div>
  );
}

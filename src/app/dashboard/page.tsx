import { auth } from "@/auth";
import Header from "@/components/Header";
import LoginHistory from "@/components/LoginHistory";

/**
 * ログインユーザー向けのダッシュボードページ
 * このページはmiddlewareによって保護
 */
export default async function DashboardPage() {
  // サーバーサイドでセッション情報を取得
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container p-8 mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="mt-2 text-lg text-gray-600">
          こんにちは、
          <span className="font-semibold">{session?.user?.email}</span>さん!
        </p>

        {/* ログイン履歴コンポーネントを呼び出し */}
        <LoginHistory />
      </main>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * アプリケーションのルートページ (/)
 * 認証状態に応じて /login または /dashboard へリダイレクトする
 */
export default async function HomePage() {
  // サーバーサイドでセッション情報を取得
  const session = await auth();

  if (session) {
    // ログインしている場合はダッシュボードにリダイレクト
    redirect("/dashboard");
  } else {
    // ログインしていない場合はログインページにリダイレクト
    redirect("/login");
  }

  return null; // 形式的には必要だが、ここには到達しない
}

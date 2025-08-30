import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * ログイン履歴を取得するGETハンドラ
 */
export async function GET() {
  const session = await auth();

  // ユーザーが認証されているかを確認
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // データベースからユーザーの最新10件のログイン履歴を取得
    const history = await prisma.loginHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { loginAt: 'desc' }, // 新しい順にソート
      take: 10,                      // 最新10件に制限
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Login History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


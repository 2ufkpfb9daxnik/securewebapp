import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// セキュリティ設定
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MINUTES = 15;
const LOGIN_INTERVAL_SECONDS = 2;

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
    Credentials({
        name: "Credentials",
        credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
            return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return null; // ユーザーが見つかりません
        }

        // 1. アカウントのロックを確認
        if (user.lockUntil && user.lockUntil > new Date()) {
            console.log(`Account locked for user ${email}, locked until: ${user.lockUntil}`);
            // セキュリティ上、ロック状態は表示せず一般的なエラーメッセージを返す
            return null;
        }

        // 2. ログイン間隔を確認
        const now = new Date();
        if (user.lastLoginAttemptAt && (now.getTime() - user.lastLoginAttemptAt.getTime()) < LOGIN_INTERVAL_SECONDS * 1000) {
            console.log(`Rate limit exceeded for user ${email}`);
            await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAttemptAt: now },
            });
            // セキュリティ上、レート制限も表示せず一般的なエラーメッセージを返す
            return null;
        }
        
        // パスワード確認前に最後の試行時間を更新
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAttemptAt: now },
        });

        // パスワードと保存されたハッシュを比較
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // ログイン成功時、失敗した試行回数とロック状態をリセット
            await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockUntil: null,
            },
            });
            return { id: user.id, email: user.email };
        } else {
            // ログイン失敗時、失敗した試行回数を1増やす
            const newFailedAttempts = user.failedLoginAttempts + 1;
            let lockUntil: Date | null = null;
            
            if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
                // 最大試行回数を超えた場合、アカウントをロック
                lockUntil = new Date(now.getTime() + LOCKOUT_TIME_MINUTES * 60 * 1000);
            }

            await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: newFailedAttempts,
                lockUntil: lockUntil,
            },
            });

            // ロックされた場合もコンソールログのみ
            if (lockUntil) {
                console.log(`Account locked for user ${email} after ${MAX_LOGIN_ATTEMPTS} failed attempts. Locked until: ${lockUntil}`);
            } else {
                console.log(`Failed login attempt ${newFailedAttempts}/${MAX_LOGIN_ATTEMPTS} for user ${email}`);
            }

            return null; // 認証に失敗（セキュリティ上、詳細は表示しない）
        }
        },
    }),
    ],
    session: {
    strategy: "jwt",
    },
    pages: {
    signIn: "/login",
    },
  events: {
    async signIn({ user }) {
      // ログイン成功時に履歴を記録する
      if (user.id) {
        try {
          // next/headersを使ってリクエストヘッダーを取得
          const heads = await headers();
          
          // Vercelなどのホスティング環境では 'x-forwarded-for' にIPが入ることが多い
          const ip = heads.get('x-forwarded-for') ?? 'unknown'; 
          const userAgent = heads.get('user-agent') ?? 'unknown';

          // データベースに実際の値を保存
          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              ipAddress: ip,
              userAgent: userAgent,
            }
          });
        } catch (error) {
            console.error("ログイン履歴の記録に失敗しました:", error);
        }
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
        token.id = user.id;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user) {
        session.user.id = token.id as string;
        }
        return session;
    },
    },
    secret: process.env.AUTH_SECRET,
});


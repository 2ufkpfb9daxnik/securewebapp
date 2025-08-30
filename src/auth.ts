import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// Security constants
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
            return null; // User not found
        }

        // 1. Check for account lock
        if (user.lockUntil && user.lockUntil > new Date()) {
            throw new Error(`Account locked. Try again after ${LOCKOUT_TIME_MINUTES} minutes.`);
        }

        // 2. Check login interval
        const now = new Date();
        if (user.lastLoginAttemptAt && (now.getTime() - user.lastLoginAttemptAt.getTime()) < LOGIN_INTERVAL_SECONDS * 1000) {
            await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAttemptAt: now },
            });
            throw new Error("Too many login attempts. Please wait a moment.");
        }
        
        // Update last attempt time before checking password
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAttemptAt: now },
        });

        // Compare password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // On successful login, reset failed attempts and lock status
            await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockUntil: null,
            },
            });
            return { id: user.id, email: user.email };
        } else {
            // On failed login, increment failed attempts
            const newFailedAttempts = user.failedLoginAttempts + 1;
            let lockUntil: Date | null = null;
            
            if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock account if attempts exceed the maximum
            lockUntil = new Date(now.getTime() + LOCKOUT_TIME_MINUTES * 60 * 1000);
            }

            await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: newFailedAttempts,
                lockUntil: lockUntil,
            },
            });
            
            return null; // Authentication failed
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
            console.error("Failed to record login history:", error);
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


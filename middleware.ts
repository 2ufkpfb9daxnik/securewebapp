    import NextAuth from "next-auth";
    import { authConfig } from "./auth.config";

    // NextAuthの初期化と認証ミドルウェアのエクスポート
    export default NextAuth(authConfig).auth;

    export const config = {
      // matcherはミドルウェアが適用されるルートを指定
      // ダッシュボードとそのサブルートを保護
      matcher: ["/dashboard/:path*"],
    };
    

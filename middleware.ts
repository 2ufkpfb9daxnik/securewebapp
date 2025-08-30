    import NextAuth from "next-auth";
    import { authConfig } from "./auth.config";

    // Initialize NextAuth with the configuration and export the auth middleware.
    export default NextAuth(authConfig).auth;

    export const config = {
      // The matcher specifies which routes the middleware should apply to.
      // Here, it protects the dashboard and any of its sub-routes.
      matcher: ["/dashboard/:path*"],
    };
    

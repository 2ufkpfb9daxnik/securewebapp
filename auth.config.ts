    import type { NextAuthConfig } from 'next-auth';
     
    export const authConfig = {
      pages: {
        // Redirect users to our custom login page if they are not authenticated.
        signIn: '/login',
      },
      // The providers array can be left empty here because they are defined
      // in the main auth.ts file. The middleware doesn't need to know about them.
      providers: [],
    } satisfies NextAuthConfig;
    

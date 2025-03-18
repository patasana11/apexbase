import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/lib/gsb/services/auth/auth.service';
import { logger } from '@/lib/logger';

// Extend the next-auth types to include our custom fields
declare module "next-auth" {
  interface User {
    gsbToken?: string;
    tokenExpiry?: string | undefined;
  }
  
  interface Session {
    gsbToken?: string;
    tokenExpiry?: string | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    gsbToken?: string;
    tokenExpiry?: string | undefined;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "checkbox" }
      },
      async authorize(credentials) {
        logger.debug('Authorizing credentials:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          logger.warn('Invalid credentials provided');
          throw new Error('Invalid credentials');
        }

        try {
          // In development environment, we might want to bypass the GSB auth
          if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
            logger.info('Development mode: Bypassing GSB authentication');
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              gsbToken: 'dev-token',
              tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            };
          }
          
          const authService = new AuthService();
          const tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1';
          
          // Check if we already have a token from the GSB client-side authentication
          // If so, we can skip the server-side authentication
          const existingToken = authService.getToken();
          if (existingToken) {
            logger.info('Found existing GSB token, skipping login call');
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              gsbToken: existingToken,
              tokenExpiry: undefined,
            };
          }
          
          // Otherwise, perform the login
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
            tenantCode,
            remember: credentials.remember === 'true'
          });

          logger.debug('GSB login response:', { success: response.success });

          if (!response.success) {
            logger.warn('GSB authentication failed:', response.error);
            throw new Error(response.error || 'Authentication failed');
          }

          logger.info('User authenticated successfully:', { email: credentials.email });
          return {
            id: response.userData?.userId || credentials.email,
            email: credentials.email,
            name: response.userData?.name || credentials.email.split('@')[0],
            gsbToken: response.token,
            tokenExpiry: response.userData?.expireDate,
          };
        } catch (error) {
          logger.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      logger.debug('JWT callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        provider: account?.provider 
      });

      if (account && user) {
        // Handle social login
        if (account.provider === 'google' || account.provider === 'github') {
          try {
            logger.debug('Processing social login:', { 
              provider: account.provider,
              email: user.email 
            });

            const authService = new AuthService();
            const tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1';
            
            // Use the appropriate token based on provider
            const loginData: any = {
              email: user.email!,
              tenantCode,
              remember: true
            };
            
            if (account.provider === 'google') {
              loginData.googleToken = account.access_token!;
            } else if (account.provider === 'github') {
              // GitHub might need a different approach
              loginData.githubToken = account.access_token!;
            }
            
            const response = await authService.login(loginData);

            if (response.success) {
              token.gsbToken = response.token;
              token.tokenExpiry = response.userData?.expireDate;
              logger.info('Social login successful:', { provider: account.provider });
            }
          } catch (error) {
            logger.error('GSB social auth error:', error);
          }
        }
        // Handle credentials login
        if (user.gsbToken) {
          token.gsbToken = user.gsbToken;
          token.tokenExpiry = user.tokenExpiry;
        }
      }

      return token;
    },
    async session({ session, token }) {
      logger.debug('Session callback:', { hasToken: !!token.gsbToken });
      
      if (token.gsbToken) {
        session.gsbToken = token.gsbToken;
        session.tokenExpiry = token.tokenExpiry;
      }
      return session;
    },
  },
  // Pages config - defines where auth flows should redirect
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/verify',
    newUser: '/register'
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      logger.error(code, metadata);
    },
    warn: (code) => {
      logger.warn(code);
    },
    debug: (code, metadata) => {
      logger.debug(code, metadata);
    },
  },
  events: {
    async signOut({ token }) {
      logger.info('User signing out');
      try {
        const authService = new AuthService();
        authService.logout();
        logger.debug('GSB logout successful');
      } catch (error) {
        logger.error('GSB logout error:', error);
      }
    }
  }
});

export { handler as GET, handler as POST }; 
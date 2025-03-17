import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/services/auth.service';
import { logger } from '@/lib/logger';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
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
          const authService = new AuthService();
          const tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1';
          
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
            id: response.userData?.userId,
            email: credentials.email,
            name: response.userData?.name,
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

      // Token refresh is now handled by the AuthService automatically
      // We don't need to manually refresh tokens here

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
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/verify',
    newUser: '/register'
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
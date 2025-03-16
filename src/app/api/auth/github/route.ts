import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService, SocialProvider } from '@/lib/services/registration.service';

// This is a mock implementation
// In a real app, you would use a proper OAuth flow
export async function GET(req: NextRequest) {
  try {
    // In a real implementation, this would:
    // 1. Redirect to GitHub OAuth consent screen
    // 2. Get the authorization code from the redirect
    // 3. Exchange the code for tokens
    // 4. Get the user's profile information

    // For now, we'll just simulate a successful authentication
    const mockToken = 'github_' + Math.random().toString(36).substring(2);
    const mockUserData = {
      email: 'dev@example.com',
      name: 'Dev User',
      login: 'devuser',
      avatar_url: 'https://example.com/github-avatar.jpg',
    };

    // Process the social registration
    const registrationService = RegistrationService.getInstance();
    const result = await registrationService.processSocialRegistration(
      SocialProvider.Github,
      mockToken,
      mockUserData
    );

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/registration?error=auth_failed`, req.nextUrl.origin)
      );
    }

    // If this is a new user, redirect to verification
    // Otherwise, redirect to the dashboard
    if (result.isNewUser) {
      return NextResponse.redirect(
        new URL(`/registration/verify?email=${mockUserData.email}&registrationId=${result.registrationId}`, req.nextUrl.origin)
      );
    } else {
      return NextResponse.redirect(
        new URL('/dashboard', req.nextUrl.origin)
      );
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/registration?error=auth_failed`, req.nextUrl.origin)
    );
  }
}

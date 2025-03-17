'use client';

export type SocialProvider = 'google' | 'github' | 'facebook';

class SocialAuthService {
  private googleInitialized = false;

  // Initialize Google Sign-In
  async initGoogleSignIn(callback?: (token: string) => void) {
    if (this.googleInitialized || typeof window === 'undefined') {
      return false;
    }

    try {
      // In a production app, you would load the Google Sign-In SDK
      // and initialize it with your client ID
      console.log('Initializing Google Sign-In');

      // Mock initialization for demo purposes
      this.googleInitialized = true;

      // Add a global callback for Google Sign-In
      (window as any).onGoogleSignIn = (response: any) => {
        // Process the response and get the token
        const token = response?.credential || 'mock-google-token';
        console.log('Google Sign-In response:', response);

        // Call the callback if provided
        if (callback && typeof callback === 'function') {
          callback(token);
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      return false;
    }
  }

  // Render the Google Sign-In button
  renderGoogleButton(elementId: string) {
    if (typeof window === 'undefined') return;

    console.log(`Rendering Google button in element: ${elementId}`);
    // In a real implementation, this would use Google's Sign-In API

    // Mock implementation
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <button class="flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" fill="#4285F4"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      `;

      // Add click handler
      const button = element.querySelector('button');
      if (button) {
        button.addEventListener('click', () => {
          this.login('google');
        });
      }
    }
  }

  // Initialize GitHub Sign-In
  initiateGitHubSignIn() {
    if (typeof window === 'undefined') return;

    // Redirect to the GitHub auth endpoint
    window.location.href = '/api/auth/github';
  }

  async login(provider: SocialProvider): Promise<void> {
    try {
      // In a production app, you would implement proper OAuth flow
      // For this demo, we'll redirect to our auth endpoint
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      throw error;
    }
  }

  // Helper to get the provider's display name
  getProviderName(provider: SocialProvider): string {
    const names: Record<SocialProvider, string> = {
      google: 'Google',
      github: 'GitHub',
      facebook: 'Facebook',
    };
    return names[provider] || provider;
  }

  // Helper to get the provider's icon component
  getProviderIcon(provider: SocialProvider): string {
    // In a real app, you'd use proper icon components
    // For this demo, we'll just return class names
    const icons: Record<SocialProvider, string> = {
      google: 'google',
      github: 'github',
      facebook: 'facebook',
    };
    return icons[provider];
  }
}

export const socialAuthService = new SocialAuthService();

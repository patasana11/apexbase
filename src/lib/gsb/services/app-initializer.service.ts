'use client';

import { setCommonGsbToken, setUserGsbToken, setGsbTenantCode } from '../../gsb/config/gsb-config';

// Updated Dev mode configuration with both common and user tokens
const DEV_CONFIG = {
  // Common tenant token (set to expire in 2025)
  COMMON_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0dXNlcjEyMyIsInRjIjoiY29tbW9uIiwiaSI6IjEyMzQ1Njc4IiwiZXhwIjoxNzY3ODI2NTUxLCJpc3MiOiJAZ3NiIiwicm9sZXMiOlsiYWRtaW4iXSwiZ3JvdXBzIjpbXX0.MxUQx_aGp6R2YQAFxIHUkEbw2zqP1Gbe5pq1NxrvYms',

  // User tenant token (set to expire in 2025)
  USER_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0dXNlcjEyMyIsInRjIjoiYXBleGJhc2UiLCJpIjoiMTIzNDU2NzgiLCJleHAiOjE3Njc4MjY1NTEsImlzcyI6IkBnc2IiLCJyb2xlcyI6WyJhZG1pbiJdLCJncm91cHMiOltdfQ.xAc9Bp9q1TfsXcCBvnSGF9QP9iWqZRKBcw8qfYVIaYs',

  TENANT_CODE: 'apexbase',
  COMMON_TENANT_CODE: 'common'
};

export interface AppInitializerConfig {
  devMode?: boolean;
  enableMultiTenant?: boolean;
}

export class AppInitializerService {
  private static instance: AppInitializerService;
  private initialized: boolean = false;
  private config: AppInitializerConfig;

  private constructor(config: AppInitializerConfig = {}) {
    this.config = {
      devMode: process.env.NODE_ENV === 'development',
      enableMultiTenant: process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true',
      ...config
    };
  }

  public static getInstance(config?: AppInitializerConfig): AppInitializerService {
    if (!AppInitializerService.instance) {
      AppInitializerService.instance = new AppInitializerService(config);
    }
    return AppInitializerService.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      console.log('App already initialized');
      return;
    }

    try {
      if (this.config.devMode) {
        console.log('Initializing app in dev mode');
        this.initializeDevMode();
      } else {
        console.log('Initializing app in production mode');
        // Production initialization logic can be added here
      }

      this.initialized = true;
      console.log('App initialization completed successfully');
    } catch (error) {
      console.error('Error during app initialization:', error);
      throw error;
    }
  }

  private initializeDevMode(): void {
    console.log('Setting up dev mode configuration...');

    if (this.config.enableMultiTenant) {
      console.log('Setting up multi-tenant dev mode with common and user tokens');

      // Set the common GSB token
      setCommonGsbToken(DEV_CONFIG.COMMON_TOKEN);

      // Set the user GSB token and tenant code
      setUserGsbToken(DEV_CONFIG.USER_TOKEN);
      setGsbTenantCode(DEV_CONFIG.TENANT_CODE);

      // Parse and log token information for debugging
      try {
        const commonTokenPayload = JSON.parse(atob(DEV_CONFIG.COMMON_TOKEN.split('.')[1]));
        const userTokenPayload = JSON.parse(atob(DEV_CONFIG.USER_TOKEN.split('.')[1]));

        console.log('Dev mode common token info:', {
          tenantCode: commonTokenPayload.tc,
          userId: commonTokenPayload.uid,
          expiry: new Date(commonTokenPayload.exp * 1000).toLocaleString()
        });

        console.log('Dev mode user token info:', {
          tenantCode: userTokenPayload.tc,
          userId: userTokenPayload.uid,
          expiry: new Date(userTokenPayload.exp * 1000).toLocaleString()
        });
      } catch (error) {
        console.error('Error parsing dev tokens:', error);
      }
    } else {
      console.log('Setting up single-tenant dev mode');

      // Set the GSB token and tenant code (legacy mode)
      setCommonGsbToken(DEV_CONFIG.USER_TOKEN);
      setGsbTenantCode(DEV_CONFIG.TENANT_CODE);

      // Parse and log token information for debugging
      try {
        const tokenPayload = JSON.parse(atob(DEV_CONFIG.USER_TOKEN.split('.')[1]));
        console.log('Dev mode token info:', {
          tenantCode: tokenPayload.tc,
          userId: tokenPayload.uid,
          expiry: new Date(tokenPayload.exp * 1000).toLocaleString()
        });
      } catch (error) {
        console.error('Error parsing dev token:', error);
      }
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getConfig(): AppInitializerConfig {
    return { ...this.config };
  }
}

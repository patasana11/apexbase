'use client';

import { setGsbToken, setGsbTenantCode } from '../../gsb/config/gsb-config';

// Updated Dev mode configuration with a fresh token
const DEV_CONFIG = {
  // This is a development-only token with a longer expiry (set to expire in 2025)
  APEXBASE_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0dXNlcjEyMyIsInRjIjoiYXBleGJhc2UiLCJpIjoiMTIzNDU2NzgiLCJleHAiOjE3Njc4MjY1NTEsImlzcyI6IkBnc2IiLCJyb2xlcyI6WyJhZG1pbiJdLCJncm91cHMiOltdfQ.xAc9Bp9q1TfsXcCBvnSGF9QP9iWqZRKBcw8qfYVIaYs',
  TENANT_CODE: 'apexbase'
};

export interface AppInitializerConfig {
  devMode?: boolean;
}

export class AppInitializerService {
  private static instance: AppInitializerService;
  private initialized: boolean = false;
  private config: AppInitializerConfig;

  private constructor(config: AppInitializerConfig = {}) {
    this.config = {
      devMode: process.env.NODE_ENV === 'development',
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

    // Set the GSB token and tenant code
    setGsbToken(DEV_CONFIG.APEXBASE_TOKEN);
    setGsbTenantCode(DEV_CONFIG.TENANT_CODE);

    // Parse and log token information for debugging
    try {
      const tokenPayload = JSON.parse(atob(DEV_CONFIG.APEXBASE_TOKEN.split('.')[1]));
      console.log('Dev mode token info:', {
        tenantCode: tokenPayload.tc,
        userId: tokenPayload.uid,
        expiry: new Date(tokenPayload.exp * 1000).toLocaleString()
      });
    } catch (error) {
      console.error('Error parsing dev token:', error);
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getConfig(): AppInitializerConfig {
    return { ...this.config };
  }
}

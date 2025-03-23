'use client';

import { setCommonGsbToken, setUserGsbToken, setGsbTenantCode } from '../../gsb/config/gsb-config';
import { AuthService } from '../services/auth/auth.service';

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
      // Initialize authentication service
      const authService = AuthService.getInstance();
      authService.initFromStorage();
      
      this.initialized = true;
      console.log('App initialization completed successfully');
    } catch (error) {
      console.error('Error during app initialization:', error);
      throw error;
    }
  }


  public isInitialized(): boolean {
    return this.initialized;
  }

  public getConfig(): AppInitializerConfig {
    return { ...this.config };
  }
}

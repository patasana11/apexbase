import { setGsbToken, setGsbTenantCode } from '../config/gsb-config';

// Dev mode configuration
const DEV_CONFIG = {
  APEXBASE_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImFwZXhiYXNlIiwiaSI6IjU0NDg0MDA5IiwiZXhwIjoxNzQzMjg5MzQzLCJpc3MiOiJAZ3NiIn0.YjDY4MR4PcxQvc8RYc22Rga_unypeQmceyDMDrBYsls',
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
'use client';

interface EnvConfig {
  azure: {
    openai: {
      apiKey: string | null;
      endpoint: string | null;
      deploymentId: string | null;
    };
  };
  gsb: {
    // Base domain for GSB apps
    baseDomain: string;
    // Common tenant code (typically 'common')
    commonTenant: string;
    // API endpoints
    api: {
      // Base API URL without tenant prefix
      baseUrl: string;
      // Full API URL for common tenant
      commonUrl: string;
    };
    // Authentication settings
    auth: {
      // Social auth public keys
      social: {
        googleClientId: string | null;
        facebookAppId: string | null;
        appleClientId: string | null;
      };
    };
    // Multi-tenant settings
    multiTenant: {
      enabled: boolean;
    };
  };
}

// Default fallback values (non-sensitive)
const defaultConfig: EnvConfig = {
  azure: {
    openai: {
      apiKey: null,
      endpoint: null,
      deploymentId: 'gpt-4', // Default deployment name
    },
  },
  gsb: {
    baseDomain: 'gsbapps.net',
    commonTenant: 'common',
    api: {
      baseUrl: 'https://{tenant}.gsbapps.net',
      commonUrl: 'https://common.gsbapps.net',
    },
    auth: {
      social: {
        googleClientId: null,
        facebookAppId: null,
        appleClientId: null,
      }
    },
    multiTenant: {
      enabled: false,
    }
  }
};

// Load configuration from environment variables
export const envConfig: EnvConfig = {
  azure: {
    openai: {
      apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || null,
      endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || null,
      deploymentId: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_ID || defaultConfig.azure.openai.deploymentId,
    },
  },
  gsb: {
    baseDomain: process.env.NEXT_PUBLIC_GSB_BASE_DOMAIN || defaultConfig.gsb.baseDomain,
    commonTenant: process.env.NEXT_PUBLIC_GSB_COMMON_TENANT || defaultConfig.gsb.commonTenant,
    api: {
      baseUrl: process.env.NEXT_PUBLIC_GSB_API_BASE_URL || defaultConfig.gsb.api.baseUrl,
      // Generate URL with the common tenant code
      get commonUrl() {
        const baseUrl = envConfig.gsb.api.baseUrl.replace('{tenant}', envConfig.gsb.commonTenant);
        return process.env.NEXT_PUBLIC_GSB_COMMON_API_URL || baseUrl;
      }
    },
    auth: {
      social: {
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null,
        facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || null,
        appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || null,
      }
    },
    multiTenant: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true',
    }
  },
};

// Helper function to construct a tenant-specific API URL
export function getTenantApiUrl(tenantCode: string): string {
  if (!tenantCode) {
    throw new Error('Tenant code is required for API URL construction');
  }
  
  return envConfig.gsb.api.baseUrl.replace('{tenant}', tenantCode);
}

// Helper function to check if Azure OpenAI is configured
export function isAzureOpenAIConfigured(): boolean {
  return !!(
    envConfig.azure.openai.apiKey &&
    envConfig.azure.openai.endpoint &&
    envConfig.azure.openai.deploymentId
  );
}

// Helper function to get Azure OpenAI configuration
export function getAzureOpenAIConfig() {
  return envConfig.azure.openai;
}

// Helper function to get GSB API configuration
export function getGSBConfig() {
  return envConfig.gsb;
}

export default envConfig;

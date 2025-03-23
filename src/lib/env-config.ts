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
    apiUrl: string;
    tenantCode: string;
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
    apiUrl: 'https://dev1.gsbapps.net',
    tenantCode: 'apexbase',
  },
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
    apiUrl: process.env.APEXBASE_GSB_API_URL || defaultConfig.gsb.apiUrl,
    tenantCode: process.env.APEXBASE_GSB_TENANT_CODE || defaultConfig.gsb.tenantCode,
  },
};

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

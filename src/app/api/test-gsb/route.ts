import { NextResponse } from 'next/server';
import { getGsbToken, GSB_CONFIG } from '@/lib/gsb/config/gsb-config';

/**
 * Test GSB API route
 *
 * This API route tests the GSB API connection and token management.
 * It includes information about both common and user tokens.
 */
export async function GET() {
  try {
    // Get the different tokens based on path context
    const commonToken = getGsbToken('/api/auth/login');
    const userToken = getGsbToken('/dashboard');

    // Get token information
    const commonTokenInfo = extractTokenInfo(commonToken);
    const userTokenInfo = extractTokenInfo(userToken);

    // Multi-tenant status
    const isMultiTenant = GSB_CONFIG.ENABLE_MULTI_TENANT;

    // Test API connection
    const apiResult = await testApiConnection(userToken);

    return NextResponse.json({
      success: true,
      message: 'GSB test completed successfully',
      multiTenant: {
        enabled: isMultiTenant,
        commonToken: {
          truncated: truncateToken(commonToken),
          ...commonTokenInfo
        },
        userToken: {
          truncated: truncateToken(userToken),
          ...userTokenInfo
        }
      },
      api: apiResult
    });
  } catch (error) {
    console.error('GSB test error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Test the GSB API connection
 */
async function testApiConnection(token: string) {
  // For development, we'll just return a success response
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
    return {
      url: 'Development mode - No actual API call made',
      status: 200,
      ok: true,
      data: {
        message: 'Development mode simulated successful response'
      }
    };
  }

  try {
    const tenantCode = extractTenantFromToken(token);
    const baseUrl = `https://${tenantCode || 'apexbase'}.gsbapps.net`;
    const url = `${baseUrl}/api/health`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.text();
    let parsedData;

    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    return {
      url,
      status: response.status,
      ok: response.ok,
      data: parsedData
    };
  } catch (error) {
    return {
      url: 'Error making API call',
      status: 500,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract information from a JWT token
 */
function extractTokenInfo(token: string) {
  try {
    if (!token) return { valid: false };

    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const payload = JSON.parse(atob(parts[1]));
    return {
      valid: true,
      tenantCode: payload.tc || 'not set',
      userId: payload.uid || 'not set',
      expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'not set',
      roles: payload.roles || []
    };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid token format'
    };
  }
}

/**
 * Extract tenant code from token
 */
function extractTenantFromToken(token: string): string | undefined {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tc;
  } catch {
    return undefined;
  }
}

/**
 * Truncate token for display
 */
function truncateToken(token: string): string {
  if (!token) return '';
  if (token.length <= 20) return token;
  return token.substring(0, 10) + '...' + token.substring(token.length - 10);
}

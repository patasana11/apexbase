'use client';

import { useState, useEffect } from 'react';
import { getGsbToken } from '@/lib/gsb/config/gsb-config';
import { AuthService } from '@/lib/gsb/services/auth/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TokenDisplay() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [authPath, setAuthPath] = useState<string>('/api/auth/login');
  const [dashboardPath, setDashboardPath] = useState<string>('/dashboard/database');
  const [authToken, setAuthToken] = useState<string>('');
  const [dashboardToken, setDashboardToken] = useState<string>('');
  const [commonToken, setCommonToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');

  // Get the authentication service
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);

      // Get tokens for different paths
      setAuthToken(getGsbToken('/api/auth/login'));
      setDashboardToken(getGsbToken('/dashboard/database'));

      // Get tokens from localStorage
      setCommonToken(localStorage.getItem('gsb_common_token') || '');
      setUserToken(localStorage.getItem('gsb_user_token') || '');
    }
  }, []);

  function truncateToken(token: string): string {
    if (!token) return 'Not set';
    if (token.length <= 20) return token;
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
  }

  function extractTenantFromToken(token: string): string {
    try {
      if (!token) return 'N/A';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tc || 'N/A';
    } catch (e) {
      return 'Invalid token';
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Token GSB Configuration</CardTitle>
          <CardDescription>
            This page demonstrates the token selection based on URL path
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">Current Path:</p>
            <p className="text-green-600 dark:text-green-400">{currentPath}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-md">
              <p className="font-semibold mb-2">Common Token: <Badge variant="outline">common</Badge></p>
              <p className="text-xs overflow-hidden text-ellipsis">{truncateToken(commonToken)}</p>
              <p className="text-xs mt-1">Tenant: {extractTenantFromToken(commonToken)}</p>
            </div>

            <div className="border p-4 rounded-md">
              <p className="font-semibold mb-2">User Token: <Badge variant="outline">user</Badge></p>
              <p className="text-xs overflow-hidden text-ellipsis">{truncateToken(userToken)}</p>
              <p className="text-xs mt-1">Tenant: {extractTenantFromToken(userToken)}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Path-Based Token Selection:</h3>

            <div className="border p-4 rounded-md">
              <p className="font-semibold mb-2">Auth Path: <span className="text-blue-600">{authPath}</span></p>
              <p className="text-xs">Selected Token: {truncateToken(authToken)}</p>
              <p className="text-xs mt-1">Tenant: {extractTenantFromToken(authToken)}</p>
            </div>

            <div className="border p-4 rounded-md">
              <p className="font-semibold mb-2">Dashboard Path: <span className="text-blue-600">{dashboardPath}</span></p>
              <p className="text-xs">Selected Token: {truncateToken(dashboardToken)}</p>
              <p className="text-xs mt-1">Tenant: {extractTenantFromToken(dashboardToken)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

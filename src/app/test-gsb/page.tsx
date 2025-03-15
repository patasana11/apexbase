"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function TestGSB() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-gsb');

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error testing GSB connection:', err);
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Run test on initial load
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">GSB API Connection Test</h1>

      <Button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                Test Result: {result.success ? 'Success' : 'Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold mb-2">Token Information</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(result.token, null, 2)}
                </pre>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-bold mb-2">API Response</h3>
              <p className="mb-2">URL: {result.api?.url}</p>
              <p className="mb-2">Status: {result.api?.status}</p>
              <p className="mb-2">Success: {result.api?.ok ? 'Yes' : 'No'}</p>

              <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {typeof result.api?.data === 'object'
                    ? JSON.stringify(result.api.data, null, 2)
                    : result.api?.data}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

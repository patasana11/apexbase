import { NextResponse } from 'next/server';

// Constants for GSB access
const GSB_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImRldjEiLCJpIjoiOThCNUU0OUQiLCJleHAiOjE3NDMwMDcwMzQsImlzcyI6IkBnc2IifQ.0WImy6Y1XmC0RwJPG-Y3teTlAA4wL17rgDYARyySciQ";
const GSB_TENANT = "dev1";
const GSB_API_URL = `https://${GSB_TENANT}.gsbapps.net`;

export async function GET(request: Request) {
  try {
    // Parse token
    const tokenParts = GSB_TOKEN.split('.');

    let tokenInfo = null;
    if (tokenParts.length === 3) {
      try {
        tokenInfo = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      } catch (e) {
        tokenInfo = { error: 'Failed to parse token payload' };
      }
    }

    // Test connection to GSB API
    const response = await fetch(`${GSB_API_URL}/api/entity/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GSB_TOKEN}`
      },
      body: JSON.stringify({
        entDefName: 'GsbEntityDef',
        startIndex: 0,
        count: 3,
        calcTotalCount: true
      })
    });

    const responseStatus = response.status;
    const responseOk = response.ok;

    let responseData = null;
    try {
      if (response.ok) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (e) {
      responseData = { error: 'Failed to parse response' };
    }

    return NextResponse.json({
      success: response.ok,
      token: {
        valid: tokenParts.length === 3,
        info: tokenInfo
      },
      api: {
        url: GSB_API_URL,
        status: responseStatus,
        ok: responseOk,
        data: responseData
      }
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

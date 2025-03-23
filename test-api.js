// Simple script to test GSB API access
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImRldjEiLCJpIjoiOThCNUU0OUQiLCJleHAiOjE3NDMwMDcwMzQsImlzcyI6IkBnc2IifQ.0WImy6Y1XmC0RwJPG-Y3teTlAA4wL17rgDYARyySciQ";
const tenantCode = "dev1";

// Get base domain from environment or use default
const baseDomain = process.env.NEXT_PUBLIC_GSB_BASE_DOMAIN || 'gsbapps.net';
const baseUrl = `https://${tenantCode}.${baseDomain}`;

// Parse JWT token to see its contents
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Make a query to the entity endpoint
async function queryEntities() {
  try {
    console.log('Token payload:', parseJwt(token));
    console.log('Querying entities from:', `${baseUrl}/api/entity/query`);

    const query = {
      entDefName: 'GsbEntityDef',
      startIndex: 0,
      count: 10,
      calcTotalCount: true
    };

    const response = await fetch(`${baseUrl}/api/entity/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Query response successful');
    console.log('Entities count:', data.entities?.length || 0);
    console.log('Total count:', data.totalCount || 0);

    if (data.entities?.length > 0) {
      console.log('First entity sample:', JSON.stringify(data.entities[0], null, 2));
    }
  } catch (error) {
    console.error('Error querying entities:', error);
  }
}

// Run the test
queryEntities();

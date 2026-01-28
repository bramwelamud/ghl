import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Getting token from CREA...');
    
    // Get token
    const tokenResponse = await fetch("https://identity.crea.ca/connect/token", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: 'PfSfzRj7UaVnevOYtmYopvGK',
        client_secret: 'wMzcKq7pgBnvHTqcz0UaW0Vz',
        grant_type: 'client_credentials',
        scope: 'DDFApi_Read'
      })
    });

    if (!tokenResponse.ok) {
      console.error('Token request failed:', tokenResponse.status);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to get access token',
        details: await tokenResponse.text()
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('Got token, fetching properties...');

    // Get properties
    const ddfResponse = await fetch("https://ddfapi.realtor.ca/odata/v1/Property?\$top=100", {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!ddfResponse.ok) {
      console.error('DDF request failed:', ddfResponse.status);
      return res.status(ddfResponse.status).json({ 
        error: 'Failed to fetch properties',
        details: await ddfResponse.text()
      });
    }

    const data = await ddfResponse.json();
    console.log(`Successfully fetched ${data.value?.length || 0} properties`);
    
    return res.status(200).json(data.value || []);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const credentials = {
    client_id: 'PfSfzRj7UaVnevOYtmYopvGK',
    client_secret: 'wMzcKq7pgBnvHTqcz0UaW0Vz',
    grant_type: 'client_credentials',
    scope: 'DDFApi_Read'
  };

  try {
    // Step 1: Get Access Token
    const tokenResponse = await fetch("https://identity.crea.ca/connect/token", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(credentials)
    });
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // Step 2: Fetch Data from DDF
    const ddfResponse = await fetch("https://ddfapi.realtor.ca/odata/v1/Property", {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      }
    });
    
    const data = await ddfResponse.json();
    res.status(200).json(data.value);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

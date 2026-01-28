import fetch from 'node-fetch';

async function getPropertyData() {
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
    console.log('Token received');

    // Step 2: Fetch Data from DDF
    const ddfResponse = await fetch("https://ddfapi.realtor.ca/odata/v1/Property", {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      }
    });
    
    const data = await ddfResponse.json();
    console.log('Properties fetched:', data.value.length);
    return data.value;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Run the function
getPropertyData()
  .then(data => console.log('Success!'))
  .catch(error => console.error('Failed:', error));

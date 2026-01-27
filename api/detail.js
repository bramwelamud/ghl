import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  const credentials = {
    client_id: 'PfSfzRj7UaVnevOYtmYopvGK',
    client_secret: 'wMzcKq7pgBnvHTqcz0UaW0Vz',
    grant_type: 'client_credentials',
    scope: 'DDFApi_Read'
  };

  try {
    const tokenResponse = await fetch("https://identity.crea.ca/connect/token", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(credentials)
    });
    const { access_token } = await tokenResponse.json();

    const ddfResponse = await fetch(`https://ddfapi.realtor.ca/odata/v1/Property('${id}')`, {
      headers: { 'Authorization': `Bearer ${access_token}`, 'Accept': 'application/json' }
    });
    
    const data = await ddfResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

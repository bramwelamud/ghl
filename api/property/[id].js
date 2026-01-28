// api/property/[id].js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { id } = req.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'Property ID is required' });
    }
    
    try {
        console.log(`Fetching token for property ID: ${id}...`);
        
        // Get token from CREA
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
            throw new Error(`Failed to get access token: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('Got token, fetching property...');

        // Fetch property from CREA DDF API
        const ddfResponse = await fetch(`https://ddfapi.realtor.ca/odata/v1/Property('${id}')`, {
            headers: { 
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!ddfResponse.ok) {
            console.error(`DDF request failed for ${id}:`, ddfResponse.status);
            throw new Error(`Failed to fetch property: ${ddfResponse.status}`);
        }

        const property = await ddfResponse.json();
        console.log(`Successfully fetched property: ${id}`);
        
        return res.status(200).json(property);

    } catch (error) {
        console.error('Error fetching property:', error);
        
        // Return error response
        return res.status(500).json({ 
            error: 'Failed to fetch property',
            message: error.message,
            id: id
        });
    }
}

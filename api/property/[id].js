// api/property/[id].js
export default async function handler(req, res) {
    const { id } = req.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Fetch from your actual API endpoint
        const apiResponse = await fetch(`https://ddfapi.realtor.ca/odata/v1/Property(${id})`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!apiResponse.ok) {
            throw new Error(`API returned ${apiResponse.status}: ${apiResponse.statusText}`);
        }
        
        const property = await apiResponse.json();
        
        // Return the full property data
        return res.status(200).json(property);
        
    } catch (error) {
        console.error('Error fetching property:', error);
        
        // Return mock data for testing if API fails
        return res.status(200).json({
            // Your complete JSON data goes here
            // This is a fallback for development
            "@odata.context": "https://ddfapi.realtor.ca/odata/v1/$metadata#Property/$entity",
            "ListingKey": id,
            "PropertySubType": "Retail",
            "TotalActualRent": 15,
            // ... rest of your data
        });
    }
}

<script>
async function loadListings() {
    try {
        const grid = document.getElementById('listings-grid');
        
        // STEP 1: Get token directly in browser (INSECURE!)
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
        
        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;
        
        // STEP 2: Fetch properties
        const ddfResponse = await fetch("https://ddfapi.realtor.ca/odata/v1/Property", {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json' 
            }
        });
        
        const data = await ddfResponse.json();
        const properties = data.value;
        
        // Rest of your rendering code...
        if (!properties || properties.length === 0) {
            grid.innerHTML = '<div class="error">No properties found</div>';
            return;
        }
        
        grid.innerHTML = properties.map(p => {
            // ... your template rendering code ...
        }).join('');
        
    } catch (error) {
        console.error('Error loading listings:', error);
        document.getElementById('listings-grid').innerHTML = 
            '<div class="error">Error loading properties. Please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadListings);
</script>

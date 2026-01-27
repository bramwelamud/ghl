import fetch from 'node-fetch';

const DDF_AUTH = Buffer.from("PfSfzRj7UaVnevOYtmYopvGK:wMzcKq7pgBnvHTqcz0UaW0Vz").toString("base64");

export default async function handler(req, res) {
  try {
    const response = await fetch("https://ddfapi.realtor.ca/odata/Property", {
      headers: { 'Authorization': `Basic ${DDF_AUTH}` }
    });
    
    const data = await response.json();
    const listings = data.value || [];

    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
            .card { border: 1px solid #ddd; width: 250px; padding: 10px; border-radius: 8px; }
            img { width: 100%; border-radius: 4px; }
            a { display: inline-block; margin-top: 10px; color: blue; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          ${listings.map(item => `
            <div class="card">
              <img src="${item.Photo ? item.Photo[0].MediaURL : 'https://via.placeholder.com/250'}">
              <h3>$${item.Price}</h3>
              <p>${item.Address}, ${item.City}</p>
              <a href="/property/${item.ID}">View Details</a>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("Error loading listings: " + err.message);
  }
}

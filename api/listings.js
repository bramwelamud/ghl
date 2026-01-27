// /api/listings.js
import fetch from "node-fetch";

const DDF_USERNAME = "PfSfzRj7UaVnevOYtmYopvGK";
const DDF_PASSWORD = "wMzcKq7pgBnvHTqcz0UaW0Vz";

export default async function handler(req, res) {
  const { id } = req.query;
  
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://*.gohighlevel.com"
  );

  try {
    if (id) {
      // Handle single listing view
      const response = await fetch(
        `https://ddfapi.realtor.ca/odata/Property(${id})`,
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${DDF_USERNAME}:${DDF_Password}`).toString("base64"),
          },
        }
      );

      const l = await response.json();
      
      // Generate single listing HTML
      const html = `
        <html>
          <head>
            <title>${l.PropertyType} - $${l.Price}</title>
          </head>
          <body>
            <h1>${l.PropertyType} - $${l.Price}</h1>
            <img src="${
              l.Photo ? l.Photo[0].MediaURL : "https://via.placeholder.com/500"
            }" />
            <p>${l.Address}, ${l.City}, ${l.Province}</p>
            <p>${l.Description || ""}</p>
            <a href="/api/listings">Back to Listings</a>
            <footer style="margin-top:20px; font-size:12px;">
              Data courtesy of the Canadian Real Estate Association (CREA).<br/>
              Information deemed reliable but not guaranteed.
            </footer>
          </body>
        </html>
      `;

      return res.status(200).send(html);
    } else {
      // Handle listings index page
      const response = await fetch(
        "https://ddfapi.realtor.ca/odata/Property",
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${DDF_USERNAME}:${DDF_PASSWORD}`).toString("base64"),
          },
        }
      );

      const data = await response.json();
      const listings = data.value || [];

      // Generate HTML cards
      const html = `
        <html>
        <head>
          <title>Property Listings</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .grid { display: flex; flex-wrap: wrap; gap: 20px; }
            .card { border: 1px solid #ccc; width: 300px; padding: 10px; }
            img { width: 100%; height: 200px; object-fit: cover; }
            h2 { margin: 10px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Property Listings</h1>
          <div class="grid">
            ${listings
              .map(
                (l) => `
              <div class="card">
                <img src="${
                  l.Photo ? l.Photo[0].MediaURL : "https://via.placeholder.com/300"
                }" />
                <h2>${l.PropertyType} - $${l.Price}</h2>
                <p>${l.Address}, ${l.City}, ${l.Province}</p>
                <a href="/api/listings?id=${l.Id || l.ListingId}">View Details</a>
              </div>
            `
              )
              .join("")}
          </div>
          <footer style="margin-top:20px; font-size:12px;">
            Data courtesy of the Canadian Real Estate Association (CREA).<br/>
            Information deemed reliable but not guaranteed.
          </footer>
        </body>
        </html>
      `;

      return res.status(200).send(html);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error fetching data.");
  }
}

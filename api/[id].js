import fetch from "node-fetch";

const DDF_USERNAME = "PfSfzRj7UaVnevOYtmYopvGK";
const DDF_PASSWORD = "wMzcKq7pgBnvHTqcz0UaW0Vz";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.gohighlevel.com"
    );

    const response = await fetch(
      `https://ddfapi.realtor.ca/odata/Property(${id})`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${DDF_USERNAME}:${DDF_PASSWORD}`).toString("base64"),
        },
      }
    );

    const l = await response.json();

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

    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching listing details.");
  }
}
